import { Platform } from "react-native";
import {
  FirebaseError,
} from "firebase/app";
import {
  Auth,
  GoogleAuthProvider,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  onIdTokenChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import {
  Firestore,
  Unsubscribe,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import {
  getFirebaseClientAuth,
  getFirebaseClientDb,
  getFirebaseMissingEnvKeys,
  hasFirebaseClientConfig,
} from "@/lib/firebase";

type JsonRecord = Record<string, unknown>;
type Maybe<T> = T | null;

type SupabaseLikeError = {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
  status?: number;
};

type SupabaseLikeResponse<T = any> = {
  data: T;
  error: SupabaseLikeError | null;
  count?: number | null;
};

type QueryAction = "select" | "insert" | "update" | "delete" | "upsert";
type SingleMode = "none" | "single" | "maybeSingle";

type QueryFilter = {
  type: "eq" | "neq" | "in" | "ilike";
  column: string;
  value: unknown;
};

type QueryOrder = {
  column: string;
  ascending: boolean;
};

type SelectOptions = {
  count?: "exact";
  head?: boolean;
};

type RealtimePayload = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: JsonRecord | null;
  old: JsonRecord | null;
};

type RealtimeHandler = {
  event: string;
  filter: {
    event?: string;
    schema?: string;
    table?: string;
  };
  callback: (payload: RealtimePayload) => void;
};

type AuthChangeEvent = "SIGNED_IN" | "SIGNED_OUT" | "TOKEN_REFRESHED" | "USER_UPDATED";

const AUTH_METADATA_COLLECTION = "auth_users_metadata";

const RELATION_MAP: Record<string, Record<string, { table: string; foreignKey: string }>> = {
  quests: {
    spots: { table: "spots", foreignKey: "quest_id" },
  },
};

export type AuthUser = {
  id: string;
  email: string | null;
  user_metadata: JsonRecord;
  created_at: string | null;
  last_sign_in_at: string | null;
};

type AuthSession = {
  user: AuthUser;
  access_token: string | null;
  refresh_token: string | null;
};

type SignUpParams = {
  email: string;
  password: string;
  options?: {
    data?: JsonRecord;
  };
};

type SignInPasswordParams = {
  email: string;
  password: string;
};

type SignInIdTokenParams = {
  provider: "google";
  token: string;
  access_token?: string;
  nonce?: string;
};

type SignInOAuthParams = {
  provider: "google";
  options?: {
    redirectTo?: string;
    skipBrowserRedirect?: boolean;
  };
};

type SetSessionParams = {
  access_token: string;
  refresh_token: string;
};

type UpdateUserParams = {
  data?: JsonRecord;
};

type OnAuthStateChangeCallback = (event: AuthChangeEvent, session: AuthSession | null) => void;

const asRecord = (value: unknown): JsonRecord => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as JsonRecord;
};

const normalizeString = (value: unknown) => {
  if (typeof value !== "string") return "";
  return value.trim();
};

const nowIso = () => new Date().toISOString();

const toError = (
  error: unknown,
  fallbackMessage = "Unknown error",
  fallbackCode = "UNKNOWN_ERROR"
): SupabaseLikeError => {
  if (error instanceof FirebaseError) {
    return {
      message: error.message || fallbackMessage,
      code: error.code || fallbackCode,
    };
  }
  if (error && typeof error === "object") {
    const asObj = error as Record<string, unknown>;
    return {
      message:
        (typeof asObj.message === "string" && asObj.message) ||
        fallbackMessage,
      code: typeof asObj.code === "string" ? asObj.code : fallbackCode,
      details: typeof asObj.details === "string" ? asObj.details : undefined,
      hint: typeof asObj.hint === "string" ? asObj.hint : undefined,
      status: typeof asObj.status === "number" ? asObj.status : undefined,
    };
  }
  return { message: fallbackMessage, code: fallbackCode };
};

const makeError = (message: string, code: string, status?: number): SupabaseLikeError => ({
  message,
  code,
  status,
});

