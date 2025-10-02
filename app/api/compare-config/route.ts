import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { diffLines } from 'diff'

// Helper to safely read file content
async function readFileContent(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, 'utf-8')
  } catch {
    return null
  }
}

// Helper to get all files in a directory
async function getDirectoryFiles(dirPath: string): Promise<string[]> {
  try {
    const files = await fs.readdir(dirPath)
    return files.filter(f => f.endsWith('.md') || f.endsWith('.json'))
  } catch {
    return []
  }
}

export async function POST(request: NextRequest) {
  try {
    const { project1Path, project2Path } = await request.json()

    if (!project1Path || !project2Path) {
      return NextResponse.json(
        { error: 'Both project paths are required' },
        { status: 400 }
      )
    }

    const comparison = {
      memory: {
        project1: { exists: false, content: null as any, path: null as string | null },
        project2: { exists: false, content: null as any, path: null as string | null },
        differences: null as any
      },
      settings: {
        project1: [] as any[],
        project2: [] as any[],
        differences: {} as any
      },
      agents: {
        project1: [] as any[],
        project2: [] as any[],
        differences: {} as any
      },
      mcp: {
        project1: { exists: false, content: null as any },
        project2: { exists: false, content: null as any },
        differences: null as any
      },
      hooks: {
        project1: [] as any[],
        project2: [] as any[],
        differences: {} as any
      }
    }

    // Compare CLAUDE.md (Memory)
    const claudePaths1 = [
      path.join(project1Path, '.claude', 'CLAUDE.md'),
      path.join(project1Path, 'CLAUDE.md')
    ]
    const claudePaths2 = [
      path.join(project2Path, '.claude', 'CLAUDE.md'),
      path.join(project2Path, 'CLAUDE.md')
    ]

    for (const p of claudePaths1) {
      const content = await readFileContent(p)
      if (content !== null) {
        comparison.memory.project1 = { exists: true, content, path: p }
        break
      }
    }

    for (const p of claudePaths2) {
      const content = await readFileContent(p)
      if (content !== null) {
        comparison.memory.project2 = { exists: true, content, path: p }
        break
      }
    }

    if (comparison.memory.project1.content && comparison.memory.project2.content) {
      comparison.memory.differences = diffLines(
        comparison.memory.project1.content,
        comparison.memory.project2.content
      )
    }

    // Compare Settings
    const settingsFiles = [
      'settings.json',
      'settings.local.json',
      'claude_desktop_config.json',
      'config.json'
    ]

    for (const file of settingsFiles) {
      const path1 = path.join(project1Path, '.claude', file)
      const path2 = path.join(project2Path, '.claude', file)

      const content1 = await readFileContent(path1)
      const content2 = await readFileContent(path2)

      if (content1) {
        comparison.settings.project1.push({ name: file, content: content1 })
      }
      if (content2) {
        comparison.settings.project2.push({ name: file, content: content2 })
      }

      if (content1 && content2) {
        try {
          const json1 = JSON.parse(content1)
          const json2 = JSON.parse(content2)
          comparison.settings.differences[file] = {
            keysOnlyIn1: Object.keys(json1).filter(k => !(k in json2)),
            keysOnlyIn2: Object.keys(json2).filter(k => !(k in json1)),
            differentValues: Object.keys(json1).filter(k =>
              k in json2 && JSON.stringify(json1[k]) !== JSON.stringify(json2[k])
            )
          }
        } catch {
          comparison.settings.differences[file] = { error: 'Invalid JSON' }
        }
      }
    }

    // Compare Agents
    const agentsDir1 = path.join(project1Path, '.claude', 'agents')
    const agentsDir2 = path.join(project2Path, '.claude', 'agents')

    const agents1 = await getDirectoryFiles(agentsDir1)
    const agents2 = await getDirectoryFiles(agentsDir2)

    for (const file of agents1) {
      const content = await readFileContent(path.join(agentsDir1, file))
      if (content) {
        comparison.agents.project1.push({ name: file, content })
      }
    }

    for (const file of agents2) {
      const content = await readFileContent(path.join(agentsDir2, file))
      if (content) {
        comparison.agents.project2.push({ name: file, content })
      }
    }

    comparison.agents.differences = {
      onlyIn1: agents1.filter(f => !agents2.includes(f)),
      onlyIn2: agents2.filter(f => !agents1.includes(f)),
      inBoth: agents1.filter(f => agents2.includes(f))
    }

    // Compare MCP
    const mcpPath1 = path.join(project1Path, '.mcp.json')
    const mcpPath2 = path.join(project2Path, '.mcp.json')

    const mcpContent1 = await readFileContent(mcpPath1)
    const mcpContent2 = await readFileContent(mcpPath2)

    if (mcpContent1) {
      comparison.mcp.project1 = { exists: true, content: mcpContent1 }
    }
    if (mcpContent2) {
      comparison.mcp.project2 = { exists: true, content: mcpContent2 }
    }

    if (mcpContent1 && mcpContent2) {
      try {
        const mcp1 = JSON.parse(mcpContent1)
        const mcp2 = JSON.parse(mcpContent2)
        comparison.mcp.differences = {
          servers: {
            onlyIn1: Object.keys(mcp1.mcpServers || {}).filter(k =>
              !((mcp2.mcpServers || {})[k])
            ),
            onlyIn2: Object.keys(mcp2.mcpServers || {}).filter(k =>
              !((mcp1.mcpServers || {})[k])
            ),
            different: Object.keys(mcp1.mcpServers || {}).filter(k =>
              (mcp2.mcpServers || {})[k] &&
              JSON.stringify(mcp1.mcpServers[k]) !== JSON.stringify(mcp2.mcpServers[k])
            )
          }
        }
      } catch {
        comparison.mcp.differences = { error: 'Invalid JSON' }
      }
    }

    // Compare Hooks
    const hooksDir1 = path.join(project1Path, '.claude', 'hooks')
    const hooksDir2 = path.join(project2Path, '.claude', 'hooks')

    const hooks1 = await getDirectoryFiles(hooksDir1)
    const hooks2 = await getDirectoryFiles(hooksDir2)

    for (const file of hooks1) {
      const content = await readFileContent(path.join(hooksDir1, file))
      if (content) {
        comparison.hooks.project1.push({ name: file, content })
      }
    }

    for (const file of hooks2) {
      const content = await readFileContent(path.join(hooksDir2, file))
      if (content) {
        comparison.hooks.project2.push({ name: file, content })
      }
    }

    comparison.hooks.differences = {
      onlyIn1: hooks1.filter(f => !hooks2.includes(f)),
      onlyIn2: hooks2.filter(f => !hooks1.includes(f)),
      inBoth: hooks1.filter(f => hooks2.includes(f))
    }

    return NextResponse.json(comparison)

  } catch (error) {
    console.error('Failed to compare configurations:', error)
    return NextResponse.json(
      { error: 'Failed to compare configurations' },
      { status: 500 }
    )
  }
}