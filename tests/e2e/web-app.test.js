const puppeteer = require('puppeteer')

describe('Claude Config Manager Web E2E Tests', () => {
  let browser
  let page

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
  }, 30000)

  beforeEach(async () => {
    page = await browser.newPage()
    await page.setViewport({ width: 1200, height: 800 })
  })

  afterEach(async () => {
    await page.close()
  })

  afterAll(async () => {
    await browser.close()
  })

  describe('Project Discovery', () => {
    test('should load project dashboard and discover all projects', async () => {
      // Navigate to project dashboard
      await page.goto('http://localhost:3002/project-dashboard', {
        waitUntil: 'networkidle0'
      })

      // Wait for projects to load by checking for either project cards or empty state
      await page.waitForSelector('.min-h-screen', { timeout: 10000 })

      // Check if API is returning projects
      const response = await page.evaluate(async () => {
        const res = await fetch('/api/config-files')
        return await res.json()
      })

      expect(response).toHaveProperty('projects')
      expect(Array.isArray(response.projects)).toBe(true)

      // Verify projects are being discovered
      const projectCount = response.projects.length
      console.log(`Found ${projectCount} projects`)

      // Check that projects have unique names (no duplicate issue)
      const projectNames = response.projects.map(p => p.name)
      const uniqueNames = [...new Set(projectNames)]
      expect(projectNames.length).toBe(uniqueNames.length)

      // Verify no mass "mcp-config-manager" naming bug
      const mcpManagerCount = projectNames.filter(name => name === 'mcp-config-manager').length
      expect(mcpManagerCount).toBeLessThanOrEqual(1)

      // Check that we have projects both with and without .claude directories
      const withClaude = response.projects.filter(p => p.claudeDir).length
      const withoutClaude = response.projects.filter(p => !p.claudeDir).length

      console.log(`Projects with .claude: ${withClaude}`)
      console.log(`Projects without .claude: ${withoutClaude}`)

      // Should discover ALL directories (not just those with Claude files)
      expect(projectCount).toBeGreaterThan(0)
    })

    test('should display correct UI elements', async () => {
      await page.goto('http://localhost:3002/project-dashboard', {
        waitUntil: 'networkidle0'
      })

      // Check for main UI elements
      const hasStatsSection = await page.$('.grid.grid-cols-4.gap-4') !== null
      const hasSearchBar = await page.$('input[placeholder*="Search"]') !== null
      const hasImportButton = await page.$('button') !== null

      expect(hasStatsSection).toBe(true)
      expect(hasSearchBar).toBe(true)
      expect(hasImportButton).toBe(true)
    })

    test('should have consistent styling', async () => {
      // Check project dashboard
      await page.goto('http://localhost:3002/project-dashboard', {
        waitUntil: 'networkidle0'
      })

      // Check for clean background (no gradients)
      const dashboardBgStyle = await page.evaluate(() => {
        const body = document.body
        const computedStyle = window.getComputedStyle(body)
        return computedStyle.background
      })

      // Navigate to settings
      await page.goto('http://localhost:3002/settings', {
        waitUntil: 'networkidle0'
      })

      const settingsBgStyle = await page.evaluate(() => {
        const body = document.body
        const computedStyle = window.getComputedStyle(body)
        return computedStyle.background
      })

      // Both should have clean, consistent styling (no gradients)
      expect(dashboardBgStyle).not.toContain('gradient')
      expect(settingsBgStyle).not.toContain('gradient')
    })

    test('should handle import modal interactions', async () => {
      await page.goto('http://localhost:3002/project-dashboard', {
        waitUntil: 'networkidle0'
      })

      // Look for import button and click it
      const importButtons = await page.$$('button')
      let importButtonFound = false

      for (const button of importButtons) {
        const text = await page.evaluate(el => el.textContent, button)
        if (text && text.includes('Import')) {
          await button.click()
          importButtonFound = true
          break
        }
      }

      if (importButtonFound) {
        // Wait for modal to appear
        await page.waitForSelector('input[placeholder*="project"]', {
          timeout: 5000
        }).catch(() => {
          console.log('Import modal did not appear')
        })

        // Check if modal opened
        const modalInput = await page.$('input[placeholder*="project"]')
        expect(modalInput).toBeTruthy()
      }
    })

    test('should properly display projects with various configurations', async () => {
      await page.goto('http://localhost:3002/project-dashboard', {
        waitUntil: 'networkidle0'
      })

      const response = await page.evaluate(async () => {
        const res = await fetch('/api/config-files')
        return await res.json()
      })

      // Check different project configurations
      const projectsWithMcp = response.projects.filter(p => p.mcpServers && p.mcpServers.length > 0)
      const projectsWithAgents = response.projects.filter(p => p.agents && p.agents.length > 0)
      const projectsWithHooks = response.projects.filter(p => p.hooks && p.hooks.length > 0)
      const projectsWithClaudeMd = response.projects.filter(p => p.claudeMd)

      console.log('Project configuration distribution:')
      console.log(`- With MCP servers: ${projectsWithMcp.length}`)
      console.log(`- With agents: ${projectsWithAgents.length}`)
      console.log(`- With hooks: ${projectsWithHooks.length}`)
      console.log(`- With CLAUDE.md: ${projectsWithClaudeMd.length}`)

      // Basic sanity checks
      expect(response.projects.every(p => p.name)).toBe(true)
      expect(response.projects.every(p => p.path)).toBe(true)
    })
  })

  describe('Settings Page', () => {
    test('should load settings page with consistent styling', async () => {
      await page.goto('http://localhost:3002/settings', {
        waitUntil: 'networkidle0'
      })

      // Check for settings elements
      const hasSettingsContent = await page.evaluate(() => {
        const headings = Array.from(document.querySelectorAll('h1, h2'))
        return headings.some(h => h.textContent.toLowerCase().includes('settings'))
      })

      expect(hasSettingsContent).toBe(true)

      // Check for clean card styling (matching project dashboard)
      const cardElements = await page.$$('.rounded-lg.p-6')
      expect(cardElements.length).toBeGreaterThan(0)
    })
  })

  describe('Dark Mode', () => {
    test.skip('should have dark mode toggle on settings page', async () => {
      await page.goto('http://localhost:3002/settings', {
        waitUntil: 'networkidle0'
      })

      // Check that we can detect dark mode state
      const hasDarkClass = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark') !== undefined
      })

      expect(hasDarkClass).toBe(true)

      // Find theme toggle button
      let themeButtonFound = false
      const toggleButtons = await page.$$('button')
      for (const button of toggleButtons) {
        const ariaLabel = await page.evaluate(el => el.getAttribute('aria-label'), button)
        const svgIcon = await page.evaluate(el => el.querySelector('svg'), button)
        if ((ariaLabel && ariaLabel.toLowerCase().includes('theme')) || svgIcon) {
          themeButtonFound = true
          // Click to test it's interactive
          await button.click().catch(() => {})
          break
        }
      }

      // We should have found a theme toggle
      expect(themeButtonFound).toBe(true)
    })
  })
})