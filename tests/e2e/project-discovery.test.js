const pie = require("puppeteer-in-electron")
const puppeteer = require("puppeteer")
const { app } = require("electron")
const path = require("path")

describe("Project Discovery E2E Tests", () => {
  let browser
  let window
  let page

  beforeAll(async () => {
    // Initialize puppeteer-in-electron
    await pie.initialize(app)

    // Launch Puppeteer browser
    browser = await pie.connect(app, puppeteer)
  }, 30000)

  beforeEach(async () => {
    // Create a new Electron window
    const BrowserWindow = require("electron").BrowserWindow
    window = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    })

    // Load the application
    await window.loadURL("http://localhost:3002/project-dashboard")

    // Get the Puppeteer page
    page = await pie.getPage(browser, window)
    await page.waitForLoadState("networkidle")
  })

  afterEach(async () => {
    if (window && !window.isDestroyed()) {
      window.close()
    }
  })

  afterAll(async () => {
    if (browser) {
      await browser.close()
    }
  })

  describe("Project Loading", () => {
    test("should discover ALL directories in workspace", async () => {
      // Wait for projects to load
      await page.waitForSelector('[data-testid="project-card"]', { timeout: 10000 })

      // Get all project cards
      const projectCards = await page.$$('[data-testid="project-card"]')

      // Should have discovered multiple projects
      expect(projectCards.length).toBeGreaterThan(0)

      // Get project names
      const projectNames = await page.$$eval(
        '[data-testid="project-name"]',
        elements => elements.map(el => el.textContent)
      )

      // Check for unique names (no duplicate "mcp-config-manager" issue)
      const uniqueNames = [...new Set(projectNames)]
      expect(projectNames.length).toBe(uniqueNames.length)

      // No project should be named "mcp-config-manager" unless it actually is that project
      const mcpCount = projectNames.filter(name => name === "mcp-config-manager").length
      expect(mcpCount).toBeLessThanOrEqual(1)
    })

    test("should show projects without .claude directories", async () => {
      // Wait for projects to load
      await page.waitForSelector('[data-testid="project-card"]', { timeout: 10000 })

      // Check for projects without Claude badges
      const projectsWithoutClaude = await page.$$eval(
        '[data-testid="project-card"]',
        cards => cards.filter(card => !card.querySelector('[data-testid="claude-badge"]')).length
      )

      // Should have at least some projects without .claude directories
      expect(projectsWithoutClaude).toBeGreaterThan(0)
    })

    test("should display correct project statistics", async () => {
      // Wait for statistics to load
      await page.waitForSelector('[data-testid="stats-section"]', { timeout: 10000 })

      // Get total projects count
      const totalProjects = await page.$eval(
        '[data-testid="stat-total-projects"]',
        el => parseInt(el.textContent)
      )

      // Get actual project count
      const projectCards = await page.$$('[data-testid="project-card"]')

      // Statistics should match actual project count
      expect(totalProjects).toBe(projectCards.length)
    })
  })

  describe("Project Import", () => {
    test("should open import modal", async () => {
      // Click import button
      await page.click('[data-testid="import-button"]')

      // Modal should appear
      await page.waitForSelector('[data-testid="import-modal"]', { timeout: 5000 })

      const modal = await page.$('[data-testid="import-modal"]')
      expect(modal).toBeTruthy()
    })

    test("should validate project path", async () => {
      // Open import modal
      await page.click('[data-testid="import-button"]')
      await page.waitForSelector('[data-testid="import-modal"]')

      // Try to import invalid path
      await page.type('[data-testid="project-path-input"]', '/invalid/path/that/does/not/exist')
      await page.click('[data-testid="validate-button"]')

      // Should show error
      await page.waitForSelector('[data-testid="validation-error"]', { timeout: 5000 })
      const errorText = await page.$eval('[data-testid="validation-error"]', el => el.textContent)
      expect(errorText).toContain("does not exist")
    })

    test("should import valid project", async () => {
      // Get current project count
      const initialCards = await page.$$('[data-testid="project-card"]')
      const initialCount = initialCards.length

      // Open import modal
      await page.click('[data-testid="import-button"]')
      await page.waitForSelector('[data-testid="import-modal"]')

      // Import a valid path (use temp directory for testing)
      const testPath = path.join(require('os').homedir(), 'Desktop')
      await page.type('[data-testid="project-path-input"]', testPath)
      await page.click('[data-testid="validate-button"]')

      // Should show valid
      await page.waitForSelector('[data-testid="validation-success"]', { timeout: 5000 })

      // Import the project
      await page.click('[data-testid="import-confirm-button"]')

      // Modal should close
      await page.waitForSelector('[data-testid="import-modal"]', { hidden: true, timeout: 5000 })

      // Projects should refresh (parent directory added to workspace)
      await page.waitForTimeout(2000) // Wait for refresh

      // Verify workspace paths were updated
      const workspacePaths = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem('workspacePaths') || '[]')
      })

      expect(workspacePaths.length).toBeGreaterThan(0)
    })
  })

  describe("UI Consistency", () => {
    test("should have consistent styling across pages", async () => {
      // Check project dashboard styling
      const dashboardBg = await page.$eval(
        'body',
        el => window.getComputedStyle(el).backgroundColor
      )

      // Navigate to settings
      await page.goto("http://localhost:3002/settings")
      await page.waitForLoadState("networkidle")

      // Check settings page styling
      const settingsBg = await page.$eval(
        'body',
        el => window.getComputedStyle(el).backgroundColor
      )

      // Backgrounds should be consistent
      expect(dashboardBg).toBe(settingsBg)
    })

    test("should have working dark mode toggle", async () => {
      // Navigate to settings
      await page.goto("http://localhost:3002/settings")
      await page.waitForSelector('[data-testid="dark-mode-toggle"]')

      // Get initial theme
      const initialTheme = await page.$eval('html', el => el.classList.contains('dark'))

      // Toggle dark mode
      await page.click('[data-testid="dark-mode-toggle"]')
      await page.waitForTimeout(500) // Wait for transition

      // Theme should have changed
      const newTheme = await page.$eval('html', el => el.classList.contains('dark'))
      expect(newTheme).toBe(!initialTheme)
    })

    test("should have sticky headers", async () => {
      // Wait for page load
      await page.waitForSelector('[data-testid="stats-section"]')

      // Get initial position of stats section
      const initialPosition = await page.$eval(
        '[data-testid="stats-section"]',
        el => el.getBoundingClientRect().top
      )

      // Scroll down
      await page.evaluate(() => window.scrollBy(0, 500))
      await page.waitForTimeout(100)

      // Stats section should stick to top
      const stickyPosition = await page.$eval(
        '[data-testid="stats-section"]',
        el => el.getBoundingClientRect().top
      )

      // Should be at or near top when scrolled
      expect(stickyPosition).toBeLessThanOrEqual(20) // Allow small margin
    })
  })

  describe("Search and Filter", () => {
    test("should filter projects by search query", async () => {
      // Wait for projects to load
      await page.waitForSelector('[data-testid="project-card"]')

      // Get initial project count
      const initialCards = await page.$$('[data-testid="project-card"]')

      // Type in search
      await page.type('[data-testid="search-input"]', 'claude')
      await page.waitForTimeout(500) // Wait for debounce

      // Get filtered projects
      const filteredCards = await page.$$('[data-testid="project-card"]:not([style*="display: none"])')

      // Should have fewer projects
      expect(filteredCards.length).toBeLessThan(initialCards.length)

      // All visible projects should contain "claude" in name
      const visibleNames = await page.$$eval(
        '[data-testid="project-card"]:not([style*="display: none"]) [data-testid="project-name"]',
        elements => elements.map(el => el.textContent.toLowerCase())
      )

      visibleNames.forEach(name => {
        expect(name).toContain('claude')
      })
    })
  })
})