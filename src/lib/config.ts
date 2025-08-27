export const config = {
  // Base URL for the application
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001',
  
  // Database
  database: {
    url: process.env.DATABASE_URL,
  },
  
  // Authentication
  auth: {
    url: process.env.NEXTAUTH_URL || 'http://localhost:3001',
    secret: process.env.NEXTAUTH_SECRET,
  },
  
  // Email
  email: {
    user: process.env.EMAIL_SERVER_USER,
    password: process.env.EMAIL_SERVER_PASSWORD,
    from: process.env.EMAIL_FROM,
  },
  
  // App settings
  app: {
    name: 'Linea',
    description: 'Invoice Management System',
  },
} as const;

// Helper function to get full URL for a path
export function getFullUrl(path: string): string {
  const baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

// Helper function to get public invoice URL
export function getInvoiceUrl(invoiceId: string): string {
  return getFullUrl(`/invoice/${invoiceId}`);
}
