import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getTemplates, createTemplate, logActivity, prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || undefined
    const isPublic = searchParams.get('isPublic') === 'true'
    const search = searchParams.get('search') || undefined

    const templates = await getTemplates(session.user.id, {
      category,
      isPublic,
      search
    })
    
    return NextResponse.json({
      success: true,
      data: templates
    })
  } catch (error) {
    console.error('Templates GET API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.design) {
      return NextResponse.json(
        { error: 'Name and design are required' },
        { status: 400 }
      )
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

    const template = await createTemplate(session.user.id, userWorkspace.id, {
      name: body.name,
      description: body.description,
      category: body.category || 'business',
      design: body.design,
      branding: body.branding,
      layout: body.layout || 'standard',
      isDefault: body.isDefault || false,
      isPublic: body.isPublic || false,
      tags: body.tags || []
    })

    // Log activity
    await logActivity(session.user.id, userWorkspace.id, {
      type: 'TEMPLATE_CREATED',
      action: 'Created new template',
      description: `Created template: ${body.name}`,
      metadata: { templateId: template.id }
    })
    
    return NextResponse.json({
      success: true,
      data: template
    }, { status: 201 })
  } catch (error) {
    console.error('Templates POST API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
