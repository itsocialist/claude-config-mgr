# Tasks

## Immediate Tasks (Current Sprint)

### T001 - Fix Electron Main Process
- [x] **Status**: Completed
- Fixed app undefined error in main.js
- Ensured proper Electron initialization
- **Assignee**: Developer
- **Completion Date**: 2025-10-01

### T002 - Complete Copy Feature Implementation
- [ ] **Status**: Planned
- Implement actual file copying logic
- Add progress indication
- Handle errors gracefully
- **Assignee**: Developer

### T003 - Complete Compare Feature
- [ ] **Status**: Planned
- Implement detailed comparison view
- Show side-by-side differences
- Add merge capabilities
- **Assignee**: Developer

### T004 - Add MCP Annotate Support
- [ ] **Status**: Planned
- Implement MCP annotation feature
- Follow MCP specification
- **Assignee**: Developer

### T005 - Fix Project Name Detection
- [x] **Status**: Completed
- Handle hidden directory names correctly
- Avoid using .* as project names
- **Assignee**: Developer

## Next Sprint Tasks

### T006 - Multiple Workspace Paths
- [x] **Status**: Completed
- Added settings UI for multiple paths
- Implemented path persistence in localStorage
- Updated API to scan all configured paths
- **Assignee**: Developer
- **Completion Date**: 2025-10-01

### T007 - User Onboarding Tour
- [ ] **Status**: Planned
- Implement interactive tour library
- Create tour steps
- Add skip/complete tracking

### T008 - Package Electron App
- [x] **Status**: Completed
- Configured electron-builder for macOS/Windows/Linux distribution
- Created app icon placeholder (1024x1024)
- Setup code signing for macOS with entitlements
- Configured auto-update capability with electron-updater
- **Assignee**: Developer
- **Completion Date**: 2025-10-01

### T009 - Configuration Templates
- [ ] **Status**: Planned
- Design template structure
- Create template UI
- Implement apply logic
- **Assignee**: Developer

### T010 - Export/Import Feature
- [ ] **Status**: Planned
- Design export format
- Implement export logic
- Add import validation
- **Assignee**: Developer

## Bug Fixes

### B001 - Electron Font Warning
- [x] **Status**: Completed
- Fix CoreText font warnings
- Update font configuration
- **Assignee**: Developer

### B002 - Copy/Compare Error Handling
- [x] **Status**: Completed
- Replace prompt/alert with modals
- Add proper error messages
- **Assignee**: Developer

### B003 - Sticky Header Gap
- [x] **Status**: Completed
- Fix spacing in sticky headers
- Ensure smooth scrolling
- **Assignee**: Developer

## Testing Tasks

### QA001 - Cross-Browser Testing
- [ ] **Status**: Planned
- Test in Chrome, Firefox, Safari
- Verify dark mode in all browsers
- **Assignee**: QA

### QA002 - Electron App Testing
- [ ] **Status**: Planned
- Test on macOS, Windows, Linux
- Verify all features work
- **Assignee**: QA

### QA003 - Performance Testing
- [ ] **Status**: Planned
- Measure load times
- Test with 100+ projects
- **Assignee**: QA