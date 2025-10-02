# CLAUDE.md File Conventions

## Overview
CLAUDE.md files are project-specific memory files for the Claude Code agentic developer tool. They serve as a project-specific brain or playbook, providing persistent instructions and context to ensure consistent, accurate results.

## Storage Locations (By Priority)

### 1. Project Scope (Primary)
- **Location**: Project root directory (`/path/to/project/CLAUDE.md`)
- **Purpose**: Shared team configuration
- **Version Control**: Committed to repository
- **Priority**: Highest for project-specific work

### 2. Directory Scope
- **Location**: Any subdirectory (`/path/to/project/subdir/CLAUDE.md`)
- **Purpose**: Subdirectory-specific context
- **Version Control**: Committed to repository
- **Priority**: More specific files override general ones

### 3. Local Scope
- **Location**: Project root (`/path/to/project/CLAUDE.local.md`)
- **Purpose**: Personal, developer-specific notes
- **Version Control**: Ignored (add to .gitignore)
- **Priority**: Overrides project scope for individual developer

### 4. User Scope (Global)
- **Location**: Home directory (`~/.claude/CLAUDE.md`)
- **Purpose**: Personal preferences across all projects
- **Version Control**: Not in project repo
- **Priority**: Lowest, applies to all projects

## File Contents

CLAUDE.md files should include:

### Project Conventions
- Architectural decisions
- Code style guides
- Module relationships
- Design patterns in use

### Key Files and Commands
- Core functions documentation
- Common scripts and their purposes
- Custom commands and aliases
- Build and deployment commands

### Workflow Instructions
- Development process steps
- Branch naming conventions
- Code review requirements
- Testing procedures

### Best Practices
- Code quality standards
- Error handling patterns
- Performance guidelines
- Security considerations

### Task Checklists
- Common task sequences
- Complex operation steps
- Deployment checklists
- Debugging procedures

## Benefits

1. **Consistent Execution**: Same instructions across all team members
2. **Reduced Context Pollution**: Controlled access to relevant information
3. **Better Results**: Explicit, structured documentation improves AI understanding
4. **Efficient Workflows**: Quick onboarding and context establishment

## Migration from Legacy Structure

Previously, CLAUDE.md files were stored in `.claude/` subdirectories. The new convention prioritizes project root storage for better visibility and version control. The app maintains backward compatibility with the legacy structure.

### Migration Steps:
1. Move `.claude/CLAUDE.md` to project root
2. Update .gitignore if creating CLAUDE.local.md
3. Remove empty .claude directories if no longer needed

## Example CLAUDE.md Structure

```markdown
# Project Name Configuration

## Project Overview
Brief description of the project's purpose and architecture

## Key Conventions
- REST API naming: /api/v1/resource-name
- Component structure: Feature-based organization
- State management: Redux Toolkit

## Key Files and Commands
- `npm run dev` - Start development server
- `npm test` - Run test suite
- `src/core/` - Core business logic
- `src/api/` - API endpoints

## Workflow Instructions
1. Create feature branch from main
2. Run tests before committing
3. Update CHANGELOG.md
4. Request review from team lead

## Best Practices
- Write tests for new features
- Use TypeScript strict mode
- Document complex algorithms
- Follow accessibility guidelines
```

## Integration with Claude Config Manager

The Claude Config Manager respects these conventions:

1. **Discovery**: Searches for CLAUDE.md in project root first, then legacy locations
2. **Creation**: New files default to project root
3. **Preservation**: Maintains existing file locations to avoid breaking workflows
4. **Support**: Handles both CLAUDE.md and CLAUDE.local.md files