const splitTopLevelComma = (input: string) => {
  const out: string[] = [];
  let buffer = "";
  let depth = 0;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (char === "(") {
      depth += 1;
      buffer += char;
      continue;
    }
    if (char === ")") {
      depth = Math.max(0, depth - 1);
      buffer += char;
      continue;
    }
    if (char === "," && depth === 0) {
      const token = buffer.trim();
      if (token) out.push(token);
      buffer = "";
      continue;
    }
    buffer += char;
  }

  const tail = buffer.trim();
  if (tail) out.push(tail);
  return out;
};

const normalizeFirestoreValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeFirestoreValue(item));
  }
  if (value && typeof value === "object") {
    const maybeTimestamp = value as { toDate?: () => Date };
    if (typeof maybeTimestamp.toDate === "function") {
      const date = maybeTimestamp.toDate();
      return date.toISOString();
    }

    const out: JsonRecord = {};
    Object.entries(value as JsonRecord).forEach(([key, item]) => {
      out[key] = normalizeFirestoreValue(item);
    });
    return out;
  }
  return value;
};

const mapDocToRow = (docId: string, value: unknown): JsonRecord => {
  const row = asRecord(normalizeFirestoreValue(value));
  if (!normalizeString(row.id)) {
    row.id = docId;
  }
  return row;
};

