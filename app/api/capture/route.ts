import { NextResponse } from 'next/server'
import { RealConfigManager } from '@/src/services/RealConfigManager'

export async function POST(request: Request) {
  try {
    const { name, isPrivate = false } = await request.json()
    
    if (!name) {
      return NextResponse.json(
        { error: 'Profile name is required' },
        { status: 400 }
      )
    }
    
    const manager = new RealConfigManager()
    await manager.initialize()
    
    const profile = await manager.createProfileFromCurrent(name, isPrivate)
    
    return NextResponse.json({ 
      success: true,
      profile: {
        name: profile.name,
        isPrivate: profile.isPrivate,
        hasDesktopConfig: !!profile.desktop?.desktopConfig,
        hasCodeConfig: !!profile.code?.mcpConfig
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to capture profile' },
      { status: 500 }
    )
  }
}