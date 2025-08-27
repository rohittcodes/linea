import { PrismaClient, Prisma } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function calculateInvoiceTotals(lineItems: Array<{
  quantity: Decimal
  unitPrice: Decimal
}>, taxRate: Decimal = new Decimal(0), discountAmount: Decimal = new Decimal(0)) {
  const subtotal = lineItems.reduce((sum, item) => {
    return sum.add(item.quantity.mul(item.unitPrice))
  }, new Decimal(0))
  
  const taxAmount = subtotal.mul(taxRate)
  const total = subtotal.add(taxAmount).sub(discountAmount)
  
  return {
    subtotal,
    taxAmount,
    discountAmount,
    total
  }
}

export function generateInvoiceNumber(userId: string, prefix: string = 'INV') {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

// ============================================================================
// WORKSPACE MANAGEMENT
// ============================================================================

export async function createDefaultWorkspace(userId: string) {
  return prisma.workspace.create({
    data: {
      name: "Personal Workspace",
      type: "PERSONAL",
      description: "Your personal workspace",
      isDefault: true,
      isActive: true,
      subscriptionStatus: "FREE",
      members: {
        create: {
          userId: userId,
          role: "OWNER"
        }
      }
    }
  })
}

export async function getUserWorkspaces(userId: string) {
  return prisma.workspace.findMany({
    where: {
      members: {
        some: {
          userId: userId
        }
      }
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      },
      _count: {
        select: {
          members: true
        }
      }
    },
    orderBy: [
      { isDefault: 'desc' },
      { createdAt: 'asc' }
    ]
  })
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export async function getUserWithSettings(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      settings: true,
      _count: {
        select: {
          invoices: true,
          clients: true,
          templates: true
        }
      }
    }
  })
}

export async function updateUserProfile(userId: string, data: {
  name?: string
  email?: string
  companyName?: string
  companyEmail?: string
  companyPhone?: string
  companyAddress?: string
  companyWebsite?: string
  companyLogo?: string
  timezone?: string
  currency?: string
  language?: string
  dateFormat?: string
  taxRate?: Decimal
  taxNumber?: string
}) {
  return prisma.user.update({
    where: { id: userId },
    data
  })
}

export async function updateUserNotificationSettings(userId: string, data: {
  emailNotifications?: boolean
  pushNotifications?: boolean
  smsNotifications?: boolean
}) {
  return prisma.user.update({
    where: { id: userId },
    data
  })
}

// ============================================================================
// CLIENT MANAGEMENT
// ============================================================================

export async function getClients(userId: string, options: {
  search?: string
  status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
  page?: number
  limit?: number
} = {}) {
  const { search, status, page = 1, limit = 10 } = options
  const skip = (page - 1) * limit

  const where: Prisma.ClientWhereInput = {
    userId,
    ...(status && { status }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { companyName: { contains: search, mode: 'insensitive' as const } }
      ]
    })
  }

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      include: {
        _count: {
          select: { invoices: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.client.count({ where })
  ])

  return {
    clients,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  }
}

export async function getClient(clientId: string, userId: string) {
  return prisma.client.findFirst({
    where: { id: clientId, userId },
    include: {
      invoices: {
        orderBy: { createdAt: 'desc' },
        take: 5
      },
      _count: {
        select: { invoices: true }
      }
    }
  })
}

export async function createClient(userId: string, workspaceId: string, data: {
  name: string
  email: string
  phone?: string
  website?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  companyName?: string
  taxNumber?: string
  notes?: string
  tags?: string[]
}) {
  return prisma.client.create({
    data: {
      ...data,
      userId,
      workspaceId
    }
  })
}

export async function updateClient(clientId: string, userId: string, data: any) {
  return prisma.client.updateMany({
    where: { id: clientId, userId },
    data
  })
}

export async function deleteClient(clientId: string, userId: string) {
  return prisma.client.deleteMany({
    where: { id: clientId, userId }
  })
}

// ============================================================================
// INVOICE MANAGEMENT
// ============================================================================

