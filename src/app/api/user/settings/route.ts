import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getUserWithSettings, prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserWithSettings(session.user.id)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: {
        profile: {
          name: user.name,
          email: user.email,
          image: user.image,
        },
        company: {
          name: user.companyName,
          email: user.companyEmail,
          phone: user.companyPhone,
          address: user.companyAddress,
          website: user.companyWebsite,
          logo: user.companyLogo,
        },
        preferences: {
          timezone: user.timezone,
          currency: user.currency,
          language: user.language,
          dateFormat: user.dateFormat,
          taxRate: user.taxRate,
          taxNumber: user.taxNumber,
        },
        notifications: {
          email: user.emailNotifications,
          push: user.pushNotifications,
          sms: user.smsNotifications,
        },
        subscription: {
          status: user.subscriptionStatus,
          plan: user.subscriptionPlan,
          endsAt: user.subscriptionEndsAt,
        }
      }
    })
  } catch (error) {
    console.error('User Settings API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Update user profile and settings
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        // Profile updates
        name: body.profile?.name,
        companyName: body.company?.name,
        companyEmail: body.company?.email,
        companyPhone: body.company?.phone,
        companyAddress: body.company?.address,
        companyWebsite: body.company?.website,
        companyLogo: body.company?.logo,
        
        // Preferences
        timezone: body.preferences?.timezone,
        currency: body.preferences?.currency,
        language: body.preferences?.language,
        dateFormat: body.preferences?.dateFormat,
        taxRate: body.preferences?.taxRate,
        taxNumber: body.preferences?.taxNumber,
        
        // Notifications
        emailNotifications: body.notifications?.email,
        pushNotifications: body.notifications?.push,
        smsNotifications: body.notifications?.sms,
      }
    })
    
    return NextResponse.json({
      success: true,
      data: updatedUser
    })
  } catch (error) {
    console.error('User Settings Update API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
