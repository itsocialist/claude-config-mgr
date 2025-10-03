import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { projectPath } = await request.json()

    if (!projectPath) {
      return NextResponse.json(
        { error: 'Project path is required' },
        { status: 400 }
      )
    }

    // Verify the path exists and is a directory
    try {
      const stats = await fs.stat(projectPath)
      if (!stats.isDirectory()) {
        return NextResponse.json(
          { error: 'Path is not a directory' },
          { status: 400 }
        )
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Path does not exist or is not accessible' },
        { status: 400 }
      )
    }

    // Check if it's a valid project directory (has some code files or .git)
    const files = await fs.readdir(projectPath)
    const hasCodeFiles = files.some(file =>
      file.endsWith('.js') ||
      file.endsWith('.ts') ||
      file.endsWith('.jsx') ||
      file.endsWith('.tsx') ||
      file.endsWith('.py') ||
      file.endsWith('.java') ||
      file.endsWith('.go') ||
      file.endsWith('.rs') ||
      file === '.git' ||
      file === 'package.json' ||
      file === 'Cargo.toml' ||
      file === 'go.mod' ||
      file === 'requirements.txt'
    )

    if (!hasCodeFiles) {
      return NextResponse.json(
        {
          error: 'Directory does not appear to be a code project',
          warning: true
        },
        { status: 400 }
      )
    }

    // Return success with project info
    const projectName = path.basename(projectPath)

    return NextResponse.json({
      success: true,
      project: {
        name: projectName,
        path: projectPath
      }
    })
  } catch (error) {
    console.error('Failed to import project:', error)
    return NextResponse.json(
      { error: 'Failed to import project' },
      { status: 500 }
    )
  }
}