export async function getInvoices(userId: string, options: {
  status?: 'DRAFT' | 'SENT' | 'VIEWED' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED'
  clientId?: string
  search?: string
  page?: number
  limit?: number
  dateFrom?: Date
  dateTo?: Date
} = {}) {
  const { status, clientId, search, page = 1, limit = 10, dateFrom, dateTo } = options
  const skip = (page - 1) * limit

  const where: Prisma.InvoiceWhereInput = {
    userId,
    ...(status && { status }),
    ...(clientId && { clientId }),
    ...(search && {
      OR: [
        { invoiceNumber: { contains: search, mode: 'insensitive' as const } },
        { title: { contains: search, mode: 'insensitive' as const } },
        { client: { name: { contains: search, mode: 'insensitive' as const } } }
      ]
    }),
    ...(dateFrom && dateTo && {
      issueDate: {
        gte: dateFrom,
        lte: dateTo
      }
    })
  }

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: {
        client: {
          select: { name: true, email: true }
        },
        lineItems: {
          select: { amount: true }
        },
        _count: {
          select: { lineItems: true, payments: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.invoice.count({ where })
  ])

  return {
    invoices,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  }
}

export async function getInvoice(invoiceId: string, userId: string) {
  return prisma.invoice.findFirst({
    where: { id: invoiceId, userId },
    include: {
      client: true,
      template: true,
      lineItems: true,
      payments: {
        orderBy: { createdAt: 'desc' }
      },
      reminders: {
        orderBy: { scheduledAt: 'asc' }
      }
    }
  })
}

export async function createInvoice(userId: string, workspaceId: string, data: {
  clientId: string
  templateId?: string
  title?: string
  description?: string
  dueDate: Date
  currency?: string
  taxRate?: Decimal
  notes?: string
  terms?: string
  tags?: string[]
  lineItems: Array<{
    description: string
    quantity: Decimal
    unitPrice: Decimal
    sku?: string
    unit?: string
    notes?: string
  }>
}) {
  const { lineItems, ...invoiceData } = data
  
  // Calculate totals
  const totals = calculateInvoiceTotals(
    lineItems,
    invoiceData.taxRate || new Decimal(0),
    new Decimal(0)
  )

  return prisma.invoice.create({
    data: {
      ...invoiceData,
      userId,
      workspaceId,
      invoiceNumber: generateInvoiceNumber(userId),
      ...totals,
      lineItems: {
        create: lineItems.map(item => ({
          ...item,
          amount: item.quantity.mul(item.unitPrice)
        }))
      }
    },
    include: {
      client: true,
      lineItems: true
    }
  })
}

export async function updateInvoice(invoiceId: string, userId: string, data: any) {
  return prisma.invoice.updateMany({
    where: { id: invoiceId, userId },
    data
  })
}

export async function deleteInvoice(invoiceId: string, userId: string) {
  return prisma.invoice.deleteMany({
    where: { id: invoiceId, userId }
  })
}

export async function sendInvoice(invoiceId: string, userId: string) {
  return prisma.invoice.updateMany({
    where: { id: invoiceId, userId },
    data: {
      status: 'SENT',
      sentAt: new Date()
    }
  })
}

// ============================================================================
// TEMPLATE MANAGEMENT
// ============================================================================

export async function getTemplates(userId: string, options: {
  category?: string
  isPublic?: boolean
  search?: string
} = {}) {
  const { category, isPublic, search } = options

  const where: Prisma.TemplateWhereInput = {
    OR: [
      { userId },
      { isPublic: true }
    ],
    ...(category && { category }),
    ...(isPublic !== undefined && { isPublic }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } }
      ]
    })
  }

  return prisma.template.findMany({
    where,
    orderBy: [
      { isDefault: 'desc' },
      { updatedAt: 'desc' }
    ]
  })
}

export async function getTemplate(templateId: string, userId: string) {
  return prisma.template.findFirst({
    where: {
      id: templateId,
      OR: [
        { userId },
        { isPublic: true }
      ]
    }
  })
}

