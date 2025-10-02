# Claude Configuration Manager - Project Context

## 🎯 Role-Based Context Loading Instructions

When starting a new conversation, specify your role to load the appropriate context:

### For Product Management Tasks:
```
"Acting as PM, I need to..."
Load: .spec/claude-config-mgr.md, .spec/requirements.md, .spec/stories.md, .agents/pm.md
```

### For Development Tasks:
```
"Acting as Developer, I need to..."
Load: .spec/design.md, .spec/tasks.md, .steering/practices.md, .steering/workflow.md, .agents/developer.md
Check: .spec/bugs-issues.md for known issues
```

### For QA/Testing Tasks:
```
"Acting as QA, I need to..."
Load: .spec/bugs-issues.md, .steering/testing.md, .spec/requirements.md, .agents/qa.md
```

### For Bug Fixes:
```
"I need to fix bug..."
Load: .spec/bugs-issues.md, .spec/tasks.md, .steering/workflow.md
```

### For Feature Implementation:
```
"I need to implement feature..."
Load: .spec/requirements.md, .spec/stories.md, .spec/tasks.md, .spec/design.md
Reference: Existing components in components/project/ for patterns
```

### For Documentation Updates:
```
"I need to update documentation..."
Load: README.md, relevant .spec/ files
Follow: .steering/rules.md for documentation standards
```

## 📋 Context Loading Rules
1. **NEVER load all files** - Use role-based loading above
2. **Check task status first** - `.spec/tasks.md` shows current priorities
3. **Reference, don't include** - Mention file paths instead of loading entire contents
4. **Update after changes** - Keep `.spec/` files current with project state

## Project Structure
This is a Next.js 14 application with Electron support for managing Claude configurations.

## Key Directories

### Documentation (Context-Optimized Loading)
- **`.spec/`** - Product specifications and requirements
  - Load `requirements.md` to check feature status
  - Load `tasks.md` for current work items
  - Load `bugs-issues.md` for known issues

- **`.steering/`** - Development workflow and practices
  - Reference `workflow.md` for process
  - Check `rules.md` for coding standards

- **`.agents/`** - Role definitions
  - `developer.md` - Technical implementation
  - `pm.md` - Product decisions
  - `qa.md` - Quality assurance

### Application Code
- **`app/`** - Next.js app router pages
- **`components/`** - React components
  - `project/` - Project-specific components
  - `ui/` - Reusable UI components (shadcn/ui)
- **`stores/`** - State management (Zustand)
- **`lib/`** - Utility functions

## Current State
- Version: 0.3.0
- Status: Active development
- Sprint: 3 (Cross-Project Features)

## Active Work
Check `.spec/tasks.md` for current tasks and priorities.

## Development Workflow
1. Check tasks in `.spec/tasks.md`
2. Update status when starting work
3. Follow practices in `.steering/practices.md`
4. Log bugs in `.spec/bugs-issues.md`

## Quick Commands
```bash
npm run dev          # Web development (port 3002)
npm run electron:dev # Desktop app development
npm run build        # Production build
```

## Context Optimization Rules
1. **Don't load all files** - Reference specific files as needed
2. **Check task status first** - Look at `.spec/tasks.md` before starting work
3. **Follow established patterns** - Reference existing components for consistency
4. **Update documentation** - Keep `.spec/` files current

## Key Features Implemented
- ✅ Project discovery and display
- ✅ Configuration viewing/editing
- ✅ Dark mode support
- ✅ Search and filtering
- ✅ Copy/Compare modals
- ✅ Clipboard support
- 🚧 Electron desktop app
- ⏳ Multiple workspace paths
- ⏳ User onboarding

## Known Issues
See `.spec/bugs-issues.md` for current bugs and workarounds.

## Tech Stack
- Next.js 14.0.4
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Electron 27
- Monaco Editor

## Performance Targets
- Initial load: <1s
- Project switch: <200ms
- Search: <100ms

## Contact
For questions, check `.steering/team.md` for team structure.