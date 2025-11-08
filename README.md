# Linea - Invoice Management System

A modern, full-featured invoice management system built with Next.js, Prisma, PostgreSQL, and powered by [Rube MCP](https://rube.composio.dev) by [Composio](https://composio.dev) for MCP based development. Manage your clients, create professional invoices, track payments, and gain insights into your business performance.

## Features

- **📊 Dashboard** - Real-time analytics and business insights
- **📄 Invoice Management** - Create, send, and track invoices
- **👥 Client Management** - Organize and manage client relationships
- **🎨 Invoice Templates** - Professional, customizable invoice templates
- **💳 Payment Tracking** - Monitor payment status and history
- **🔔 Automated Reminders** - Send payment reminders automatically
- **🏢 Multi-workspace Support** - Manage multiple businesses or teams
- **📱 Responsive Design** - Works perfectly on desktop and mobile
- **🔐 Secure Authentication** - Email-based authentication with NextAuth.js

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **UI Components**: Radix UI, Lucide Icons
- **Charts**: Recharts
- **PDF Generation**: @react-pdf/renderer
- **Email**: Nodemailer (Gmail SMTP)

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm, yarn, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rohittcodes/linea.git
   cd linea
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory with the following variables:
   ```env
   # Database
   DATABASE_URL="postgresql://your-username:your-password@your-host:5432/your-database"
   
   # Application Base URL
   NEXT_PUBLIC_BASE_URL="http://localhost:3001"
   
   # NextAuth.js
   NEXTAUTH_URL="http://localhost:3001"
   NEXTAUTH_SECRET="your-nextauth-secret-key-here"
   
    # Google Gemini (AI SDK)
    GOOGLE_GENERATIVE_AI_API_KEY="your-google-api-key"

    # Provisional IRN (Demo Mode)
    # Gate all demo IRN generation with this flag (do NOT enable in production)
    EINV_DEMO_MODE="false"

    # Email Configuration (for NextAuth email provider)
   EMAIL_SERVER_USER="your-email@gmail.com"
   EMAIL_SERVER_PASSWORD="your-app-password"
   EMAIL_FROM="noreply@yourdomain.com"
   ```

4. **Set up the database**
   ```bash
   # Push the schema to your database
   npx prisma db push
   
   # Generate Prisma client
   npx prisma generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

6. **Open your browser**
   
    Navigate to [http://localhost:3001](http://localhost:3001) to see the application.

### AI SDK (Gemini) UI

- Page: `/ai` — chat with the Gemini model. Requires `GOOGLE_GENERATIVE_AI_API_KEY`.

### Provisional IRN (Demo) — No GSP required

- Set `EINV_DEMO_MODE=true` to enable demo IRN generation.
- From Invoices → menu:
  - Generate Provisional IRN: creates a deterministic provisional IRN and QR (watermarked NOT GOVERNMENT-REGISTERED).
  - Enter Official IRN: paste the real IRN when you receive it later.

### First Time Setup

1. **Sign up**: Visit the login page and enter your email address
2. **Verify email**: Check your email for the verification link
3. **Complete setup**: You'll be redirected to create your first workspace
4. **Add clients**: Start by adding your first client
5. **Create invoices**: Create and send your first invoice

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── invoices/         # Invoice-related components
│   ├── clients/          # Client-related components
│   └── templates/        # Template-related components
├── lib/                  # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Database utilities
│   └── utils.ts          # General utilities
└── types/                # TypeScript type definitions
```

## Database Schema

The application uses a comprehensive database schema with the following main entities:

- **Users** - User accounts and preferences
- **Workspaces** - Multi-tenant workspace support
- **Clients** - Client information and relationships
- **Invoices** - Invoice data and line items
- **Templates** - Invoice template designs
- **Payments** - Payment tracking and history
- **Analytics** - Business metrics and reporting

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linting
- `npm run format` - Format code
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have questions, please:

1. Check the [Issues](https://github.com/rohittcodes/linea/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---