export async function createTemplate(userId: string, workspaceId: string, data: {
  name: string
  description?: string
  category?: string
  design: any
  branding?: any
  layout?: string
  isDefault?: boolean
  isPublic?: boolean
  tags?: string[]
}) {
  // If this is set as default, unset other defaults
  if (data.isDefault) {
    await prisma.template.updateMany({
      where: { userId, workspaceId, isDefault: true },
      data: { isDefault: false }
    })
  }

  return prisma.template.create({
    data: {
      ...data,
      userId,
      workspaceId
    }
  })
}

export async function updateTemplate(templateId: string, userId: string, data: any) {
  // If this is set as default, unset other defaults
  if (data.isDefault) {
    await prisma.template.updateMany({
      where: { userId, isDefault: true, id: { not: templateId } },
      data: { isDefault: false }
    })
  }

  return prisma.template.updateMany({
    where: { id: templateId, userId },
    data
  })
}

export async function deleteTemplate(templateId: string, userId: string) {
  return prisma.template.deleteMany({
    where: { id: templateId, userId }
  })
}

// ============================================================================
// PAYMENT MANAGEMENT
// ============================================================================

export async function getPayments(userId: string, options: {
  invoiceId?: string
  status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED'
  page?: number
  limit?: number
} = {}) {
  const { invoiceId, status, page = 1, limit = 10 } = options
  const skip = (page - 1) * limit

  const where: Prisma.PaymentWhereInput = {
    userId,
    ...(invoiceId && { invoiceId }),
    ...(status && { status })
  }

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        invoice: {
          select: { invoiceNumber: true, total: true }
        },
        client: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.payment.count({ where })
  ])

  return {
    payments,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  }
}

export async function createPayment(userId: string, workspaceId: string, data: {
  invoiceId: string
  clientId: string
  amount: Decimal
  currency?: string
  method: 'CREDIT_CARD' | 'BANK_TRANSFER' | 'PAYPAL' | 'STRIPE' | 'CASH' | 'CHECK' | 'OTHER'
  transactionId?: string
  gateway?: string
  gatewayData?: any
  notes?: string
}) {
  return prisma.payment.create({
    data: {
      ...data,
      userId,
      workspaceId
    }
  })
}

// ============================================================================
// REMINDER MANAGEMENT
// ============================================================================

export async function getReminders(userId: string, options: {
  invoiceId?: string
  status?: 'PENDING' | 'SENT' | 'FAILED' | 'CANCELLED'
  type?: 'DUE_DATE' | 'OVERDUE' | 'FOLLOW_UP' | 'CUSTOM'
} = {}) {
  const { invoiceId, status, type } = options

  const where: Prisma.ReminderWhereInput = {
    userId,
    ...(invoiceId && { invoiceId }),
    ...(status && { status }),
    ...(type && { type })
  }

  return prisma.reminder.findMany({
    where,
    include: {
      invoice: {
        select: { invoiceNumber: true, total: true, dueDate: true }
      }
    },
    orderBy: { scheduledAt: 'asc' }
  })
}

export async function createReminder(userId: string, workspaceId: string, data: {
  invoiceId: string
  type: 'DUE_DATE' | 'OVERDUE' | 'FOLLOW_UP' | 'CUSTOM'
  scheduledAt: Date
  subject?: string
  message?: string
}) {
  return prisma.reminder.create({
    data: {
      ...data,
      userId,
      workspaceId
    }
  })
}

// ============================================================================
// ACTIVITY LOGGING
// ============================================================================

export async function logActivity(userId: string, workspaceId: string, data: {
  type: 'INVOICE_CREATED' | 'INVOICE_UPDATED' | 'INVOICE_SENT' | 'INVOICE_PAID' | 'CLIENT_CREATED' | 'CLIENT_UPDATED' | 'PAYMENT_RECEIVED' | 'TEMPLATE_CREATED' | 'USER_LOGIN' | 'USER_LOGOUT' | 'SETTINGS_UPDATED'
  action: string
  description?: string
  metadata?: any
  invoiceId?: string
  ipAddress?: string
  userAgent?: string
}) {
  return prisma.activity.create({
    data: {
      ...data,
      userId,
      workspaceId
    }
  })
}

