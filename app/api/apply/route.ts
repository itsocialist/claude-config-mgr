import { NextResponse } from 'next/server'
import { RealConfigManager } from '@/src/services/RealConfigManager'

export async function POST(request: Request) {
  try {
    const { name, backup = false, dryRun = false } = await request.json()
    
    if (!name) {
      return NextResponse.json(
        { error: 'Profile name is required' },
        { status: 400 }
      )
    }
    
    const manager = new RealConfigManager()
    await manager.initialize()
    
    await manager.applyProfile(name, { backup, dryRun })
    
    return NextResponse.json({ 
      success: true,
      message: dryRun 
        ? 'Dry run completed - no changes made'
        : 'Profile applied successfully'
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to apply profile' },
      { status: 500 }
    )
  }
}