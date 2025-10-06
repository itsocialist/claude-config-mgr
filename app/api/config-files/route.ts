import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

// Recursive function to find .claude directories using Node.js fs
async function findClaudeDirsRecursive(dir: string, maxDepth: number, currentDepth = 0): Promise<string[]> {
  if (currentDepth >= maxDepth) return []

  const results: string[] = []

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      if (!entry.isDirectory()) continue

      const fullPath = path.join(dir, entry.name)

      // Check if this is a .claude directory
      if (entry.name === '.claude') {
        results.push(fullPath)
      }

      // Skip hidden directories (except .claude) and common non-project directories
      if (entry.name.startsWith('.') && entry.name !== '.claude') continue
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'build') continue

      // Recursively search subdirectories
      const subResults = await findClaudeDirsRecursive(fullPath, maxDepth, currentDepth + 1)
      results.push(...subResults)
    }
  } catch (error) {
    // Silently skip directories we can't read
  }

  return results
}

// Recursive function to find specific files using Node.js fs
async function findFilesRecursive(dir: string, filename: string, maxDepth: number, currentDepth = 0): Promise<string[]> {
  if (currentDepth >= maxDepth) return []

  const results: string[] = []

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      // Check if this is the file we're looking for
      if (entry.isFile() && entry.name === filename) {
        results.push(fullPath)
      }

      // Recursively search subdirectories
      if (entry.isDirectory()) {
        // Skip hidden directories and common non-project directories
        if (entry.name.startsWith('.')) continue
        if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'build') continue

        const subResults = await findFilesRecursive(fullPath, filename, maxDepth, currentDepth + 1)
        results.push(...subResults)
      }
    }
  } catch (error) {
    // Silently skip directories we can't read
  }

  return results
}

// Recursive function to find agent files in agents directories
async function findAgentFilesRecursive(dir: string, maxDepth: number, currentDepth = 0): Promise<string[]> {
  if (currentDepth >= maxDepth) return []

  const results: string[] = []

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      // If this is an 'agents' directory, look for agent files inside
      if (entry.isDirectory() && entry.name === 'agents') {
        try {
          const agentEntries = await fs.readdir(fullPath, { withFileTypes: true })
          for (const agentEntry of agentEntries) {
            if (agentEntry.isFile() && (agentEntry.name.endsWith('.md') || agentEntry.name.endsWith('.json'))) {
              results.push(path.join(fullPath, agentEntry.name))
            }
          }
        } catch {
          // Skip if can't read agents directory
        }
      }

      // Recursively search subdirectories
      if (entry.isDirectory()) {
        // Skip hidden directories and common non-project directories
        if (entry.name.startsWith('.')) continue
        if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'build') continue

        const subResults = await findAgentFilesRecursive(fullPath, maxDepth, currentDepth + 1)
        results.push(...subResults)
      }
    }
  } catch (error) {
    // Silently skip directories we can't read
  }

  return results
}