export async function getActivities(userId: string, options: {
  type?: 'INVOICE_CREATED' | 'INVOICE_UPDATED' | 'INVOICE_SENT' | 'INVOICE_PAID' | 'CLIENT_CREATED' | 'CLIENT_UPDATED' | 'PAYMENT_RECEIVED' | 'TEMPLATE_CREATED' | 'USER_LOGIN' | 'USER_LOGOUT' | 'SETTINGS_UPDATED'
  invoiceId?: string
  page?: number
  limit?: number
} = {}) {
  const { type, invoiceId, page = 1, limit = 20 } = options
  const skip = (page - 1) * limit

  const where: Prisma.ActivityWhereInput = {
    userId,
    ...(type && { type }),
    ...(invoiceId && { invoiceId })
  }

  const [activities, total] = await Promise.all([
    prisma.activity.findMany({
      where,
      include: {
        invoice: {
          select: { invoiceNumber: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.activity.count({ where })
  ])

  return {
    activities,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  }
}

// ============================================================================
// ANALYTICS & REPORTING
// ============================================================================

export async function createAnalyticsSnapshot(userId: string, workspaceId: string, period: 'daily' | 'weekly' | 'monthly' = 'monthly') {
  const now = new Date()
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  // Get current metrics
  const currentStats = await getDashboardStats(userId, workspaceId)
  
  // Get previous period for comparison
  let previousDate: Date
  if (period === 'monthly') {
    previousDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  } else if (period === 'weekly') {
    previousDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  } else {
    previousDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  }
  
  // Get previous period snapshot
  const previousSnapshot = await prisma.analyticsSnapshot.findFirst({
    where: {
      userId,
      workspaceId,
      date: previousDate,
      period
    }
  })
  
  // Calculate growth percentages
  const revenueGrowth = previousSnapshot ? 
    currentStats.totalRevenue > 0 && previousSnapshot.totalRevenue.gt(0) ?
      new Decimal(currentStats.totalRevenue - Number(previousSnapshot.totalRevenue)).div(previousSnapshot.totalRevenue).mul(100) :
      new Decimal(0) : null
  
  const invoiceGrowth = previousSnapshot ?
    currentStats.totalInvoices > 0 && previousSnapshot.totalInvoices > 0 ?
      new Decimal(((currentStats.totalInvoices - previousSnapshot.totalInvoices) / previousSnapshot.totalInvoices) * 100) :
      new Decimal(0) : null
  
  const clientGrowth = previousSnapshot ?
    currentStats.totalClients > 0 && previousSnapshot.totalClients > 0 ?
      new Decimal(((currentStats.totalClients - previousSnapshot.totalClients) / previousSnapshot.totalClients) * 100) :
      new Decimal(0) : null
  
  // Create or update snapshot
  return prisma.analyticsSnapshot.upsert({
    where: {
      userId_workspaceId_date_period: {
        userId,
        workspaceId: 'default', // We'll need to get the actual workspaceId
        date,
        period
      }
    },
    update: {
      totalRevenue: currentStats.totalRevenue,
      totalInvoices: currentStats.totalInvoices,
      totalClients: currentStats.totalClients,
      paidInvoices: 0, // We'll calculate this separately
      pendingInvoices: currentStats.pendingInvoices,
      overdueInvoices: currentStats.overdueInvoices,
      revenueGrowth,
      invoiceGrowth,
      clientGrowth
    },
    create: {
      userId,
      workspaceId,
      date,
      period,
      totalRevenue: currentStats.totalRevenue,
      totalInvoices: currentStats.totalInvoices,
      totalClients: currentStats.totalClients,
      paidInvoices: 0, // We'll calculate this separately
      pendingInvoices: currentStats.pendingInvoices,
      overdueInvoices: currentStats.overdueInvoices,
      revenueGrowth,
      invoiceGrowth,
      clientGrowth
    }
  })
}

export async function getAnalyticsGrowth(userId: string, workspaceId: string, period: 'daily' | 'weekly' | 'monthly' = 'monthly') {
  const now = new Date()
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  const currentSnapshot = await prisma.analyticsSnapshot.findFirst({
    where: {
      userId,
      workspaceId,
      date,
      period
    }
  })
  
  if (!currentSnapshot) {
    // Create initial snapshot if none exists
    await createAnalyticsSnapshot(userId, workspaceId, period)
    return {
      revenueGrowth: new Decimal(0),
      invoiceGrowth: new Decimal(0),
      clientGrowth: new Decimal(0)
    }
  }
  
  return {
    revenueGrowth: currentSnapshot.revenueGrowth || new Decimal(0),
    invoiceGrowth: currentSnapshot.invoiceGrowth || new Decimal(0),
    clientGrowth: currentSnapshot.clientGrowth || new Decimal(0)
  }
}

export async function trackRevenue(userId: string, workspaceId: string, data: {
  amount: Decimal
  currency?: string
  source: string
  invoiceId?: string
  clientId?: string
  notes?: string
}) {
  const date = new Date()
  return prisma.revenueTracking.create({
    data: {
      userId,
      workspaceId,
      date,
      amount: data.amount,
      currency: data.currency || 'USD',
      source: data.source,
      invoiceId: data.invoiceId,
      clientId: data.clientId,
      notes: data.notes
    }
  })
}

// ============================================================================
// DASHBOARD STATISTICS
// ============================================================================

export async function getDashboardStats(userId: string, workspaceId: string) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const [
    totalInvoices,
    totalClients,
    totalRevenue,
    totalAmount,
    monthlyRevenue,
    pendingInvoices,
    overdueInvoices,
    recentInvoices,
    recentClients
  ] = await Promise.all([
    // Total invoices
    prisma.invoice.count({ where: { userId, workspaceId } }),
    
    // Total clients
    prisma.client.count({ where: { userId, workspaceId } }),
    
    // Total revenue (only PAID invoices)
    prisma.invoice.aggregate({
      where: { userId, workspaceId, status: 'PAID' },
      _sum: { total: true }
    }),
    
    // Total amount (ALL invoices including drafts)
    prisma.invoice.aggregate({
      where: { userId, workspaceId },
      _sum: { total: true }
    }),
    
    // Monthly revenue
    prisma.invoice.aggregate({
      where: {
        userId,
        workspaceId,
        status: 'PAID',
        paidDate: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      _sum: { total: true }
    }),
    
    // Pending invoices
    prisma.invoice.count({
      where: { userId, workspaceId, status: 'SENT' }
    }),
    
    // Overdue invoices
    prisma.invoice.count({
      where: {
        userId,
        workspaceId,
        status: 'SENT',
        dueDate: { lt: now }
      }
    }),
    
    // Recent invoices
    prisma.invoice.findMany({
      where: { userId, workspaceId },
      include: {
        client: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    }),
    
    // Recent clients
    prisma.client.findMany({
      where: { userId, workspaceId },
      include: {
        _count: { select: { invoices: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
  ])

  return {
    totalInvoices,
    totalClients,
    totalRevenue: Number(totalRevenue._sum.total || 0),
    totalAmount: Number(totalAmount._sum.total || 0),
    monthlyRevenue: Number(monthlyRevenue._sum.total || 0),
    pendingInvoices,
    overdueInvoices,
    recentInvoices,
    recentClients
  }
}

export async function getRevenueSeries(userId: string, workspaceId: string, months: number = 12) {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const invoices = await prisma.invoice.findMany({
    where: {
      userId,
      workspaceId,
      // Show all invoices for now, not just PAID ones
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    select: { createdAt: true, total: true },
  })

  // Initialize buckets for each month in range
  const buckets: Record<string, Decimal> = {}
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    buckets[key] = new Decimal(0)
  }

  for (const inv of invoices) {
    if (!inv.createdAt) continue
    const key = `${inv.createdAt.getFullYear()}-${String(inv.createdAt.getMonth() + 1).padStart(2, '0')}`
    if (!buckets[key]) buckets[key] = new Decimal(0)
    buckets[key] = buckets[key].add(inv.total)
  }

  const series = Object.entries(buckets)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([month, total]) => ({ month, total: Number(total) }))

  return series
}
