# Bugs and Issues Tracker

## Active Bugs

### BUG-001: Electron App Launch Failure
- **Status**: Open
- **Severity**: High
- **Description**: main.js throws "Cannot read properties of undefined (reading 'whenReady')"
- **Steps to Reproduce**:
  1. Run `npm run electron:dev`
  2. App fails to launch
- **Expected**: App launches successfully
- **Actual**: TypeError in main.js:44
- **Assignee**: Developer

### BUG-002: Project Names Show as Hidden Directories
- **Status**: Fixed
- **Severity**: Medium
- **Description**: Some projects display as ".claude" or ".mcp"
- **Resolution**: Added logic to use parent directory name

### BUG-003: Runtime Errors with prompt/alert
- **Status**: Fixed
- **Severity**: Medium
- **Description**: Browser prompt/alert not supported in Next.js SSR
- **Resolution**: Replaced with proper modal dialogs

## Known Issues

### ISSUE-001: Large Project Performance
- **Status**: Open
- **Impact**: Low
- **Description**: Slow loading with 50+ projects
- **Workaround**: Use search/filter to reduce visible projects

### ISSUE-002: Configuration Hot Reload
- **Status**: Open
- **Impact**: Low
- **Description**: Changes made outside app don't auto-refresh
- **Workaround**: Click refresh button manually

### ISSUE-003: MCP Specification Compliance
- **Status**: Open
- **Impact**: Medium
- **Description**: MCP annotate feature not yet implemented
- **Workaround**: Edit .mcp.json manually

## Feature Requests

### FR-001: Keyboard Shortcuts
- **Status**: Accepted
- **Priority**: P2
- **Description**: Add keyboard shortcuts for common actions

### FR-002: Bulk Operations
- **Status**: Under Review
- **Priority**: P2
- **Description**: Apply changes to multiple projects at once

### FR-003: Configuration History
- **Status**: Accepted
- **Priority**: P1
- **Description**: Track and revert configuration changes

## Resolved Issues (Last Sprint)

### BUG-004: Sticky Header Gap
- **Status**: Closed
- **Resolution Date**: 2024-10-01
- **Description**: Gap between stats and search sections
- **Fix**: Made entire section sticky with proper z-index

### BUG-005: Copy To Target Not Found
- **Status**: Closed
- **Resolution Date**: 2024-10-01
- **Description**: "Target project not found" error
- **Fix**: Fixed handleCopyConfig signature

## QA Test Results

### Test Run: 2024-10-01
- **Total Tests**: 15
- **Passed**: 12
- **Failed**: 3
- **Blocked**: 0

### Failed Tests
1. Electron app launch (BUG-001)
2. Large dataset performance
3. Cross-platform compatibility (untested)