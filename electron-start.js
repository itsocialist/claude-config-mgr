#!/usr/bin/env node

const { spawn } = require('child_process')
const path = require('path')

process.env.NODE_ENV = 'development'

const electronPath = require('electron')
const appPath = path.join(__dirname, 'electron', 'main.js')

const electron = spawn(electronPath, [appPath], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
})

electron.on('close', (code) => {
  process.exit(code)
})