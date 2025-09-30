import { NextResponse } from 'next/server'
import { RealConfigManager } from '@/src/services/RealConfigManager'

export async function GET() {
  try {
    const manager = new RealConfigManager()
    await manager.initialize()
    
    const profileNames = await manager.listProfiles()
    const config = await manager.loadMainConfig()
    
    const profiles = await Promise.all(
      profileNames.map(async (name) => {
        const profile = await manager.loadProfile(name)
        return {
          name,
          description: profile?.description,
          isPrivate: profile?.isPrivate || false
        }
      })
    )
    
    return NextResponse.json({ profiles })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to list profiles' },
      { status: 500 }
    )
  }
}