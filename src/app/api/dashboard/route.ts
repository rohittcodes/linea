import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getDashboardStats, getAnalyticsGrowth, getRevenueSeries, prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's active workspace
    const userWorkspace = await prisma.workspace.findFirst({
      where: {
        members: {
          some: {
            userId: session.user.id,
            role: { in: ['OWNER', 'ADMIN', 'MEMBER'] }
          }
        },
        isActive: true
      }
    })

    if (!userWorkspace) {
      return NextResponse.json(
        { error: 'No active workspace found' },
        { status: 400 }
      )
    }

    const [stats, analytics, revenueSeries] = await Promise.all([
      getDashboardStats(session.user.id, userWorkspace.id),
      getAnalyticsGrowth(session.user.id, userWorkspace.id, 'monthly'),
      getRevenueSeries(session.user.id, userWorkspace.id, 12),
    ])
            
            return NextResponse.json({
              success: true,
              data: {
                ...stats,
                analytics,
                revenueSeries,
              }
            })
  } catch (error) {
    console.error('Dashboard API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
