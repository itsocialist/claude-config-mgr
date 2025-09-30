import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

export async function GET() {
  try {
    const homeDir = os.homedir()
    const claudeDir = path.join(homeDir, '.claude')

    // Check if .claude directory exists
    const claudeDirExists = await fileExists(claudeDir)
    if (!claudeDirExists) {
      return NextResponse.json({
        claudeDir: null,
        globalClaudeMd: null,
        projects: [],
        agents: [],
        shells: [],
        todos: []
      })
    }

    // Load global CLAUDE.md
    const globalClaudeMdPath = path.join(claudeDir, 'CLAUDE.md')
    let globalClaudeMd = null
    if (await fileExists(globalClaudeMdPath)) {
      globalClaudeMd = {
        path: globalClaudeMdPath,
        content: await fs.readFile(globalClaudeMdPath, 'utf-8'),
        lastModified: (await fs.stat(globalClaudeMdPath)).mtime
      }
    }

    // Load projects data
    const projectsDir = path.join(claudeDir, 'projects')
    const projects = await loadProjectsData(projectsDir)

    // Load agents data
    const agentsDir = path.join(claudeDir, 'agents')
    const agents = await loadAgentsData(agentsDir)

    // Load shell snapshots
    const shellsDir = path.join(claudeDir, 'shells')
    const shells = await loadShellsData(shellsDir)

    // Load todos
    const todosPath = path.join(claudeDir, 'todos.json')
    const todos = await loadTodosData(todosPath)

    return NextResponse.json({
      claudeDir,
      globalClaudeMd,
      projects,
      agents,
      shells,
      todos
    })
  } catch (error) {
    console.error('Failed to load Claude data:', error)
    return NextResponse.json(
      { error: 'Failed to load Claude data' },
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

async function loadProjectsData(projectsDir: string) {
  if (!await fileExists(projectsDir)) return []

  try {
    const projectFolders = await fs.readdir(projectsDir, { withFileTypes: true })
    const projects = []

    for (const folder of projectFolders) {
      if (folder.isDirectory()) {
        const projectPath = path.join(projectsDir, folder.name)
        const projectData: any = {
          name: folder.name,
          path: projectPath,
          claudeMd: null,
          contextFiles: [],
          memory: null
        }

        // Check for project-specific CLAUDE.md
        const claudeMdPath = path.join(projectPath, 'CLAUDE.md')
        if (await fileExists(claudeMdPath)) {
          projectData.claudeMd = {
            path: claudeMdPath,
            content: await fs.readFile(claudeMdPath, 'utf-8'),
            lastModified: (await fs.stat(claudeMdPath)).mtime
          }
        }

        // Get all context/memory files (JSONL files in the project directory)
        const files = await fs.readdir(projectPath)
        const jsonlFiles = files.filter(f => f.endsWith('.jsonl'))

        if (jsonlFiles.length > 0) {
          projectData.contextFiles = jsonlFiles.map(file => ({
            name: file,
            path: path.join(projectPath, file)
          }))

          // Combine all JSONL files to create a memory summary
          let memoryContent = []
          for (const file of jsonlFiles.slice(0, 5)) { // Read up to 5 most recent files
            try {
              const content = await fs.readFile(path.join(projectPath, file), 'utf-8')
              const lines = content.split('\n').filter(line => line.trim())
              for (const line of lines.slice(0, 10)) { // Get first 10 lines from each file
                try {
                  const entry = JSON.parse(line)
                  if (entry.type === 'text' && entry.text) {
                    memoryContent.push(entry.text.substring(0, 200))
                  }
                } catch (e) {
                  // Skip malformed JSON lines
                }
              }
            } catch (e) {
              // Skip files that can't be read
            }
          }

          if (memoryContent.length > 0) {
            projectData.memory = {
              path: projectPath,
              content: memoryContent.join('\n\n---\n\n'),
              lastModified: (await fs.stat(projectPath)).mtime,
              size: jsonlFiles.length,
              isComposite: true
            }
          }
        }

        projects.push(projectData)
      }
    }

    return projects
  } catch {
    return []
  }
}

async function loadAgentsData(agentsDir: string) {
  if (!await fileExists(agentsDir)) return []

  try {
    const agentFiles = await fs.readdir(agentsDir)
    const agents = []

    for (const file of agentFiles) {
      if (file.endsWith('.md')) {
        const agentPath = path.join(agentsDir, file)
        const stat = await fs.stat(agentPath)
        agents.push({
          name: file.replace('.md', ''),
          path: agentPath,
          content: await fs.readFile(agentPath, 'utf-8'),
          lastModified: stat.mtime,
          size: stat.size
        })
      }
    }

    return agents
  } catch {
    return []
  }
}

async function loadShellsData(shellsDir: string) {
  if (!await fileExists(shellsDir)) return []

  try {
    const shellFiles = await fs.readdir(shellsDir)
    const shells = []

    for (const file of shellFiles) {
      if (file.endsWith('.json')) {
        const shellPath = path.join(shellsDir, file)
        const stat = await fs.stat(shellPath)
        const content = JSON.parse(await fs.readFile(shellPath, 'utf-8'))
        shells.push({
          name: file.replace('.json', ''),
          path: shellPath,
          lastModified: stat.mtime,
          commandCount: content.commands?.length || 0,
          workingDir: content.workingDir
        })
      }
    }

    return shells
  } catch {
    return []
  }
}

async function loadTodosData(todosPath: string) {
  if (!await fileExists(todosPath)) return []

  try {
    const content = await fs.readFile(todosPath, 'utf-8')
    const todos = JSON.parse(content)
    return Array.isArray(todos) ? todos : []
  } catch {
    return []
  }
}