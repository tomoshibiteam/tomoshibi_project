# TOMOSHIBI Backend

TOMOSHIBI is an outdoor AI companion service. The backend is a Firebase Cloud Functions / TypeScript project under `functions/`.

## Local Commands

```sh
cd functions
npm install
npm run build
npm run lint
npm run test
```

## Emulator

The Firestore Emulator requires a Java Runtime on `PATH`.

Start Functions and Firestore Emulator:

```sh
./functions/node_modules/.bin/firebase emulators:start --project tomoshibi-local --only functions,firestore
```

Seed local area mode data in another terminal:

```sh
cd functions
npm run seed:local
```

Run a smoke flow against the local Functions Emulator:

```sh
cd functions
npm run smoke:local
```

Or run seed and smoke in one emulator session:

```sh
./functions/node_modules/.bin/firebase emulators:exec --project tomoshibi-local --only functions,firestore "cd functions && npm run seed:local && npm run smoke:local"
```

The seed script writes:

- `areaModes/iki`
- `placeAnnotations/iki_mock_quiet_park`
- `placeAnnotations/iki_mock_cafe`

## Notes

- Do not put API keys in code.
- Keep `PLACE_PROVIDER=mock` and `LLM_PROVIDER=mock` for local development unless explicitly testing real providers.
- Use `LLM_PROVIDER=gemini`, `GEMINI_API_KEY`, and optionally `GEMINI_MODEL` when testing Gemini.
- LLM output must not invent place existence, coordinates, opening hours, prices, booking links, coupons, or partner status.