const sqlLikeToRegex = (pattern: string) => {
  let source = "";
  let escaping = false;

  for (let index = 0; index < pattern.length; index += 1) {
    const char = pattern[index];
    if (escaping) {
      source += char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      escaping = false;
      continue;
    }
    if (char === "\\") {
      escaping = true;
      continue;
    }
    if (char === "%") {
      source += ".*";
      continue;
    }
    if (char === "_") {
      source += ".";
      continue;
    }
    source += char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  return new RegExp(`^${source}$`, "i");
};

const compareForSort = (left: unknown, right: unknown) => {
  if (left === right) return 0;
  if (left === null || left === undefined) return 1;
  if (right === null || right === undefined) return -1;

  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  const leftText = String(left).toLowerCase();
  const rightText = String(right).toLowerCase();
  if (leftText < rightText) return -1;
  if (leftText > rightText) return 1;
  return 0;
};

const parseOrExpression = (expr: string): QueryFilter | null => {
  const parts = expr.split(".");
  if (parts.length < 3) return null;
  const [column, op, ...rest] = parts;
  if (!column || !op) return null;
  const rawValue = rest.join(".");
  if (op === "eq") return { type: "eq", column, value: rawValue };
  if (op === "ilike") return { type: "ilike", column, value: rawValue };
  return null;
};

const matchFilter = (row: JsonRecord, filter: QueryFilter) => {
  const current = row[filter.column];
  switch (filter.type) {
    case "eq":
      return current === filter.value;
    case "neq":
      return current !== filter.value;
    case "in":
      return Array.isArray(filter.value) && filter.value.includes(current);
    case "ilike": {
      const target = typeof current === "string" ? current : "";
      const regex = sqlLikeToRegex(String(filter.value ?? ""));
      return regex.test(target);
    }
    default:
      return true;
  }
};

const applyFilters = (
  rows: JsonRecord[],
  filters: QueryFilter[],
  orGroups: QueryFilter[][]
) =>
  rows.filter((row) => {
    if (filters.some((filter) => !matchFilter(row, filter))) {
      return false;
    }
    if (orGroups.length === 0) return true;
    return orGroups.every((group) => group.some((filter) => matchFilter(row, filter)));
  });

const applyOrder = (rows: JsonRecord[], orders: QueryOrder[]) => {
  if (orders.length === 0) return rows;
  return [...rows].sort((left, right) => {
    for (const order of orders) {
      const compared = compareForSort(left[order.column], right[order.column]);
      if (compared === 0) continue;
      return order.ascending ? compared : -compared;
    }
    return 0;
  });
};

const pickFields = (row: JsonRecord, fields: string[]) => {
  if (fields.length === 0 || (fields.length === 1 && fields[0] === "*")) {
    return { ...row };
  }
  const picked: JsonRecord = {};
  fields.forEach((field) => {
    if (field === "*") {
      Object.assign(picked, row);
      return;
    }
    const [left, right] = field.split(":");
    const sourceKey = normalizeString(left);
    const targetKey = normalizeString(right) || sourceKey;
    if (!sourceKey) return;
    picked[targetKey] = row[sourceKey] ?? null;
  });
  return picked;
};

const resolveRelationRows = async (
  db: Firestore,
  baseTable: string,
  relationName: string,
  baseRows: JsonRecord[],
  relationFields: string[]
) => {
  const relation = RELATION_MAP[baseTable]?.[relationName];
  if (!relation) {
    return baseRows.map((row) => ({ ...row, [relationName]: [] }));
  }

  const snapshot = await getDocs(collection(db, relation.table));
  const grouped = new Map<string, JsonRecord[]>();
  snapshot.forEach((docSnap) => {
    const row = mapDocToRow(docSnap.id, docSnap.data());
    const parentId = normalizeString(row[relation.foreignKey]);
    if (!parentId) return;
    const list = grouped.get(parentId) || [];
    list.push(row);
    grouped.set(parentId, list);
  });

  const wantsCount = relationFields.length === 1 && relationFields[0] === "count";
  return baseRows.map((row) => {
    const rowId = normalizeString(row.id);
    const children = rowId ? grouped.get(rowId) || [] : [];
    return {
      ...row,
      [relationName]: wantsCount
        ? [{ count: children.length }]
        : children.map((child) => pickFields(child, relationFields)),
    };
  });
};

const projectRows = async (
  db: Firestore,
  table: string,
  rows: JsonRecord[],
  selectText: string
) => {
  const fields = splitTopLevelComma(selectText);
  if (fields.length === 0 || (fields.length === 1 && fields[0] === "*")) {
    return rows.map((row) => ({ ...row }));
  }

  const plainFields: string[] = [];
  const relationFields: Array<{ relation: string; inner: string[] }> = [];

  fields.forEach((field) => {
    const relationMatch = field.match(/^([a-zA-Z0-9_]+)\((.*)\)$/);
    if (!relationMatch) {
      plainFields.push(field);
      return;
    }
    relationFields.push({
      relation: relationMatch[1],
      inner: splitTopLevelComma(relationMatch[2]),
    });
  });

  let projected = rows.map((row) => pickFields(row, plainFields.length > 0 ? plainFields : ["*"]));
  for (const relation of relationFields) {
    projected = await resolveRelationRows(db, table, relation.relation, projected, relation.inner);
  }
  return projected;
};

class FirestoreQueryBuilder implements PromiseLike<SupabaseLikeResponse<any>> {
  private action: QueryAction = "select";
  private selectText = "*";
  private selectOptions: SelectOptions = {};
  private mutationSelectText: string | null = null;
  private mutationSelectOptions: SelectOptions = {};
  private filters: QueryFilter[] = [];
  private orGroups: QueryFilter[][] = [];
  private orders: QueryOrder[] = [];
  private limitNumber: number | null = null;
  private rangeFrom: number | null = null;
  private rangeTo: number | null = null;
  private singleMode: SingleMode = "none";
  private mutationPayload: JsonRecord[] = [];
  private upsertConflict: string | null = null;
  private executePromise: Promise<SupabaseLikeResponse<any>> | null = null;

  constructor(
    private readonly db: Firestore,
    private readonly table: string
  ) {}

  select(selectText = "*", options?: SelectOptions) {
    if (this.action === "select") {
      this.selectText = selectText;
      this.selectOptions = options || {};
      return this;
    }
    this.mutationSelectText = selectText;
    this.mutationSelectOptions = options || {};
    return this;
  }

  insert(payload: JsonRecord | JsonRecord[]) {
    this.action = "insert";
    this.mutationPayload = Array.isArray(payload) ? payload : [payload];
    return this;
  }

  update(payload: JsonRecord) {
    this.action = "update";
    this.mutationPayload = [payload];
    return this;
  }

  delete() {
    this.action = "delete";
    this.mutationPayload = [];
    return this;
  }

  upsert(payload: JsonRecord | JsonRecord[], options?: { onConflict?: string }) {
    this.action = "upsert";
    this.mutationPayload = Array.isArray(payload) ? payload : [payload];
    this.upsertConflict = normalizeString(options?.onConflict || "") || null;
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push({ type: "eq", column, value });
    return this;
  }

  neq(column: string, value: unknown) {
    this.filters.push({ type: "neq", column, value });
    return this;
  }

  in(column: string, values: unknown[]) {
    this.filters.push({ type: "in", column, value: values });
    return this;
  }

  ilike(column: string, pattern: string) {
    this.filters.push({ type: "ilike", column, value: pattern });
    return this;
  }

  or(expr: string) {
    const group = splitTopLevelComma(expr)
      .map((item) => parseOrExpression(item))
      .filter((item): item is QueryFilter => Boolean(item));
    if (group.length > 0) {
      this.orGroups.push(group);
    }
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orders.push({ column, ascending: options?.ascending !== false });
    return this;
  }

  limit(value: number) {
    this.limitNumber = Math.max(0, Math.floor(value));
    return this;
  }

  range(from: number, to: number) {
    this.rangeFrom = Math.max(0, Math.floor(from));
    this.rangeTo = Math.max(this.rangeFrom, Math.floor(to));
    return this;
  }

  single() {
    this.singleMode = "single";
    return this;
  }

  maybeSingle() {
    this.singleMode = "maybeSingle";
    return this;
  }

  then<TResult1 = SupabaseLikeResponse<any>, TResult2 = never>(
    onfulfilled?:
      | ((value: SupabaseLikeResponse<any>) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?:
      | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
      | null
  ): Promise<TResult1 | TResult2> {
    if (!this.executePromise) {
      this.executePromise = this.execute();
    }
    return this.executePromise.then(onfulfilled || undefined, onrejected || undefined);
  }

  private async loadRows() {
    const snapshot = await getDocs(collection(this.db, this.table));
    const rows: JsonRecord[] = [];
    snapshot.forEach((docSnap) => {
      rows.push(mapDocToRow(docSnap.id, docSnap.data()));
    });
    return rows;
  }

  private applyPostFilterSlicing(rows: JsonRecord[]) {
    let processed = applyOrder(rows, this.orders);
    if (this.rangeFrom !== null && this.rangeTo !== null) {
      processed = processed.slice(this.rangeFrom, this.rangeTo + 1);
    }
    if (this.limitNumber !== null) {
      processed = processed.slice(0, this.limitNumber);
    }
    return processed;
  }

  private finalizeDataRows(rows: JsonRecord[], count: number | null, selectText: string, options: SelectOptions) {
    const countValue = options.count === "exact" ? count : null;
    const head = options.head === true;

    return { head, countValue, selectText };
  }

  private async resolveSingleMode(
    rows: JsonRecord[],
    countValue: number | null
  ): Promise<SupabaseLikeResponse<any>> {
    if (this.singleMode === "none") {
      return { data: rows, error: null, count: countValue };
    }
    if (this.singleMode === "single") {
      if (rows.length !== 1) {
        return {
          data: null,
          error: makeError("JSON object requested, multiple (or no) rows returned", "PGRST116", 406),
          count: countValue,
        };
      }
      return { data: rows[0], error: null, count: countValue };
    }
    if (rows.length === 0) {
      return { data: null, error: null, count: countValue };
    }
    return { data: rows[0], error: null, count: countValue };
  }

  private async executeSelect(): Promise<SupabaseLikeResponse<any>> {
    const allRows = await this.loadRows();
    const filtered = applyFilters(allRows, this.filters, this.orGroups);
    const count = filtered.length;
    const sliced = this.applyPostFilterSlicing(filtered);
    const projected = await projectRows(this.db, this.table, sliced, this.selectText);
    const finalized = this.finalizeDataRows(projected, count, this.selectText, this.selectOptions);
    if (finalized.head) {
      return {
        data: null,
        error: null,
        count: finalized.countValue,
      };
    }
    return this.resolveSingleMode(projected, finalized.countValue);
  }

  private async executeInsert(): Promise<SupabaseLikeResponse<any>> {
    const insertedRows: JsonRecord[] = [];
    for (const rowInput of this.mutationPayload) {
      const row = { ...asRecord(rowInput) };
      const rowId = normalizeString(row.id);
      const docId = rowId || doc(collection(this.db, this.table)).id;
      const timestamp = nowIso();
      if (!normalizeString(row.created_at)) {
        row.created_at = timestamp;
      }
      row.updated_at = normalizeString(row.updated_at) || timestamp;
      row.id = docId;
      await setDoc(doc(this.db, this.table, docId), row);
      insertedRows.push(row);
    }

    if (!this.mutationSelectText && this.singleMode === "none") {
      return { data: null, error: null };
    }

    const selectText = this.mutationSelectText || "*";
    const projected = await projectRows(this.db, this.table, insertedRows, selectText);
    return this.resolveSingleMode(projected, null);
  }

  private async executeUpdate(): Promise<SupabaseLikeResponse<any>> {
    const rows = await this.loadRows();
    const targetRows = applyFilters(rows, this.filters, this.orGroups);
    const patch = asRecord(this.mutationPayload[0] || {});
    const updatedRows: JsonRecord[] = [];
    const timestamp = nowIso();

    for (const row of targetRows) {
      const docId = normalizeString(row.id);
      if (!docId) continue;
      const nextRow = {
        ...row,
        ...patch,
        updated_at: normalizeString(patch.updated_at) || timestamp,
      };
      await setDoc(doc(this.db, this.table, docId), nextRow);
      updatedRows.push(nextRow);
    }

    if (!this.mutationSelectText && this.singleMode === "none") {
      return { data: null, error: null };
    }

    const selectText = this.mutationSelectText || "*";
    const projected = await projectRows(this.db, this.table, updatedRows, selectText);
    return this.resolveSingleMode(projected, null);
  }

  private async executeDelete(): Promise<SupabaseLikeResponse<any>> {
    const rows = await this.loadRows();
    const targetRows = applyFilters(rows, this.filters, this.orGroups);
    for (const row of targetRows) {
      const docId = normalizeString(row.id);
      if (!docId) continue;
      await deleteDoc(doc(this.db, this.table, docId));
    }

    if (!this.mutationSelectText && this.singleMode === "none") {
      return { data: null, error: null };
    }

    const selectText = this.mutationSelectText || "*";
    const projected = await projectRows(this.db, this.table, targetRows, selectText);
    return this.resolveSingleMode(projected, null);
  }

  private async executeUpsert(): Promise<SupabaseLikeResponse<any>> {
    const existingRows = await this.loadRows();
    const byId = new Map(existingRows.map((row) => [normalizeString(row.id), row]));
    const conflictField = this.upsertConflict?.split(",").map((v) => v.trim()).filter(Boolean)[0] || null;
    const upsertedRows: JsonRecord[] = [];

    for (const inputRow of this.mutationPayload) {
      const row = { ...asRecord(inputRow) };
      let matched: JsonRecord | null = null;

      if (conflictField && normalizeString(row[conflictField])) {
        const conflictValue = row[conflictField];
        matched =
          existingRows.find((candidate) => candidate[conflictField] === conflictValue) || null;
      } else {
        const rowId = normalizeString(row.id);
        if (rowId && byId.has(rowId)) {
          matched = byId.get(rowId) || null;
        }
      }

      const docId =
        normalizeString(matched?.id) ||
        normalizeString(row.id) ||
        doc(collection(this.db, this.table)).id;
      const timestamp = nowIso();
      const merged = {
        ...(matched || {}),
        ...row,
        id: docId,
        created_at: normalizeString((matched || {}).created_at) || normalizeString(row.created_at) || timestamp,
        updated_at: normalizeString(row.updated_at) || timestamp,
      };

      await setDoc(doc(this.db, this.table, docId), merged);
      upsertedRows.push(merged);
    }

    if (!this.mutationSelectText && this.singleMode === "none") {
      return { data: null, error: null };
    }

    const selectText = this.mutationSelectText || "*";
    const projected = await projectRows(this.db, this.table, upsertedRows, selectText);
    return this.resolveSingleMode(projected, null);
  }

  private async execute(): Promise<SupabaseLikeResponse<any>> {
    try {
      switch (this.action) {
        case "select":
          return await this.executeSelect();
        case "insert":
          return await this.executeInsert();
        case "update":
          return await this.executeUpdate();
        case "delete":
          return await this.executeDelete();
        case "upsert":
          return await this.executeUpsert();
        default:
          return { data: null, error: makeError("Unsupported action", "NOT_SUPPORTED") };
      }
    } catch (error) {
      return { data: null, error: toError(error) };
    }
  }
}

class FirebaseRealtimeChannel {
  private handlers: RealtimeHandler[] = [];
  private unsubscribers: Unsubscribe[] = [];

  constructor(
    private readonly db: Firestore,
    readonly name: string
  ) {}

  on(
    event: string,
    filter: { event?: string; schema?: string; table?: string },
    callback: (payload: RealtimePayload) => void
  ) {
    this.handlers.push({ event, filter, callback });
    return this;
  }

  subscribe() {
    this.handlers.forEach((handler) => {
      const table = normalizeString(handler.filter.table);
      if (!table) return;
      const previousRows = new Map<string, JsonRecord>();

      const unsubscribe = onSnapshot(
        collection(this.db, table),
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            const nextRow = mapDocToRow(change.doc.id, change.doc.data());
            const prev = previousRows.get(change.doc.id) || null;

            if (change.type === "added") {
              previousRows.set(change.doc.id, nextRow);
              handler.callback({
                eventType: "INSERT",
                new: nextRow,
                old: null,
              });
              return;
            }

            if (change.type === "modified") {
              previousRows.set(change.doc.id, nextRow);
              handler.callback({
                eventType: "UPDATE",
                new: nextRow,
                old: prev,
              });
              return;
            }

            previousRows.delete(change.doc.id);
            handler.callback({
              eventType: "DELETE",
              new: null,
              old: prev,
            });
          });
        },
        (error) => {
          console.warn(`Realtime channel "${this.name}" failed:`, error);
        }
      );

      this.unsubscribers.push(unsubscribe);
    });

    return this;
  }

  unsubscribe() {
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());
    this.unsubscribers = [];
  }
}

