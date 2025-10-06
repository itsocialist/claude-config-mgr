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

    // Find ALL projects in workspace directories, not just those with Claude files
    // This ensures we discover all projects, then check for Claude configurations
    try {
      const allProjects = new Map<string, any>() // Use Map to avoid duplicates by path

      for (const workspacePath of workspacePaths) {
        const expandedPath = workspacePath.replace(/^~/, homeDir)

        // Check if the path exists
        try {
          await fs.access(expandedPath)
          console.log(`Discovering all projects in: ${expandedPath}`)
        } catch (error) {
          console.log(`Workspace path does not exist, skipping: ${expandedPath}`)
          continue
        }

        // Get ALL directories in the workspace (depth 1 - immediate subdirectories)
        try {
          const entries = await fs.readdir(expandedPath, { withFileTypes: true })

          for (const entry of entries) {
            if (!entry.isDirectory()) continue

            // Skip hidden directories and common non-project directories
            if (entry.name.startsWith('.')) continue
            if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'build') continue

            const projectPath = path.join(expandedPath, entry.name)

            // Skip if we already have this project
            if (allProjects.has(projectPath)) continue

            // Create project entry for EVERY directory
            const project: any = {
              name: entry.name,
              path: projectPath,
              claudeDir: null,
              claudeMd: null,
              settings: [],
              hooks: [],
              agents: [],
              mcpServers: []
            }

            // Check if this project has a .claude directory
            const claudeDirPath = path.join(projectPath, '.claude')
            if (await fileExists(claudeDirPath)) {
              project.claudeDir = claudeDirPath
            }

            allProjects.set(projectPath, project)
          }

          console.log(`Found ${allProjects.size} total projects in ${expandedPath}`)
        } catch (error) {
          console.error(`Error reading directory ${expandedPath}:`, error)
        }
      }

      // Now process each discovered project to add Claude configurations
      for (const project of allProjects.values()) {
        const projectPath = project.path
        const projectClaudeDir = project.claudeDir

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
        } else if (projectClaudeDir) {
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

        // Check for project settings files (only if .claude directory exists)
        if (projectClaudeDir) {
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
        } // Close the if (projectClaudeDir) block

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