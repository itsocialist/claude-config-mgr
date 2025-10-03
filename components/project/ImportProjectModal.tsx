"use client"

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FolderOpen, AlertCircle, CheckCircle, Upload } from "lucide-react"

interface ImportProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (projectPath: string) => void
}

export default function ImportProjectModal({
  isOpen,
  onClose,
  onImport
}: ImportProjectModalProps) {
  const [projectPath, setProjectPath] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [validating, setValidating] = useState(false)
  const [isValid, setIsValid] = useState<boolean | null>(null)

  const handlePathChange = async (path: string) => {
    setProjectPath(path)
    setError(null)
    setIsValid(null)

    if (!path) return

    // Validate the path
    setValidating(true)
    try {
      const response = await fetch('/api/import-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ projectPath: path })
      })

      const result = await response.json()

      if (response.ok) {
        setIsValid(true)
        setError(null)
      } else {
        setIsValid(false)
        setError(result.error)
      }
    } catch (err) {
      setIsValid(false)
      setError('Failed to validate project path')
    } finally {
      setValidating(false)
    }
  }

  const handleImport = () => {
    if (!projectPath || !isValid) return
    onImport(projectPath)
    // Reset state
    setProjectPath('')
    setError(null)
    setIsValid(null)
  }

  const handleSelectDirectory = () => {
    // Check if we're in Electron environment
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      // Use Electron's directory picker
      (window as any).electronAPI.selectDirectory().then((result: any) => {
        if (!result.canceled && result.filePaths.length > 0) {
          handlePathChange(result.filePaths[0])
        }
      })
    } else {
      // For web version, we can only use manual input
      // Modern browsers don't allow directory selection via file input for security
      setError('Please enter the project path manually. Directory selection is only available in the desktop app.')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Project
          </DialogTitle>
          <DialogDescription>
            Add an existing project directory to your project list.
            Enter the full path to the project folder or use the browse button.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="path">Project Path</Label>
            <div className="flex gap-2">
              <Input
                id="path"
                type="text"
                value={projectPath}
                onChange={(e) => handlePathChange(e.target.value)}
                placeholder="/path/to/your/project"
                className={isValid === true ? 'border-green-500' : isValid === false ? 'border-red-500' : ''}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleSelectDirectory}
                title="Browse for directory"
              >
                <FolderOpen className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {validating && (
            <div className="text-sm text-gray-500">
              Validating project path...
            </div>
          )}

          {isValid === true && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                Valid project directory found
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-gray-500 space-y-1">
            <p>• The directory must be an existing code project</p>
            <p>• It will be added to your workspace paths</p>
            <p>• Claude will scan it for configuration files</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!projectPath || !isValid || validating}
          >
            Import Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}