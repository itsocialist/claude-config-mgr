import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { sourcePath, targetPath, configTypes } = await request.json()

    if (!sourcePath || !targetPath || !configTypes || configTypes.length === 0) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const results = {
      success: [],
      failed: [],
      skipped: []
    }

    // Helper function to copy a file
    async function copyFile(srcFile: string, destFile: string) {
      try {
        // Ensure destination directory exists
        const destDir = path.dirname(destFile)
        await fs.mkdir(destDir, { recursive: true })

        // Read source file
        const content = await fs.readFile(srcFile, 'utf-8')

        // Create backup if destination exists
        try {
          await fs.access(destFile)
          const backupPath = `${destFile}.backup-${Date.now()}`
          await fs.copyFile(destFile, backupPath)
        } catch {
          // File doesn't exist, no backup needed
        }

        // Write to destination
        await fs.writeFile(destFile, content, 'utf-8')
        return true
      } catch (error) {
        console.error(`Failed to copy ${srcFile} to ${destFile}:`, error)
        return false
      }
    }

    // Process each configuration type
    for (const configType of configTypes) {
      switch (configType) {
        case 'memory':
          // Copy CLAUDE.md
          const claudeMdPaths = [
            path.join(sourcePath, '.claude', 'CLAUDE.md'),
            path.join(sourcePath, 'CLAUDE.md')
          ]

          for (const srcPath of claudeMdPaths) {
            try {
              await fs.access(srcPath)
              const destPath = path.join(targetPath, '.claude', 'CLAUDE.md')
              if (await copyFile(srcPath, destPath)) {
                results.success.push('CLAUDE.md')
              } else {
                results.failed.push('CLAUDE.md')
              }
              break
            } catch {
              // Try next path
            }
          }
          break

        case 'settings':
          // Copy all settings files
          const settingsFiles = [
            'settings.json',
            'settings.local.json',
            'claude_desktop_config.json',
            'config.json'
          ]

          for (const file of settingsFiles) {
            const srcPath = path.join(sourcePath, '.claude', file)
            const destPath = path.join(targetPath, '.claude', file)

            try {
              await fs.access(srcPath)
              if (await copyFile(srcPath, destPath)) {
                results.success.push(file)
              } else {
                results.failed.push(file)
              }
            } catch {
              results.skipped.push(file)
            }
          }
          break

        case 'agents':
          // Copy agents directory
          const srcAgentsDir = path.join(sourcePath, '.claude', 'agents')
          const destAgentsDir = path.join(targetPath, '.claude', 'agents')

          try {
            const agentFiles = await fs.readdir(srcAgentsDir)
            await fs.mkdir(destAgentsDir, { recursive: true })

            for (const file of agentFiles) {
              if (file.endsWith('.md') || file.endsWith('.json')) {
                const srcFile = path.join(srcAgentsDir, file)
                const destFile = path.join(destAgentsDir, file)

                if (await copyFile(srcFile, destFile)) {
                  results.success.push(`agents/${file}`)
                } else {
                  results.failed.push(`agents/${file}`)
                }
              }
            }
          } catch (error) {
            console.error('Failed to copy agents:', error)
            results.failed.push('agents directory')
          }
          break

        case 'mcp':
          // Copy .mcp.json file
          const mcpSrcPath = path.join(sourcePath, '.mcp.json')
          const mcpDestPath = path.join(targetPath, '.mcp.json')

          try {
            await fs.access(mcpSrcPath)
            if (await copyFile(mcpSrcPath, mcpDestPath)) {
              results.success.push('.mcp.json')
            } else {
              results.failed.push('.mcp.json')
            }
          } catch {
            results.skipped.push('.mcp.json')
          }
          break

        case 'hooks':
          // Copy hooks directory
          const srcHooksDir = path.join(sourcePath, '.claude', 'hooks')
          const destHooksDir = path.join(targetPath, '.claude', 'hooks')

          try {
            const hookFiles = await fs.readdir(srcHooksDir)
            await fs.mkdir(destHooksDir, { recursive: true })

            for (const file of hookFiles) {
              const srcFile = path.join(srcHooksDir, file)
              const destFile = path.join(destHooksDir, file)

              if (await copyFile(srcFile, destFile)) {
                results.success.push(`hooks/${file}`)
              } else {
                results.failed.push(`hooks/${file}`)
              }
            }
          } catch (error) {
            console.error('Failed to copy hooks:', error)
            results.skipped.push('hooks directory')
          }
          break
      }
    }

    return NextResponse.json({
      message: 'Configuration copy completed',
      results
    })

  } catch (error) {
    console.error('Failed to copy configuration:', error)
    return NextResponse.json(
      { error: 'Failed to copy configuration' },
      { status: 500 }
    )
  }
}