import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const projectId = params.projectId

    if (projectId === 'global') {
      // Return global configuration
      const homeDir = os.homedir()
      const claudeDir = path.join(homeDir, '.claude')

      const globalConfig = {
        name: 'Global Configuration',
        path: claudeDir,
        claudeMd: null as any,
        settings: [] as any[],
        agents: [] as any[]
      }

      // Load global CLAUDE.md
      const globalClaudeMdPath = path.join(claudeDir, 'CLAUDE.md')
      if (await fileExists(globalClaudeMdPath)) {
        const content = await fs.readFile(globalClaudeMdPath, 'utf-8')
        const stat = await fs.stat(globalClaudeMdPath)
        globalConfig.claudeMd = {
          path: globalClaudeMdPath,
          content,
          size: stat.size,
          lastModified: stat.mtime
        }
      }

      // Load global settings
      const settingsFiles = [
        'settings.json',
        'settings.local.json',
        'claude_desktop_config.json',
        'config.json'
      ]

      for (const file of settingsFiles) {
        const filePath = path.join(claudeDir, file)
        if (await fileExists(filePath)) {
          const content = await fs.readFile(filePath, 'utf-8')
          const stat = await fs.stat(filePath)
          globalConfig.settings.push({
            name: file,
            path: filePath,
            content,
            size: stat.size,
            lastModified: stat.mtime,
            type: 'json'
          })
        }
      }

      // Load agents
      const agentsDir = path.join(claudeDir, 'agents')
      if (await fileExists(agentsDir)) {
        const agentFiles = await fs.readdir(agentsDir)
        for (const file of agentFiles) {
          if (file.endsWith('.md') || file.endsWith('.json')) {
            const filePath = path.join(agentsDir, file)
            const content = await fs.readFile(filePath, 'utf-8')
            const stat = await fs.stat(filePath)
            globalConfig.agents.push({
              name: file,
              path: filePath,
              content,
              size: stat.size,
              lastModified: stat.mtime,
              type: file.endsWith('.md') ? 'markdown' : 'json'
            })
          }
        }
      }

      return NextResponse.json(globalConfig)
    } else {
      // Return specific project configuration
      const projectPath = decodeURIComponent(projectId).replace('~', os.homedir())
      const projectName = path.basename(projectPath)

      const project: any = {
        name: projectName,
        path: projectPath,
        claudeDir: null,
        claudeMd: null,
        settings: [],
        agents: [],
        hooks: [],
        mcpServers: []
      }

      // Check for .claude directory
      const projectClaudeDir = path.join(projectPath, '.claude')
      if (await fileExists(projectClaudeDir)) {
        project.claudeDir = projectClaudeDir

        // Load CLAUDE.md
        const claudeMdPath = path.join(projectClaudeDir, 'CLAUDE.md')
        if (await fileExists(claudeMdPath)) {
          const content = await fs.readFile(claudeMdPath, 'utf-8')
          const stat = await fs.stat(claudeMdPath)
          project.claudeMd = {
            path: claudeMdPath,
            content,
            size: stat.size,
            lastModified: stat.mtime
          }
        }

        // Load settings
        const settingsFiles = ['settings.local.json', 'settings.json', 'config.json']
        for (const file of settingsFiles) {
          const filePath = path.join(projectClaudeDir, file)
          if (await fileExists(filePath)) {
            const content = await fs.readFile(filePath, 'utf-8')
            const stat = await fs.stat(filePath)
            project.settings.push({
              name: file,
              path: filePath,
              content,
              size: stat.size,
              lastModified: stat.mtime,
              type: 'json'
            })
          }
        }

        // Load agents
        const agentsDir = path.join(projectClaudeDir, 'agents')
        if (await fileExists(agentsDir)) {
          const agentFiles = await fs.readdir(agentsDir)
          for (const file of agentFiles) {
            if (file.endsWith('.md') || file.endsWith('.json')) {
              const filePath = path.join(agentsDir, file)
              const content = await fs.readFile(filePath, 'utf-8')
              const stat = await fs.stat(filePath)
              project.agents.push({
                name: file,
                path: filePath,
                content,
                size: stat.size,
                lastModified: stat.mtime,
                type: file.endsWith('.md') ? 'markdown' : 'json'
              })
            }
          }
        }

        // Load hooks
        const hooksDir = path.join(projectClaudeDir, 'hooks')
        if (await fileExists(hooksDir)) {
          const hookFiles = await fs.readdir(hooksDir)
          for (const file of hookFiles) {
            const filePath = path.join(hooksDir, file)
            const stat = await fs.stat(filePath)
            project.hooks.push({
              name: file,
              path: filePath,
              size: stat.size,
              lastModified: stat.mtime
            })
          }
        }
      }

      // Check for root CLAUDE.md if not in .claude
      if (!project.claudeMd) {
        const rootClaudeMdPath = path.join(projectPath, 'CLAUDE.md')
        if (await fileExists(rootClaudeMdPath)) {
          const content = await fs.readFile(rootClaudeMdPath, 'utf-8')
          const stat = await fs.stat(rootClaudeMdPath)
          project.claudeMd = {
            path: rootClaudeMdPath,
            content,
            size: stat.size,
            lastModified: stat.mtime
          }
        }
      }

      // Check for .mcp.json
      const mcpPath = path.join(projectPath, '.mcp.json')
      if (await fileExists(mcpPath)) {
        const content = await fs.readFile(mcpPath, 'utf-8')
        const stat = await fs.stat(mcpPath)
        project.settings.push({
          name: '.mcp.json',
          path: mcpPath,
          content,
          size: stat.size,
          lastModified: stat.mtime,
          type: 'json'
        })

        // Parse MCP servers
        try {
          const mcpConfig = JSON.parse(content)
          if (mcpConfig.mcpServers) {
            Object.entries(mcpConfig.mcpServers).forEach(([name, server]: [string, any]) => {
              project.mcpServers.push({ name, ...server })
            })
          }
        } catch (e) {}
      }

      // Check for standalone agents directory
      const standaloneAgentsDir = path.join(projectPath, 'agents')
      if (await fileExists(standaloneAgentsDir) && !project.claudeDir) {
        const agentFiles = await fs.readdir(standaloneAgentsDir)
        for (const file of agentFiles) {
          if (file.endsWith('.md') || file.endsWith('.json')) {
            const filePath = path.join(standaloneAgentsDir, file)
            const content = await fs.readFile(filePath, 'utf-8')
            const stat = await fs.stat(filePath)
            project.agents.push({
              name: file,
              path: filePath,
              content,
              size: stat.size,
              lastModified: stat.mtime,
              type: file.endsWith('.md') ? 'markdown' : 'json'
            })
          }
        }
      }

      return NextResponse.json(project)
    }
  } catch (error) {
    console.error('Failed to load project configuration:', error)
    return NextResponse.json(
      { error: 'Failed to load project configuration' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { path: filePath, content } = await request.json()

    if (!filePath || content === undefined) {
      return NextResponse.json(
        { error: 'Path and content are required' },
        { status: 400 }
      )
    }

    // Create backup
    const backupPath = `${filePath}.backup-${Date.now()}`
    try {
      const originalContent = await fs.readFile(filePath, 'utf-8')
      await fs.writeFile(backupPath, originalContent, 'utf-8')
    } catch (error) {
      // File might not exist yet, that's okay
    }

    // Ensure directory exists
    const dir = path.dirname(filePath)
    await fs.mkdir(dir, { recursive: true })

    // Write file
    await fs.writeFile(filePath, content, 'utf-8')

    return NextResponse.json({
      success: true,
      path: filePath,
      backupPath
    })
  } catch (error) {
    console.error('Failed to save configuration file:', error)
    return NextResponse.json(
      { error: 'Failed to save configuration file' },
      { status: 500 }
    )
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}