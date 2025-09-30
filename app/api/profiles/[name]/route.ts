import { NextResponse } from 'next/server'
import { RealConfigManager } from '@/src/services/RealConfigManager'

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const manager = new RealConfigManager()
    await manager.initialize()
    
    const profile = await manager.loadProfile(params.name)
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }
    
    const sanitized = await manager.sanitizeProfile(profile)
    
    return NextResponse.json({
      ...profile,
      sanitized
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load profile' },
      { status: 500 }
    )
  }
}