const userFromFirebase = async (db: Firestore, user: FirebaseUser): Promise<AuthUser> => {
  let storedMetadata: JsonRecord = {};
  try {
    const metadataRef = doc(db, AUTH_METADATA_COLLECTION, user.uid);
    const metadataSnap = await getDoc(metadataRef);
    const metadataDoc = asRecord(metadataSnap.data());
    storedMetadata = asRecord(metadataDoc.user_metadata);
  } catch {
    // Firestore permissions may not be configured for this collection yet.
    // Fall back to Firebase Auth profile data only.
  }
  const displayName = normalizeString(user.displayName);
  const email = normalizeString(user.email);
  const baseMetadata: JsonRecord = {
    ...(displayName ? { name: displayName } : {}),
    ...(email ? { email } : {}),
  };

  return {
    id: user.uid,
    email: user.email || null,
    user_metadata: {
      ...baseMetadata,
      ...storedMetadata,
    },
    created_at: user.metadata.creationTime || null,
    last_sign_in_at: user.metadata.lastSignInTime || null,
  };
};

const sessionFromFirebase = async (db: Firestore, user: FirebaseUser | null): Promise<AuthSession | null> => {
  if (!user) return null;
  const mappedUser = await userFromFirebase(db, user);
  const accessToken = await user.getIdToken().catch(() => null);
  return {
    user: mappedUser,
    access_token: accessToken,
    refresh_token: null,
  };
};

