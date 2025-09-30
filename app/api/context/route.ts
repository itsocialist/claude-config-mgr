import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('path')
    const projectPath = searchParams.get('project')

    if (!filePath && !projectPath) {
      return NextResponse.json(
        { error: 'Either path or project parameter is required' },
        { status: 400 }
      )
    }

    if (filePath) {
      // Read a specific context file
      const content = await fs.readFile(filePath, 'utf-8')
      const lines = content.split('\n').filter(line => line.trim())
      const entries = []

      for (const line of lines) {
        try {
          const entry = JSON.parse(line)
          entries.push(entry)
        } catch (e) {
          // Skip malformed lines
        }
      }

      return NextResponse.json({
        path: filePath,
        entries,
        raw: content
      })
    } else if (projectPath) {
      // List all context files for a project
      const files = await fs.readdir(projectPath)
      const contextFiles = []

      for (const file of files) {
        if (file.endsWith('.jsonl')) {
          const filePath = path.join(projectPath, file)
          const stat = await fs.stat(filePath)
          const content = await fs.readFile(filePath, 'utf-8')
          const lineCount = content.split('\n').filter(l => l.trim()).length

          contextFiles.push({
            name: file,
            path: filePath,
            size: stat.size,
            lastModified: stat.mtime,
            lineCount
          })
        }
      }

      return NextResponse.json({ files: contextFiles })
    }
  } catch (error) {
    console.error('Failed to read context:', error)
    return NextResponse.json(
      { error: 'Failed to read context data' },
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

    // Backup original file
    const backupPath = `${filePath}.backup`
    const originalContent = await fs.readFile(filePath, 'utf-8')
    await fs.writeFile(backupPath, originalContent, 'utf-8')

    // Write new content
    await fs.writeFile(filePath, content, 'utf-8')

    return NextResponse.json({
      success: true,
      path: filePath,
      backupPath
    })
  } catch (error) {
    console.error('Failed to save context:', error)
    return NextResponse.json(
      { error: 'Failed to save context data' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('path')

    if (!filePath) {
      return NextResponse.json(
        { error: 'Path parameter is required' },
        { status: 400 }
      )
    }

    // Backup before deleting
    const backupPath = `${filePath}.deleted`
    await fs.rename(filePath, backupPath)

    return NextResponse.json({
      success: true,
      path: filePath,
      backupPath
    })
  } catch (error) {
    console.error('Failed to delete context:', error)
    return NextResponse.json(
      { error: 'Failed to delete context data' },
      { status: 500 }
    )
  }
}