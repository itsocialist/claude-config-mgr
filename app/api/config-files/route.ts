import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET() {
  try {
    const homeDir = os.homedir()
    const claudeDir = path.join(homeDir, '.claude')

    const configData = {
      global: {
        claudeMd: null as any,
        settings: [] as any[],
        agents: [] as any[],
        hooks: [] as any[]
      },
      projects: [] as any[]
    }

    // Load global CLAUDE.md
    const globalClaudeMdPath = path.join(claudeDir, 'CLAUDE.md')
    if (await fileExists(globalClaudeMdPath)) {
      const content = await fs.readFile(globalClaudeMdPath, 'utf-8')
      const stat = await fs.stat(globalClaudeMdPath)
      configData.global.claudeMd = {
        path: globalClaudeMdPath,
        content,
        size: stat.size,
        lastModified: stat.mtime
      }
    }

    // Load global settings files
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
        configData.global.settings.push({
          name: file,
          path: filePath,
          content,
          size: stat.size,
          lastModified: stat.mtime,
          type: 'json'
        })
      }
    }

    // Load agent files
    const agentsDir = path.join(claudeDir, 'agents')
    if (await fileExists(agentsDir)) {
      const agentFiles = await fs.readdir(agentsDir)
      for (const file of agentFiles) {
        if (file.endsWith('.md') || file.endsWith('.json')) {
          const filePath = path.join(agentsDir, file)
          const content = await fs.readFile(filePath, 'utf-8')
          const stat = await fs.stat(filePath)
          configData.global.agents.push({
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

    // Find project-scoped Claude configurations
    try {
      // Search for .claude directories in workspace (limit depth to avoid long searches)
      const { stdout } = await execAsync(`find ~/workspace -maxdepth 3 -name ".claude" -type d 2>/dev/null | head -20`)
      const projectDirs = stdout.trim().split('\n').filter(Boolean)

      for (const projectClaudeDir of projectDirs) {
        const projectPath = path.dirname(projectClaudeDir)
        let projectName = path.basename(projectPath)

        // Avoid using hidden directories as project names
        if (projectName.startsWith('.')) {
          // Try to use parent directory name
          const parentPath = path.dirname(projectPath)
          const parentName = path.basename(parentPath)
          if (parentName && !parentName.startsWith('.')) {
            projectName = parentName
          }
        }

        const project: any = {
          name: projectName,
          path: projectPath,
          claudeDir: projectClaudeDir,
          claudeMd: null,
          settings: [],
          hooks: [],
          agents: []
        }

        // Check for project CLAUDE.md (first in .claude dir, then in project root)
        let projectClaudeMdPath = path.join(projectClaudeDir, 'CLAUDE.md')
        if (await fileExists(projectClaudeMdPath)) {
          const content = await fs.readFile(projectClaudeMdPath, 'utf-8')
          const stat = await fs.stat(projectClaudeMdPath)
          project.claudeMd = {
            path: projectClaudeMdPath,
            content,
            size: stat.size,
            lastModified: stat.mtime
          }
        } else {
          // Also check for CLAUDE.md in project root
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

        // Check for project settings files
        const projectSettingsFiles = [
          'settings.local.json',
          'settings.json',
          'config.json'
        ]

        for (const file of projectSettingsFiles) {
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

        // Check for hooks
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

        // Check for project agents
        const projectAgentsDir = path.join(projectClaudeDir, 'agents')
        if (await fileExists(projectAgentsDir)) {
          const agentFiles = await fs.readdir(projectAgentsDir)
          for (const file of agentFiles) {
            if (file.endsWith('.md') || file.endsWith('.json')) {
              const filePath = path.join(projectAgentsDir, file)
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

        configData.projects.push(project)
      }
    } catch (error) {
      console.error('Error searching for project configurations:', error)
    }

    // Also check for .mcp.json files in projects
    try {
      const { stdout } = await execAsync(`find ~/workspace -maxdepth 3 -name ".mcp.json" -type f 2>/dev/null | head -20`)
      const mcpFiles = stdout.trim().split('\n').filter(Boolean)

      for (const mcpPath of mcpFiles) {
        const projectPath = path.dirname(mcpPath)
        let projectName = path.basename(projectPath)

        // Avoid using hidden directories as project names
        if (projectName.startsWith('.')) {
          // Try to use parent directory name
          const parentPath = path.dirname(projectPath)
          const parentName = path.basename(parentPath)
          if (parentName && !parentName.startsWith('.')) {
            projectName = parentName
          }
        }

        // Check if we already have this project
        let project = configData.projects.find(p => p.path === projectPath)
        if (!project) {
          project = {
            name: projectName,
            path: projectPath,
            claudeDir: null,
            claudeMd: null,
            settings: [],
            hooks: [],
            agents: []
          }
          configData.projects.push(project)
        }

        // Add MCP file to settings
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
      }
    } catch (error) {
      console.error('Error searching for MCP files:', error)
    }

    // Also search for standalone CLAUDE.md files in workspace projects
    try {
      const { stdout } = await execAsync(`find ~/workspace -maxdepth 2 -name "CLAUDE.md" -type f 2>/dev/null | head -30`)
      const claudeMdFiles = stdout.trim().split('\n').filter(Boolean)

      for (const claudeMdPath of claudeMdFiles) {
        const projectPath = path.dirname(claudeMdPath)
        let projectName = path.basename(projectPath)

        // Avoid using hidden directories as project names
        if (projectName.startsWith('.')) {
          // Try to use parent directory name
          const parentPath = path.dirname(projectPath)
          const parentName = path.basename(parentPath)
          if (parentName && !parentName.startsWith('.')) {
            projectName = parentName
          }
        }

        // Skip if we already have this project from .claude directory search
        let existingProject = configData.projects.find(p => p.path === projectPath)

        if (!existingProject) {
          // Create new project entry
          existingProject = {
            name: projectName,
            path: projectPath,
            claudeDir: null,
            claudeMd: null,
            settings: [],
            hooks: [],
            agents: []
          }
          configData.projects.push(existingProject)
        }

        // Add CLAUDE.md if not already set
        if (!existingProject.claudeMd) {
          const content = await fs.readFile(claudeMdPath, 'utf-8')
          const stat = await fs.stat(claudeMdPath)
          existingProject.claudeMd = {
            path: claudeMdPath,
            content,
            size: stat.size,
            lastModified: stat.mtime
          }
        }
      }
    } catch (error) {
      console.error('Error searching for CLAUDE.md files:', error)
    }

    // Also search for standalone agent files in workspace projects
    try {
      const { stdout } = await execAsync(`find ~/workspace -maxdepth 3 -path "*/agents/*.md" -o -path "*/agents/*.json" 2>/dev/null | head -50`)
      const agentFiles = stdout.trim().split('\n').filter(Boolean)

      for (const agentPath of agentFiles) {
        // Extract project path from agent file path
        // Pattern: /path/to/project/agents/agent.md -> /path/to/project
        const agentsDir = path.dirname(agentPath)
        const projectPath = path.dirname(agentsDir)
        let projectName = path.basename(projectPath)

        // Avoid using hidden directories as project names
        if (projectName.startsWith('.')) {
          // Try to use parent directory name
          const parentPath = path.dirname(projectPath)
          const parentName = path.basename(parentPath)
          if (parentName && !parentName.startsWith('.')) {
            projectName = parentName
          }
        }

        // Skip if this is global agents directory
        if (projectPath === path.join(require('os').homedir(), '.claude')) {
          continue
        }

        // Find or create project entry
        let existingProject = configData.projects.find(p => p.path === projectPath)

        if (!existingProject) {
          // Create new project entry
          existingProject = {
            name: projectName,
            path: projectPath,
            claudeDir: null,
            claudeMd: null,
            settings: [],
            hooks: [],
            agents: []
          }
          configData.projects.push(existingProject)
        }

        // Check if agent already exists (avoid duplicates)
        const agentExists = existingProject.agents.some((agent: any) => agent.path === agentPath)

        if (!agentExists) {
          const content = await fs.readFile(agentPath, 'utf-8')
          const stat = await fs.stat(agentPath)
          const fileName = path.basename(agentPath)

          existingProject.agents.push({
            name: fileName,
            path: agentPath,
            content,
            size: stat.size,
            lastModified: stat.mtime,
            type: fileName.endsWith('.md') ? 'markdown' : 'json'
          })
        }
      }
    } catch (error) {
      console.error('Error searching for agent files:', error)
    }

    return NextResponse.json(configData)
  } catch (error) {
    console.error('Failed to load configuration files:', error)
    return NextResponse.json(
      { error: 'Failed to load configuration files' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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