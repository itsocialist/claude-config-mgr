import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('path')
    const projectName = searchParams.get('project')

    if (!filePath && !projectName) {
      return NextResponse.json(
        { error: 'Either path or project parameter is required' },
        { status: 400 }
      )
    }

    let claudeMdPath: string

    if (filePath) {
      claudeMdPath = filePath
    } else {
      const homeDir = os.homedir()
      if (projectName === 'global') {
        claudeMdPath = path.join(homeDir, '.claude', 'CLAUDE.md')
      } else {
        claudeMdPath = path.join(homeDir, '.claude', 'projects', projectName!, 'CLAUDE.md')
      }
    }

    // Check if file exists
    try {
      await fs.access(claudeMdPath)
    } catch {
      return NextResponse.json(
        { error: 'CLAUDE.md file not found' },
        { status: 404 }
      )
    }

    const content = await fs.readFile(claudeMdPath, 'utf-8')
    const stat = await fs.stat(claudeMdPath)

    return NextResponse.json({
      path: claudeMdPath,
      content,
      lastModified: stat.mtime,
      size: stat.size
    })
  } catch (error) {
    console.error('Failed to load CLAUDE.md:', error)
    return NextResponse.json(
      { error: 'Failed to load CLAUDE.md file' },
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

    // Ensure directory exists
    const dir = path.dirname(filePath)
    await fs.mkdir(dir, { recursive: true })

    // Write file
    await fs.writeFile(filePath, content, 'utf-8')

    const stat = await fs.stat(filePath)

    return NextResponse.json({
      path: filePath,
      lastModified: stat.mtime,
      size: stat.size,
      success: true
    })
  } catch (error) {
    console.error('Failed to save CLAUDE.md:', error)
    return NextResponse.json(
      { error: 'Failed to save CLAUDE.md file' },
      { status: 500 }
    )
  }
}