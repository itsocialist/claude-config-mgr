# Project-Centric UI Design Proposal

## Overview

This proposal introduces a clean, project-centric redesign of the Claude Config Manager that addresses the core requirements while maintaining simplicity and reducing cognitive load.

## Current vs. Proposed Architecture

### Current (Tab-Based)
```
[Profiles] [MCP Servers] [Config Files] [CLAUDE.md] [Settings]
     ↓          ↓             ↓            ↓         ↓
  All mixed   All mixed   All mixed    All mixed  Global
  together    together    together     together   settings
```

### Proposed (Project-Centric)
```
[Global] [Project A] [Project B] [+ Add] | [Profiles] [MCP] [Cross-Project]
                          ↓
                 Project Context View
    ┌─────────────────┬─────────────────┬─────────────────┐
    │ Instructions    │ Configuration   │ Agents         │
    │ (CLAUDE.md)     │ Files          │                │
    └─────────────────┴─────────────────┴─────────────────┘
                          ↓
                 Unified Detail Editor
```

## Key Design Principles

### 1. **Projects as First-Class Citizens**
- Primary navigation is by project tabs
- Each project shows its complete context at a glance
- Global configs treated as a special "Global" project

### 2. **Contextual Organization**
- Instructions, configs, and agents grouped by logical function
- Related items visually connected within project scope
- Clear visual hierarchy with consistent spacing (8px/16px/24px grid)

### 3. **Progressive Disclosure**
- Essential project context always visible
- Advanced features (profiles, cross-project) available on demand
- Collapsible panels for non-essential functionality

### 4. **Unified Actions**
- Single detail view handles all file types
- Consistent edit/save workflow across all configurations
- Cross-project operations centralized in dedicated panel

## Component Architecture

### Core Components

1. **ProjectCentricDashboard** - Main orchestrator
2. **CrossProjectActions** - Compare/copy between projects
3. **ProjectMCPServers** - Project-specific MCP management
4. **CodeEditor** - Unified editing experience

### Design System

#### Color Palette
- **Blue**: Primary actions, global context
- **Green**: Configuration files, MCP servers
- **Orange**: Instructions/CLAUDE.md
- **Purple**: Agents, cross-project actions
- **Gray**: Secondary content, inactive states

#### Spacing Scale
- **4px**: Icon gaps, tight spacing
- **8px**: Component padding
- **16px**: Card padding, section gaps
- **24px**: Major section spacing
- **32px**: Layout margins

#### Typography
- **Headings**: Inter/system font, semibold
- **Body**: Regular weight, 14px base
- **Code**: JetBrains Mono, 13px
- **Captions**: 12px, muted color

## User Workflows

### Primary Workflow: Project Configuration
1. Select project tab
2. View context cards (instructions, configs, agents)
3. Click item to edit in unified detail view
4. Save changes with single action

### Secondary Workflow: Cross-Project Operations
1. Click "Cross-Project" button
2. Select source and target projects
3. Choose configuration to compare/copy
4. Execute action with confirmation

### Tertiary Workflow: Profile Management
1. Click "Profiles" button to expand
2. View all available profiles
3. Apply or create profiles as needed

## Technical Implementation

### State Management
- Centralized config data fetching
- Local state for UI interactions
- Optimistic updates where appropriate

### Performance Considerations
- Lazy loading of project data
- Debounced search
- Virtualized lists for large datasets

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader optimizations
- Color contrast ratios > 4.5:1

## Benefits

### For Users
- **Reduced Cognitive Load**: Clear project boundaries
- **Faster Navigation**: Direct project access
- **Better Context**: All related configs visible together
- **Simplified Operations**: Unified editing experience

### For Developers
- **Cleaner Code**: Separation of concerns
- **Better Maintainability**: Component-based architecture
- **Enhanced Testing**: Isolated functionality
- **Future Extensibility**: Modular design

## Migration Strategy

### Phase 1: Parallel Implementation
- Keep existing tab interface
- Add project-centric view as option
- Allow users to switch between modes

### Phase 2: User Feedback
- Gather usage analytics
- Collect user feedback
- Refine project-centric approach

### Phase 3: Full Migration
- Make project-centric the default
- Deprecate tab interface
- Remove legacy code

## Files Created

- `components/ProjectCentricDashboard.tsx` - Main project-centric interface
- `components/CrossProjectActions.tsx` - Cross-project operations
- `components/ProjectMCPServers.tsx` - Project-specific MCP management
- `components/ui/select.tsx` - Select component for dropdowns
- `app/page-project-centric.tsx` - Updated main page with view toggle

## Next Steps

1. **Test Implementation**: Verify all components render correctly
2. **Add Missing APIs**: Implement copy/compare functionality
3. **User Testing**: Gather feedback on new workflow
4. **Refinement**: Adjust based on user feedback
5. **Documentation**: Create user guide for new interface

This design maintains all existing functionality while providing a more intuitive, project-focused experience that scales better as the number of projects grows.