const mergeUserMetadata = async (db: Firestore, userId: string, patch: JsonRecord) => {
  try {
    const ref = doc(db, AUTH_METADATA_COLLECTION, userId);
    const existingSnap = await getDoc(ref);
    const existing = asRecord(existingSnap.data());
    const nextMeta = {
      ...asRecord(existing.user_metadata),
      ...patch,
    };
    await setDoc(
      ref,
      {
        user_metadata: nextMeta,
        updated_at: nowIso(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn("mergeUserMetadata: failed (Firestore rules may need updating)", error);
  }
};

class FirebaseAuthFacade {
  constructor(
    private readonly auth: Auth,
    private readonly db: Firestore
  ) {}

  async getSession(): Promise<SupabaseLikeResponse<{ session: AuthSession | null }>> {
    try {
      const session = await sessionFromFirebase(this.db, this.auth.currentUser);
      return {
        data: { session },
        error: null,
      };
    } catch (error) {
      return { data: { session: null }, error: toError(error) };
    }
  }

  async getUser(): Promise<SupabaseLikeResponse<{ user: AuthUser | null }>> {
    try {
      if (!this.auth.currentUser) {
        return { data: { user: null }, error: null };
      }
      const user = await userFromFirebase(this.db, this.auth.currentUser);
      return { data: { user }, error: null };
    } catch (error) {
      return { data: { user: null }, error: toError(error) };
    }
  }

  onAuthStateChange(callback: OnAuthStateChangeCallback) {
    let previousUserId = normalizeString(this.auth.currentUser?.uid) || null;
    const unsubscribe = onIdTokenChanged(this.auth, (user) => {
      const currentUserId = normalizeString(user?.uid) || null;
      let event: AuthChangeEvent = "TOKEN_REFRESHED";
      if (previousUserId && !currentUserId) {
        event = "SIGNED_OUT";
      } else if (!previousUserId && currentUserId) {
        event = "SIGNED_IN";
      } else if (previousUserId && currentUserId && previousUserId !== currentUserId) {
        event = "SIGNED_IN";
      }
      previousUserId = currentUserId;

      void sessionFromFirebase(this.db, user)
        .then((session) => {
          callback(event, session);
        })
        .catch((error) => {
          console.warn("onAuthStateChange: failed to map session", error);
          callback(event, null);
        });
    });

    return {
      data: {
        subscription: {
          unsubscribe,
        },
      },
    };
  }

  async signOut(): Promise<SupabaseLikeResponse<null>> {
    try {
      await firebaseSignOut(this.auth);
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: toError(error) };
    }
  }

  async signUp(params: SignUpParams): Promise<SupabaseLikeResponse<{ session: AuthSession | null; user: AuthUser | null }>> {
    try {
      const credential = await createUserWithEmailAndPassword(this.auth, params.email, params.password);
      const metadataPatch = asRecord(params.options?.data);
      const displayName = normalizeString(metadataPatch.name);
      if (displayName) {
        await updateProfile(credential.user, { displayName });
      }
      if (Object.keys(metadataPatch).length > 0) {
        await mergeUserMetadata(this.db, credential.user.uid, metadataPatch);
      }
      const session = await sessionFromFirebase(this.db, credential.user);
      return {
        data: {
          session,
          user: session?.user || null,
        },
        error: null,
      };
    } catch (error) {
      return {
        data: { session: null, user: null },
        error: toError(error, "Failed to sign up", "AUTH_SIGNUP_FAILED"),
      };
    }
  }

  async signInWithPassword(
    params: SignInPasswordParams
  ): Promise<SupabaseLikeResponse<{ session: AuthSession | null; user: AuthUser | null }>> {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, params.email, params.password);
      const session = await sessionFromFirebase(this.db, credential.user);
      return {
        data: {
          session,
          user: session?.user || null,
        },
        error: null,
      };
    } catch (error) {
      return {
        data: { session: null, user: null },
        error: toError(error, "Failed to sign in", "AUTH_SIGNIN_FAILED"),
      };
    }
  }

  async signInWithIdToken(
    params: SignInIdTokenParams
  ): Promise<SupabaseLikeResponse<{ session: AuthSession | null; user: AuthUser | null }>> {
    try {
      if (params.provider !== "google") {
        return {
          data: { session: null, user: null },
          error: makeError("Only google provider is supported.", "NOT_SUPPORTED"),
        };
      }
      const credential = GoogleAuthProvider.credential(params.token, params.access_token);
      const result = await signInWithCredential(this.auth, credential);
      const session = await sessionFromFirebase(this.db, result.user);
      return {
        data: {
          session,
          user: session?.user || null,
        },
        error: null,
      };
    } catch (error) {
      return {
        data: { session: null, user: null },
        error: toError(error, "Failed to sign in with Google token", "AUTH_GOOGLE_ID_TOKEN_FAILED"),
      };
    }
  }

  async signInWithOAuth(
    params: SignInOAuthParams
  ): Promise<SupabaseLikeResponse<{ provider: string; url: string | null }>> {
    try {
      if (params.provider !== "google") {
        return {
          data: { provider: params.provider, url: null },
          error: makeError("Only google provider is supported.", "NOT_SUPPORTED"),
        };
      }

      if (Platform.OS !== "web") {
        return {
          data: { provider: params.provider, url: null },
          error: makeError("Native OAuth redirect flow is not implemented in Firebase facade.", "NOT_SUPPORTED"),
        };
      }

      await signInWithPopup(this.auth, new GoogleAuthProvider());
      return {
        data: { provider: params.provider, url: null },
        error: null,
      };
    } catch (error) {
      return {
        data: { provider: params.provider, url: null },
        error: toError(error, "Failed to sign in with OAuth", "AUTH_OAUTH_FAILED"),
      };
    }
  }

  async exchangeCodeForSession(_code: string): Promise<SupabaseLikeResponse<{ session: AuthSession | null }>> {
    return {
      data: { session: null },
      error: makeError("exchangeCodeForSession is not supported in Firebase facade.", "NOT_SUPPORTED"),
    };
  }

  async setSession(_payload: SetSessionParams): Promise<SupabaseLikeResponse<{ session: AuthSession | null }>> {
    return {
      data: { session: null },
      error: makeError("setSession is not supported in Firebase facade.", "NOT_SUPPORTED"),
    };
  }

  async updateUser(
    params: UpdateUserParams
  ): Promise<SupabaseLikeResponse<{ user: AuthUser | null }>> {
    try {
      const current = this.auth.currentUser;
      if (!current) {
        return {
          data: { user: null },
          error: makeError("No authenticated user found.", "AUTH_UNAUTHORIZED", 401),
        };
      }

      const patch = asRecord(params.data);
      const displayName = normalizeString(patch.name);
      if (displayName) {
        await updateProfile(current, { displayName });
      }
      if (Object.keys(patch).length > 0) {
        await mergeUserMetadata(this.db, current.uid, patch);
      }
      const mapped = await userFromFirebase(this.db, current);
      return { data: { user: mapped }, error: null };
    } catch (error) {
      return {
        data: { user: null },
        error: toError(error, "Failed to update user", "AUTH_UPDATE_USER_FAILED"),
      };
    }
  }
}

