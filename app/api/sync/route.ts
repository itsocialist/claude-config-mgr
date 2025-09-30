import { NextResponse } from 'next/server'
import { RealConfigManager } from '@/src/services/RealConfigManager'

export async function POST(request: Request) {
  try {
    const { direction = 'desktop-to-code' } = await request.json()
    
    const manager = new RealConfigManager()
    await manager.initialize()
    
    await manager.syncMCPServers(direction as any)
    
    return NextResponse.json({ 
      success: true,
      message: `MCP servers synced (${direction})`
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to sync MCP servers' },
      { status: 500 }
    )
  }
}