import { NextResponse } from 'next/server'
import { RealConfigManager } from '@/src/services/RealConfigManager'

export async function GET() {
  try {
    const manager = new RealConfigManager()
    await manager.initialize()
    
    const config = await manager.loadMainConfig()
    const profiles = await manager.listProfiles()
    
    // Check if config files exist
    const fs = await import('fs/promises')
    const os = await import('os')
    const path = await import('path')
    
    const homeDir = os.homedir()
    // Claude configs are in ~/.claude/ directory
    const desktopConfigPath = path.join(homeDir, '.claude/claude_desktop_config.json')
    const codeConfigPath = path.join(homeDir, '.claude/settings.json')
    
    let desktopConfigExists = false
    let codeConfigExists = false
    
    try {
      await fs.access(desktopConfigPath)
      desktopConfigExists = true
    } catch {}
    
    try {
      await fs.access(codeConfigPath)
      codeConfigExists = true
    } catch {}
    
    return NextResponse.json({
      currentProfile: config.currentProfile,
      totalProfiles: profiles.length,
      desktopConfigExists,
      codeConfigExists
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    )
  }
}