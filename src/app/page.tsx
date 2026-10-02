'use client';

import Link from 'next/link';
import { Brain, Gamepad2, Terminal, Sparkles, ArrowRight, Github } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Agentic AI Astra</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <Sparkles className="h-4 w-4" />
              <span>Full-stack Agentic AI + Real 3D Game</span>
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Build <span className="text-primary">Intelligent Agents</span> that
              <br />
              <span className="text-primary">Think, Act & Play</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              A production-ready full-stack application featuring an agentic AI workspace with
              multi-step reasoning, tool use, and a real 3D puzzle game built with React Three Fiber.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href="/register"
                className="w-full sm:w-auto rounded-lg bg-primary px-8 py-3 text-lg font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
              >
                Start Building Free
                <ArrowRight className="ml-2 h-5 w-5 inline-block" />
              </Link>
              <Link
                href="https://github.com/Aditya23rajsingh/Agentic-ai-astra"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto rounded-lg border border-border bg-background px-8 py-3 text-lg font-medium text-foreground hover:bg-muted transition-colors"
              >
                <Github className="mr-2 h-5 w-5 inline-block" />
                View on GitHub
              </Link>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-20">
            <FeatureCard
              icon={<Brain className="h-8 w-8" />}
              title="Agentic AI Workspace"
              description="Multi-step reasoning, streaming responses, tool orchestration, and task history with full persistence."
            />
            <FeatureCard
              icon={<Gamepad2 className="h-8 w-8" />}
              title="Real 3D Game Engine"
              description="First-person puzzle platformer with physics, lighting, post-processing, and AI coach mode."
            />
            <FeatureCard
              icon={<Terminal className="h-8 w-8" />}
              title="Developer First"
              description="TypeScript, Next.js 14, Prisma, NextAuth, Docker, CI/CD — production-ready from day one."
            />
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Built with Modern Technology</h2>
          <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground/70">
            <span className="font-mono text-sm">Next.js 14</span>
            <span className="font-mono text-sm">TypeScript</span>
            <span className="font-mono text-sm">Tailwind CSS</span>
            <span className="font-mono text-sm">Prisma ORM</span>
            <span className="font-mono text-sm">PostgreSQL</span>
            <span className="font-mono text-sm">NextAuth.js</span>
            <span className="font-mono text-sm">React Three Fiber</span>
            <span className="font-mono text-sm">Three.js</span>
            <span className="font-mono text-sm">Zustand</span>
            <span className="font-mono text-sm">Docker</span>
            <span className="font-mono text-sm">GitHub Actions</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>Built with <span className="text-red-500">♥</span> by <a href="https://github.com/Aditya23rajsingh" className="underline hover:text-foreground" target="_blank" rel="noopener noreferrer">Aditya23rajsingh</a></p>
          <p className="mt-2 text-sm">Open source under MIT License</p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-6 hover:border-primary/50 transition-colors group">
      <div className="text-primary mb-4 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}