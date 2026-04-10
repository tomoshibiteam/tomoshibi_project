This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Firebase (Home Dashboard + Google Login)

`/` (制作ホーム) は Firestore の `projects` コレクションを読み込みます。  
環境変数が未設定の場合は、画面はモックデータで表示されます。

1. `apps/admin-console/.env.local.example` を参考に `apps/admin-console/.env.local` を作成
2. サービスアカウントの値と Web SDK の公開値を設定

```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
NEXT_PUBLIC_FIREBASE_API_KEY=your-web-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdefghijklmnopqrstuvwxyz123456
```

`NEXT_PUBLIC_*` はヘッダー右上の Google ログイン UI（Firebase Authentication）で使用します。

想定する `projects` ドキュメント例:

```json
{
  "name": "岩美駅PoC",
  "slug": "iwami-station-poc",
  "consolePath": "/projects/iwami-station-poc",
  "description": "鳥取県岩美町周辺でのデジタルスタンプラリーと地域回遊施策。",
  "status": "draft",
  "seriesCount": 4,
  "spotCount": 12,
  "updatedAt": "2026-04-05T00:00:00.000Z"
}
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

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
