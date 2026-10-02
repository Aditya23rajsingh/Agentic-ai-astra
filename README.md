# Agentic AI Astra

Full-stack agentic AI application with a real 3D game (Neon Corridors).

## Features

- **Agentic AI Workspace**: Multi-step reasoning, tool use, streaming chat
- **Real 3D Game**: First-person puzzle platformer with physics (React Three Fiber + cannon-es)
- **Authentication**: NextAuth.js with credentials + GitHub OAuth
- **Database**: PostgreSQL + Prisma ORM
- **Testing**: Vitest + Playwright
- **CI/CD**: GitHub Actions
- **Deployment**: Docker + Docker Compose

## Quick Start

```bash
git clone https://github.com/Aditya23rajsingh/Agentic-ai-astra.git
cd Agentic-ai-astra
npm install
cp .env.example .env
docker-compose up -d postgres
npm run db:generate
npm run db:push
npm run dev
```

Open http://localhost:3000

## Tech Stack

Next.js 14, TypeScript, Tailwind CSS, React Three Fiber, Three.js, cannon-es, Zustand, NextAuth.js, Prisma, PostgreSQL, Docker, GitHub Actions