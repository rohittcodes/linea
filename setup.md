# Linea Setup Guide

This guide will help you set up Linea - the invoice management system.

## Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- Email service (Gmail SMTP)

## Step 1: Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Application Base URL
NEXT_PUBLIC_BASE_URL="http://localhost:3001"

# Database - Replace with your PostgreSQL connection string
DATABASE_URL="postgresql://username:password@localhost:5432/linea_db"

# NextAuth.js - Generate a random secret
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-super-secret-key-here"

# Email Configuration
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@yourdomain.com"
```

### Getting Database URL

1. **Local PostgreSQL**: `postgresql://username:password@localhost:5432/linea_db`
2. **Neon (Recommended)**: Sign up at [neon.tech](https://neon.tech) and get your connection string
3. **Supabase**: Use your Supabase connection string
4. **Railway**: Use Railway's PostgreSQL service

### Getting Email Credentials

**Gmail SMTP**: 
- Enable 2-factor authentication
- Generate an app password
- Use your Gmail address and app password

### Generating NEXTAUTH_SECRET

Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

## Step 2: Database Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Push the database schema**:
   ```bash
   npx prisma db push
   ```

3. **Generate Prisma client**:
   ```bash
   npx prisma generate
   ```

## Step 3: Start the Application

1. **Run the development server**:
   ```bash
   npm run dev
   ```

2. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Step 4: First Time Setup

1. **Sign up**: Enter your email address on the login page
2. **Verify email**: Check your email for the verification link
3. **Complete setup**: You'll be redirected to create your first workspace
4. **Add clients**: Start by adding your first client
5. **Create invoices**: Create and send your first invoice

## Troubleshooting

### Database Connection Issues

- Ensure your PostgreSQL server is running
- Check your DATABASE_URL format
- Verify your database credentials

### Email Issues

- Check your email credentials
- Ensure your email provider allows app passwords
- Verify your EMAIL_FROM address

### Authentication Issues

- Ensure NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your setup
- Verify your email service is working

## Production Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

```env
# Application Base URL
NEXT_PUBLIC_BASE_URL="https://your-domain.com"

# Database
DATABASE_URL="your-production-database-url"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-secret"
EMAIL_SERVER_USER="your-production-email"
EMAIL_SERVER_PASSWORD="your-production-password"
EMAIL_FROM="noreply@yourdomain.com"
```

## Support

If you encounter issues:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---

Happy invoicing! 🎉