type RpcParams = Record<string, unknown>;

class FirebaseSupabaseFacade {
  readonly auth: FirebaseAuthFacade;

  constructor(
    private readonly db: Firestore,
    auth: Auth
  ) {
    this.auth = new FirebaseAuthFacade(auth, db);
  }

  from(table: string) {
    return new FirestoreQueryBuilder(this.db, table);
  }

  async rpc(fn: "is_handle_taken", params: { p_handle: string; p_exclude_user_id?: string }): Promise<SupabaseLikeResponse<boolean>>;
  async rpc(fn: string, params?: RpcParams): Promise<SupabaseLikeResponse<unknown>>;
  async rpc(fn: string, params?: RpcParams): Promise<SupabaseLikeResponse<unknown>> {
    try {
      if (fn === "is_handle_taken") {
        const pHandle = params?.["p_handle"];
        const pExcludeUserId = params?.["p_exclude_user_id"];
        if (typeof pHandle !== "string" || !pHandle) {
          return { data: false, error: null };
        }
        const snapshot = await getDocs(collection(this.db, "profiles"));
        const found = snapshot.docs.some((docSnap) => {
          const row = mapDocToRow(docSnap.id, docSnap.data());
          if (normalizeString(row["handle"]) !== pHandle) return false;
          if (typeof pExcludeUserId === "string" && pExcludeUserId && normalizeString(row["id"]) === pExcludeUserId) return false;
          return true;
        });
        return { data: found, error: null };
      }
      return { data: null, error: makeError(`RPC "${fn}" is not implemented`, "NOT_IMPLEMENTED") };
    } catch (error) {
      return { data: null, error: toError(error) };
    }
  }

  channel(name: string) {
    return new FirebaseRealtimeChannel(this.db, name);
  }

  async removeChannel(channel: FirebaseRealtimeChannel): Promise<SupabaseLikeResponse<null>> {
    channel.unsubscribe();
    return { data: null, error: null };
  }
}

export const isSupabaseConfigured = hasFirebaseClientConfig();

let clientSingleton: FirebaseSupabaseFacade | null = null;

export const getSupabaseOrThrow = () => {
  if (clientSingleton) {
    return clientSingleton;
  }

  if (!hasFirebaseClientConfig()) {
    const missingKeys = getFirebaseMissingEnvKeys();
    throw new Error(
      `Firebase environment variables are missing. Set ${missingKeys.join(", ")}.`
    );
  }

  const auth = getFirebaseClientAuth();
  const db = getFirebaseClientDb();
  if (!auth || !db) {
    throw new Error("Failed to initialize Firebase Auth / Firestore client.");
  }

  clientSingleton = new FirebaseSupabaseFacade(db, auth);
  return clientSingleton;
};