export async function GET(request: NextRequest) {
  try {
    const homeDir = os.homedir()
    const claudeDir = path.join(homeDir, '.claude')

    // Get workspace paths from query parameter
    const searchParams = request.nextUrl.searchParams
    const workspacePathsParam = searchParams.get('workspacePaths')
    let workspacePaths: string[] = []

    if (workspacePathsParam) {
      try {
        const parsed = JSON.parse(workspacePathsParam)
        if (Array.isArray(parsed) && parsed.length > 0) {
          workspacePaths = parsed
        }
      } catch {
        // Use default workspace if parse fails
        workspacePaths = [`${homeDir}/workspace`]
      }
    }

    // If no workspace paths provided, default to ~/workspace
    if (workspacePaths.length === 0) {
      workspacePaths = [`${homeDir}/workspace`]
    }

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

    // Find project-scoped Claude configurations using Node.js fs
    try {
      const projectDirs: string[] = []
      for (const workspacePath of workspacePaths) {
        const expandedPath = workspacePath.replace(/^~/, homeDir)

        // Check if the path exists before trying to search it
        try {
          await fs.access(expandedPath)
          console.log(`Searching for projects in: ${expandedPath}`)
        } catch (error) {
          console.log(`Workspace path does not exist, skipping: ${expandedPath}`)
          continue
        }

        // Use Node.js fs to search for .claude directories
        try {
          const dirs = await findClaudeDirsRecursive(expandedPath, 3)
          projectDirs.push(...dirs)
          console.log(`Found ${dirs.length} .claude directories in ${expandedPath}`)
        } catch (error) {
          console.error(`Error searching in ${expandedPath}:`, error)
        }
      }

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
          agents: [],
          mcpServers: []
        }

        // Check for project CLAUDE.md files following the proper convention:
        // 1. Project scope: CLAUDE.md in project root (primary location)
        // 2. Local scope: CLAUDE.local.md in project root (personal, ignored by git)
        // 3. Legacy: .claude/CLAUDE.md (for backward compatibility)

        // Primary location: project root
        const rootClaudeMdPath = path.join(projectPath, 'CLAUDE.md')
        if (await fileExists(rootClaudeMdPath)) {
          const content = await fs.readFile(rootClaudeMdPath, 'utf-8')
          const stat = await fs.stat(rootClaudeMdPath)
          project.claudeMd = {
            path: rootClaudeMdPath,
            content,
            size: stat.size,
            lastModified: stat.mtime,
            scope: 'project'
          }
        } else {
          // Legacy location: .claude directory
          const legacyClaudeMdPath = path.join(projectClaudeDir, 'CLAUDE.md')
          if (await fileExists(legacyClaudeMdPath)) {
            const content = await fs.readFile(legacyClaudeMdPath, 'utf-8')
            const stat = await fs.stat(legacyClaudeMdPath)
            project.claudeMd = {
              path: legacyClaudeMdPath,
              content,
              size: stat.size,
              lastModified: stat.mtime,
              scope: 'legacy'
            }
          }
        }

        // Check for local scope CLAUDE.local.md
        const localClaudeMdPath = path.join(projectPath, 'CLAUDE.local.md')
        if (await fileExists(localClaudeMdPath)) {
          const content = await fs.readFile(localClaudeMdPath, 'utf-8')
          const stat = await fs.stat(localClaudeMdPath)
          project.claudeLocalMd = {
            path: localClaudeMdPath,
            content,
            size: stat.size,
            lastModified: stat.mtime,
            scope: 'local'
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

            // Check if this settings file contains MCP servers
            try {
              const settingsData = JSON.parse(content)
              if (settingsData.mcpServers) {
                for (const [serverName, serverConfig] of Object.entries(settingsData.mcpServers)) {
                  project.mcpServers.push({
                    name: serverName,
                    source: file,
                    ...serverConfig as any
                  })
                }
              }
            } catch (error) {
              // Silent fail for non-JSON or invalid format
            }
          }
        }

        // Check for hooks in settings.json
        const settingsPath = path.join(projectClaudeDir, 'settings.json')
        if (await fileExists(settingsPath)) {
          try {
            const settingsContent = await fs.readFile(settingsPath, 'utf-8')
            const settings = JSON.parse(settingsContent)
            if (settings.hooks) {
              const stat = await fs.stat(settingsPath)
              project.hooks.push({
                name: 'hooks (in settings.json)',
                path: settingsPath,
                size: stat.size,
                lastModified: stat.mtime,
                content: JSON.stringify(settings.hooks, null, 2)
              })
            }
          } catch (error) {
            console.error('Error parsing settings.json for hooks:', error)
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

        // Check for custom commands
        const commandsDir = path.join(projectClaudeDir, 'commands')
        if (await fileExists(commandsDir)) {
          if (!project.commands) project.commands = []
          const commandFiles = await fs.readdir(commandsDir)
          for (const file of commandFiles) {
            if (file.endsWith('.md')) {
              const filePath = path.join(commandsDir, file)
              const content = await fs.readFile(filePath, 'utf-8')
              const stat = await fs.stat(filePath)
              project.commands.push({
                name: file.replace('.md', ''), // Command name without extension
                path: filePath,
                content,
                size: stat.size,
                lastModified: stat.mtime
              })
            }
          }
        }

        // Check for .mcp.json in project root (avoid duplicates)
        const mcpPath = path.join(projectPath, '.mcp.json')
        const hasMcpAlready = project.settings.some((s: any) => s.name === '.mcp.json')
        if (!hasMcpAlready && await fileExists(mcpPath)) {
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

          // Parse and add MCP servers
          try {
            const mcpConfig = JSON.parse(content)
            if (mcpConfig.mcpServers) {
              for (const [serverName, serverConfig] of Object.entries(mcpConfig.mcpServers)) {
                project.mcpServers.push({
                  name: serverName,
                  source: '.mcp.json',
                  ...serverConfig as any
                })
              }
            }
          } catch (error) {
            console.error('Error parsing MCP config:', error)
          }
        }

        configData.projects.push(project)
      }
    } catch (error) {
      console.error('Error searching for project configurations:', error)
    }

    // Also check for .mcp.json files in projects using Node.js fs
    try {
      const mcpFiles: string[] = []
      for (const workspacePath of workspacePaths) {
        const expandedPath = workspacePath.replace(/^~/, homeDir)

        // Check if path exists
        try {
          await fs.access(expandedPath)
        } catch {
          continue
        }

        // Use Node.js fs to search for .mcp.json files
        try {
          const files = await findFilesRecursive(expandedPath, '.mcp.json', 3)
          mcpFiles.push(...files)
          console.log(`Found ${files.length} .mcp.json files in ${expandedPath}`)
        } catch (error) {
          console.error(`Error searching for MCP files in ${expandedPath}:`, error)
        }
      }

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
            agents: [],
            mcpServers: []
          }
          configData.projects.push(project)
        }

        // Add MCP file to settings and parse MCP servers (avoid duplicates)
        const hasMcpAlready = project.settings.some((s: any) => s.name === '.mcp.json')
        if (!hasMcpAlready) {
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

          // Parse and add MCP servers
          try {
            const mcpConfig = JSON.parse(content)
            if (mcpConfig.mcpServers) {
              for (const [serverName, serverConfig] of Object.entries(mcpConfig.mcpServers)) {
                project.mcpServers.push({
                  name: serverName,
                  ...serverConfig as any
                })
              }
            }
          } catch (error) {
            console.error('Error parsing MCP config:', error)
          }
        }
      }
    } catch (error) {
      console.error('Error searching for MCP files:', error)
    }

    // Also search for standalone CLAUDE.md files in workspace projects using Node.js fs
    try {
      const claudeMdFiles: string[] = []
      for (const workspacePath of workspacePaths) {
        const expandedPath = workspacePath.replace(/^~/, homeDir)

        // Check if path exists
        try {
          await fs.access(expandedPath)
        } catch {
          continue
        }

        // Use Node.js fs to search for CLAUDE.md files
        try {
          const files = await findFilesRecursive(expandedPath, 'CLAUDE.md', 2)
          claudeMdFiles.push(...files)
          console.log(`Found ${files.length} CLAUDE.md files in ${expandedPath}`)
        } catch (error) {
          console.error(`Error searching for CLAUDE.md in ${expandedPath}:`, error)
        }
      }

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
            agents: [],
            mcpServers: []
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

    // Also search for standalone agent files in workspace projects using Node.js fs
    try {
      const agentFiles: string[] = []
      for (const workspacePath of workspacePaths) {
        const expandedPath = workspacePath.replace(/^~/, homeDir)

        // Check if path exists
        try {
          await fs.access(expandedPath)
        } catch {
          continue
        }

        // Use Node.js fs to search for agent files
        try {
          const files = await findAgentFilesRecursive(expandedPath, 3)
          agentFiles.push(...files)
          console.log(`Found ${files.length} agent files in ${expandedPath}`)
        } catch (error) {
          console.error(`Error searching for agent files in ${expandedPath}:`, error)
        }
      }

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
            agents: [],
            mcpServers: []
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