# MEDIASSIST AI - Clinical Operations Dashboard

A complete, production-ready healthcare operations web application built with Next.js 16, React 19, TypeScript, Tailwind CSS, Prisma ORM, and SQLite.

## Features

### Core Functionality
- **Authentication**: Secure login/logout with NextAuth.js, role-based access control (Admin, Doctor, Clinician, Nurse, Care Coordinator)
- **Patient Management**: Full CRUD operations, search, filtering, pagination, patient details with tabs
- **Appointment Management**: List view, calendar view, create/edit/cancel, status management
- **AI Triage**: Queue with AI assessment, clinician review workflow, override capability, audit trail
- **Medical Records**: Search, filter by type/date/clinician, record preview
- **AI Assistant**: Chat interface with fallback demo mode
- **Analytics Dashboard**: Metrics, charts, trends with database-driven data
- **Care Team**: Staff directory with roles, departments, availability
- **Settings**: Profile, workspace, notifications, AI configuration, security

### Technical Highlights
- **Next.js 16 App Router** with Server Components
- **Prisma ORM** with SQLite (easily switchable to PostgreSQL)
- **TypeScript strict mode** with Zod validation
- **Recharts** for data visualization
- **Responsive design** with collapsible sidebar
- **Docker Compose** for PostgreSQL deployment
- **Audit logging** for all critical operations
- **AI Provider Abstraction** (Ollama, Gemini, DeepSeek, Demo fallback)

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Clone and install dependencies
cd mediassist-ai
npm install

# Generate Prisma client
npm run db:generate

# Run database migrations and seed
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

Visit `http://localhost:3000` - you'll be redirected to `/login`

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Administrator | admin@mediassist.ai | demo123 |
| Doctor (Cardiology) | dr.rahman@mediassist.ai | demo123 |
| Doctor (Neurology) | dr.islam@mediassist.ai | demo123 |
| Doctor (General Medicine) | dr.hassan@mediassist.ai | demo123 |
| Clinician (Emergency) | clinician.karim@mediassist.ai | demo123 |
| Clinician (Triage) | clinician.begum@mediassist.ai | demo123 |
| Nurse | nurse.akter@mediassist.ai | demo123 |
| Care Coordinator | coordinator.das@mediassist.ai | demo123 |

### Docker Setup (PostgreSQL)

```bash
# Start PostgreSQL
docker-compose up -d

# Update .env with PostgreSQL connection string
DATABASE_URL="postgresql://mediassist:mediassist_dev_password@localhost:5432/mediassist_ai?schema=public"

# Run migrations and seed
npm run db:migrate
npm run db:seed
```

## Project Structure

```
mediassist-ai/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Seed script
│   └── migrations/            # Migration files
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   ├── (auth)/            # Login page
│   │   ├── overview/          # Dashboard
│   │   ├── patients/          # Patient management
│   │   ├── appointments/      # Appointments
│   │   ├── triage/            # AI Triage
│   │   ├── assistant/         # AI Assistant
│   │   ├── medical-records/   # Medical Records
│   │   ├── analytics/         # Analytics
│   │   ├── care-team/         # Care Team
│   │   └── settings/          # Settings
│   ├── components/
│   │   ├── layout/            # Sidebar, Header, DashboardLayout
│   │   ├── dashboard/         # Dashboard components
│   │   ├── patients/          # Patient components
│   │   └── ui/                # Reusable UI components
│   ├── lib/
│   │   ├── db.ts              # Prisma client
│   │   ├── auth.ts            # NextAuth configuration
│   │   └── utils.ts           # Utility functions
│   ├── actions/               # Server Actions
│   └── types/                 # TypeScript types
├── ai-engine/                 # Python AI service (optional)
├── docker-compose.yml
├── .env.example
└── package.json
```

## Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema changes
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio
```

## Environment Variables

```env
# Database
DATABASE_URL="file:./dev.db"  # SQLite (dev) or PostgreSQL (prod)

# Authentication
AUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# AI Configuration
AI_PROVIDER="demo"  # ollama, gemini, deepseek, demo
GEMINI_API_KEY=""
DEEPSEEK_API_KEY=""
OLLAMA_BASE_URL="http://localhost:11434"

# Application
NEXT_PUBLIC_APP_NAME="MEDIASSIST AI"
NEXT_PUBLIC_WORKSPACE_NAME="Dhaka Care Network"
```

## Healthcare Safety

⚠️ **Important**: This application is for **clinical decision support only**. AI outputs are informational and must be reviewed by qualified clinicians.

- AI triage classifications: Urgent, Priority, Standard, Self-care
- All AI assessments marked as "AI-generated assistance"
- Clinician review workflow with override capability
- Complete audit trail for all triage decisions
- No autonomous medical decisions

## Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js Server Actions, API Routes
- **Database**: SQLite (dev) / PostgreSQL (prod) with Prisma ORM
- **Auth**: NextAuth.js v5 with Credentials provider
- **Charts**: Recharts
- **Validation**: Zod
- **Forms**: React Hook Form
- **Icons**: Lucide React

MIT License - See LICENSE file for details

## Disclaimer

This application uses **synthetic demo data only**. It is not HIPAA-certified, GDPR-compliant, or legally compliant for production healthcare use without implementing additional security and compliance controls.
