# M1 Transport Incident Reporting

This repository is now a complete Next.js application for M1 Transport incident reporting.

## Stack

- Next.js App Router
- Tailwind CSS with shadcn/ui components
- React Hook Form + Zod validation
- Drizzle ORM with Vercel Postgres
- Vercel Blob for uploaded images and signatures
- Resend for email delivery to `operations@m1transport.com.au`

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values.

Required variables:

- `POSTGRES_URL`
- `BLOB_READ_WRITE_TOKEN`
- `RESEND_API_KEY`

Recommended variables:

- `RESEND_FROM_EMAIL`
- `RESEND_REPLY_TO`

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Database Setup

Generate or apply the Drizzle schema:

```bash
npm run db:generate
npm run db:push
```

If you prefer SQL-first setup, use the migration in `drizzle/0000_initial.sql`.

## Vercel Deployment

1. Import the repository into Vercel.
2. Add the environment variables from `.env.example`.
3. Provision Vercel Postgres and Blob storage.
4. Configure Resend and set a valid sender address.
5. Deploy.

The form stores each submission in Postgres and sends the formatted incident report to `operations@m1transport.com.au`.
