# PlacementHub

AI-powered email summaries for college placement notifications. Never miss a job opportunity again!

## Features

- 🔐 **Google Sign-in** - Secure OAuth authentication
- 📧 **Gmail Integration** - Automatically fetches placement-related emails
- 🤖 **AI Summaries** - Uses Gemini to extract company, role, deadline, and eligibility
- 🔑 **BYOK** - Bring Your Own Key - use your personal Gemini API key
- 🐳 **Self-Hostable** - Deploy with Docker on your own infrastructure

## Prerequisites

1. **Google Cloud Console Setup**
   - Create a new project at [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the Gmail API
   - Configure OAuth consent screen (add `gmail.readonly` scope)
   - Create OAuth 2.0 credentials (Web application)
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

2. **Gemini API Key**
   - Get your key from [Google AI Studio](https://aistudio.google.com/app/apikey)

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd email-summary
npm install
```

### 2. Configure Environment

Copy the template and fill in your values:

```bash
cp env.template .env
```

Edit `.env`:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<random-32-char-string>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
ENCRYPTION_KEY=<random-32-char-string>
```

Generate secrets:
```bash
openssl rand -base64 32  # For NEXTAUTH_SECRET
openssl rand -base64 32  # For ENCRYPTION_KEY
```

### 3. Initialize Database

```bash
npx prisma migrate dev --name init
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Docker Deployment

### Build and Run

```bash
# Set environment variables
export NEXTAUTH_SECRET=your-secret
export GOOGLE_CLIENT_ID=your-client-id
export GOOGLE_CLIENT_SECRET=your-client-secret
export ENCRYPTION_KEY=your-encryption-key

# Build and start
docker-compose up -d
```

### Update NEXTAUTH_URL

For production, update the `NEXTAUTH_URL` in docker-compose.yml to your domain.

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── dashboard/         # Email summaries
│   │   ├── settings/          # API key management
│   │   └── api/               # API routes
│   ├── components/            # React components
│   └── lib/
│       ├── auth.ts            # NextAuth config
│       ├── gmail.ts           # Gmail API client
│       ├── gemini.ts          # AI summarization
│       └── encryption.ts      # API key encryption
├── prisma/
│   └── schema.prisma          # Database schema
├── Dockerfile
└── docker-compose.yml
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Auth**: NextAuth.js v5
- **Database**: SQLite + Prisma
- **AI**: Google Gemini
- **Styling**: Tailwind CSS

## Security

- OAuth tokens are stored in the database (server-side only)
- User API keys are encrypted with AES before storage
- Gmail access is read-only (`gmail.readonly` scope)

## Deployment

### Deploy to Vercel

See [DEPLOYMENT.md](./DEPLOYMENT.md) for a complete guide on deploying to Vercel.

**Quick Steps:**
1. Push your code to GitHub/GitLab/Bitbucket
2. Import project in [Vercel Dashboard](https://vercel.com)
3. Add environment variables in Vercel Settings
4. Update Google Cloud Console OAuth redirect URIs
5. Deploy!

**Required Environment Variables:**
- `DATABASE_URL` - Your Neon PostgreSQL connection string
- `NEXTAUTH_URL` - Your Vercel domain (e.g., `https://your-app.vercel.app`)
- `NEXTAUTH_SECRET` - Random 32+ character string
- `GOOGLE_CLIENT_ID` - From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- `ENCRYPTION_KEY` - Random 32+ character string

## License

MIT
