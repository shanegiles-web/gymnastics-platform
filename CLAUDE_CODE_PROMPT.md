# Prompt for Claude Code in VS Code

Copy everything below the line and paste it into Claude Code:

---

I have a gymnastics facility management platform in this workspace. It's a monorepo with `/client` (React 19 + TypeScript + Vite + Tailwind) and `/server` (Node.js + Express + TypeScript + Drizzle ORM + PostgreSQL).

The project was just scaffolded and needs to be set up for local development. Here's what's been done and what still needs to happen:

## Already Done
- Root `npm install` completed successfully
- All source code is written (120+ files across client and server)
- `package.json` files exist for root, client, and server

## What I Need You To Do (in order)

### 1. Install client dependencies
The client had a previous failed install. Clean it up and reinstall:
```
cd client
Remove node_modules and package-lock.json if they exist
npm install
```
If there are peer dependency conflicts, use `--legacy-peer-deps` flag.

### 2. Install server dependencies
```
cd server
npm install
```

### 3. Set up environment file
Copy `server/.env.example` to `server/.env`. Then help me fill in the values. I'll need:
- A DATABASE_URL for PostgreSQL (ask me if I have one, or help me set up a free one on Railway or Neon)
- Generate random JWT_SECRET and JWT_REFRESH_SECRET values
- The other keys (Stripe, SendGrid, Twilio, AWS) can stay as placeholders for now

### 4. Fix any TypeScript errors
Run `npx tsc --noEmit` in both client and server directories. Fix any type errors you find. Common issues might be:
- Import path issues (the client uses `@/` alias pointing to `src/`)
- Missing type declarations
- React 19 compatibility issues with older Radix UI types

### 5. Try to run the dev server
```
cd client
npm run dev
```
This should start Vite on port 5173. Check if it compiles without errors. If there are errors, fix them.

### 6. Try to run the backend
```
cd server
npm run dev
```
This needs `tsx` or `ts-node` for TypeScript execution. If the dev script isn't set up, add one using `tsx watch src/index.ts`.

### 7. Create a database seed script
Create `server/src/db/seed.ts` that:
- Creates the database tables (or runs Drizzle push)
- Seeds a demo facility called "Elite Gymnastics Academy"
- Creates demo users:
  - Admin: admin@demo.com / Admin123!
  - Coach: coach@demo.com / Coach123!
  - Parent: parent@demo.com / Parent123!
- Creates 3 sample families with 5 students total
- Creates 6 sample classes (Beginner Tumbling, Intermediate Bars, Advanced Beam, Team Practice, Tiny Tumblers, Open Gym)
- Creates sample enrollments linking students to classes
- Add a script in server/package.json: `"db:seed": "tsx src/db/seed.ts"`

## Project Architecture Notes
- Read `CLAUDE.md` in the project root for coding conventions
- Read `DESIGN_SYSTEM.md` for frontend styling rules
- Read `docs/SPEC.md` for the full feature specification
- The frontend uses path alias `@/` → `src/` configured in vite.config.ts and tsconfig
- All API calls go through `src/lib/api.ts` on the frontend
- Backend uses standard Express middleware chain: authenticate → validateTenant → authorize → handler
- Database uses Drizzle ORM with schemas in `server/src/db/schema/`

## Important
- Use PowerShell-compatible commands (no `&&` chaining — run commands one at a time)
- I'm on Windows
- Don't skip errors — fix them as you go
- After everything works, give me a summary of what you did and any credentials I need
