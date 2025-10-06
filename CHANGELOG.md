# Changelog

All notable changes to Claude Config Manager will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.1] - 2025-10-06

### Fixed
- **Critical: Project Discovery**: Fixed major bug where only projects with Claude files were discovered
  - Now discovers ALL directories in workspace, regardless of Claude file presence
  - Projects without .claude directories are now properly listed
- **Critical: Name Overwriting Bug**: Fixed issue where all projects showed as "mcp-config-manager"
  - Removed duplicate search sections that were overwriting project names
  - Each project now maintains its unique directory name
- **Critical: Mac Studio Compatibility**: Fixed issues specific to fresh system installations
  - Removed hardcoded paths and system-specific logic
  - Replaced brittle shell commands with pure Node.js filesystem operations
- **Import Functionality**: Fixed slow/unresponsive import button
  - Import now correctly adds parent directory to workspace paths
  - Imported projects maintain correct names
- **UI Consistency**: Fixed styling inconsistencies across pages
  - Settings page now matches project dashboard design
  - Main dashboard uses clean, solid backgrounds without gradients
  - Fixed sticky header issues with scrollbar changes

### Added
- **Configurable Title Bar**: Added 4 title bar modes for Electron window
  - default: Normal title bar
  - hidden: No title bar, controls on hover (macOS)
  - hiddenInset: No title bar text, permanent controls (macOS)
  - frameless: Completely frameless window
- **Custom Scrollbars**: Auto-hiding scrollbars with custom styling
  - Scrollbars hide by default, appear on hover/scroll
  - Consistent styling matching app design

### Technical
- Removed all shell command dependencies (find, grep, etc.)
- Implemented pure Node.js recursive filesystem operations
- Fixed null reference issues with optional projectClaudeDir
- Improved error handling and logging

## [0.4.0] - 2025-10-03

### Added
- **Major UI Redesign**: Complete implementation of Figma design system with clean, minimal interface
- **Import Project Functionality**: Added ability to import projects from custom paths with modal interface
- **Interactive Badge Navigation**: Click badges on project cards to navigate directly to specific configuration tabs
- **macOS Title Bar Support**: Hide title bar on macOS while keeping window controls visible
- **Sticky Headers**: Statistics section and search bar now stick while scrolling for better navigation
- **Scroll Position Reset**: Automatic scroll reset when navigating between project views
- **Enhanced MCP Detection**: Comprehensive MCP server detection across multiple file types and locations
- **Improved Hooks Detection**: Better detection of hooks from settings.json files

### Changed
- **Statistics Section**: Redesigned stat cards with cleaner typography, reduced height, and improved spacing
- **Project Cards**: Removed folder icons and file counts for cleaner, minimal design
- **Search Bar**: Enhanced visual hierarchy with sticky positioning
- **Tab Navigation**: Improved styling and consistency across all configuration tabs
- **Color Scheme**: Removed gradient backgrounds in favor of solid, clean colors matching Figma design

### Fixed
- Fixed duplicate MCP file entries appearing in configuration tabs
- Fixed MCP files incorrectly showing in Settings tab instead of MCP tab
- Fixed badge navigation routing to incorrect configuration tabs
- Fixed hooks detection logic not finding hooks in settings.json
- Restored dark mode toggle functionality that was accidentally removed
- Fixed metrics height and font sizes to match Figma specifications
- Improved tab filtering logic to properly separate MCP from Settings files
- Fixed Electron window bar display on macOS

### Technical
- Updated to version 0.4.0
- Improved project structure type definitions with mcpServers field
- Enhanced API route logic for configuration file detection
- Better duplicate prevention in file scanning algorithms

## [0.3.0] - 2025-01-02

### Added
- Copy To and Compare configuration modals for cross-project operations
- System clipboard copy functionality with visual feedback
- Settings page with Electron configuration options
- StatusBar component with toast notifications
- ProjectSearchBar component for advanced filtering
- Checkbox and label UI components from shadcn/ui

### Fixed
- Sticky header gap issues in dashboard
- MCP file location to save in project root (.mcp.json)
- Project name detection for hidden directories
- Dark mode support improvements across all components

### Changed
- Added gradient styling to statistics cards
- Improved component organization and structure

## [0.2.0] - 2024-12-15

### Added
- Project dashboard with grid and list views
- Monaco Editor integration for code editing
- Dark mode support with system theme detection
- Search and filter capabilities
- Global configuration support

### Changed
- Migrated to Next.js 14 with App Router
- Implemented shadcn/ui component library
- Added Zustand for state management

## [0.1.0] - 2024-12-01

### Added
- Initial release
- Basic project discovery and listing
- Configuration file viewing
- Electron desktop app support