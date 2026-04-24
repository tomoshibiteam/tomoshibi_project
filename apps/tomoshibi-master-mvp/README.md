This is a [Next.js](https://nextjs.org) project for the Iwami proof of concept.

## Getting Started

1. Configure environment variables:

```bash
cp .env.example .env.local
```

Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in `.env.local`.

For Google sign-in on the top-right user icon, also set:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_CREATE_PLAN_REQUEST_URL` (optional)
- `NEXT_PUBLIC_GET_PLAN_REQUEST_STATUS_URL` (optional)

If `NEXT_PUBLIC_CREATE_PLAN_REQUEST_URL` is omitted, the frontend uses:

- `https://asia-northeast1-${NEXT_PUBLIC_FIREBASE_PROJECT_ID}.cloudfunctions.net/createPlanRequest`

If `NEXT_PUBLIC_GET_PLAN_REQUEST_STATUS_URL` is omitted, the frontend uses:

- `https://asia-northeast1-${NEXT_PUBLIC_FIREBASE_PROJECT_ID}.cloudfunctions.net/getPlanRequestStatus`

2. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Spot admin APIs (important)

Spot edit/delete/image upload uses Firebase Callable Functions.
If these functions are not deployed (or emulator is not running), browser may show CORS-like errors such as:

- `No 'Access-Control-Allow-Origin' header...`
- `Response to preflight request doesn't pass access control check`

For local development, use Firestore/Functions emulators:

1. Set in `.env.local`:

```bash
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true
NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST=127.0.0.1
NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_PORT=5001
```

2. Start emulators with persistent data (from this app directory):

```bash
npm run emulators:start
```

For stronger persistence against accidental terminal close / process crash, use:

```bash
npm run emulators:start:persistent
```

This mode checkpoints emulator data to `.firebase/emulator-data` every 20 seconds in addition to normal `--export-on-exit`.

Note:
- Firestore emulator requires Java runtime. This project uses Homebrew OpenJDK path in the script.
- Emulator data is persisted in `.firebase/emulator-data` via `--import/--export-on-exit`.
- Stop emulator with `Ctrl + C` (graceful shutdown) so export completes. Avoid force-kill.

### Team sharing of Emulator data (important)

If you want collaborators to get the same local Firestore/Storage state after `git pull`,
include the snapshot under:

- `.firebase/emulator-data/**`

This project is configured so `npm run emulators:start` always imports that snapshot first.

Recommended team flow:

1. Author updates data locally.
2. Author stops emulator gracefully (`Ctrl + C`) so `--export-on-exit` writes the latest snapshot.
3. Author commits `.firebase/emulator-data/**` and pushes.
4. Collaborator pulls, starts emulator, and gets the same data.

Commit example:

```bash
git add apps/tomoshibi-master-mvp/.firebase/emulator-data
git add apps/tomoshibi-master-mvp/.gitignore apps/tomoshibi-master-mvp/README.md
git commit -m "chore: share firebase emulator snapshot"
git push
```

If snapshot is intentionally not committed, collaborator must seed manually:

```bash
npm run seed:spots:emulator
npm run seed:transit:emulator
```

3. If `spots` is empty in emulator, seed once:

```bash
npm run seed:spots:emulator
```

If you use production instead, deploy the callables first.

### Production deployment (Firestore/Functions)

Use these commands from this app directory:

```bash
npm run deploy:prod
npm run seed:spots:prod
npm run dev:prod
```

Notes:
- `deploy:prod` deploys Firestore rules + Functions to `tomoshibi-950e2`.
- `seed:spots:prod` writes `functions/src/seeds/spots.seed.json` to production Firestore.
- For `seed:spots:prod`, if auth errors occur, set `GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json` and retry.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
