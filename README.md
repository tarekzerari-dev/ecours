# 📚 Ecours - Smart Course & Attendance Management Platform

A modern, full-stack educational web application designed for students and administrators, featuring dynamic course management, dashboard analytics, and real-time QR code attendance tracking.

---

## ✨ Features

- **🔐 Robust Authentication & Role-Based Access Control**: Separate secure portals for students and administrators powered by Supabase Auth.
- **📊 Interactive Dashboards**: Real-time student statistics, enrolled courses, performance tracking, and schedules.
- **📱 QR Code Attendance Verification**: Dynamic QR code generation and integrated scanning (`/scan`) for fast, tamper-proof student check-ins.
- **⚡ High Performance & SSR**: Built with Next.js 16 App Router, React 19, and TanStack React Query for smooth data fetching and caching.
- **🎨 Modern UI & Animations**: Styled with Tailwind CSS v4 and fluid motion dynamics powered by Framer Motion.
- **🗄️ Scalable Cloud Database**: Supabase PostgreSQL backend with structured schema migrations and Row Level Security (RLS).

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Actions)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State & Caching**: [TanStack Query v5](https://tanstack.com/query/latest)
- **Database & Auth**: [Supabase](https://supabase.com/) (`@supabase/ssr`, `@supabase/supabase-js`)
- **QR Code Tools**: `qrcode` & camera scanning utilities
- **Language**: [TypeScript](https://www.typescriptlang.org/)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.18 or later)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/) or [yarn](https://yarnpkg.com/)
- A [Supabase](https://supabase.com/) account and project

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/tarekzerari-dev/ecours.git
   cd ecours
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase project credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Run Database Migrations**:
   Execute the migration SQL scripts inside `/migrations` in your Supabase SQL editor.

5. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

---

## 📁 Project Structure

```text
ecours/
├── app/                  # Next.js App Router
│   ├── (admin)/         # Admin dashboard and management views
│   ├── (auth)/          # Authentication (login/register)
│   ├── (dashboard)/     # Student dashboard and course overviews
│   ├── actions/         # Server actions for mutations & business logic
│   ├── api/             # API routes
│   └── scan/            # QR code camera scanner route
├── components/          # Reusable UI components
├── docs/                # Project documentation & design specs
├── lib/                 # Supabase client helpers and utility functions
├── migrations/          # SQL database schemas & migration scripts
└── public/              # Static assets, icons, and logos
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
