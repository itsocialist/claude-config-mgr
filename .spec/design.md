# Design Specification

## UI Architecture
### Layout Structure
```
┌─────────────────────────────────────────────┐
│ Header (Logo | Navigation | Theme Toggle)   │
├─────────────────────────────────────────────┤
│ Stats Bar (Projects | Memory | Agents | MCP)│
├─────────────────────────────────────────────┤
│ Search & Filter Bar                         │
├─────────────────────────────────────────────┤
│ Project Grid/List View                      │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│ │ Project │ │ Project │ │ Project │       │
│ └─────────┘ └─────────┘ └─────────┘       │
└─────────────────────────────────────────────┘
```

### Component Hierarchy
- `ProjectDashboard` (Container)
  - `ProjectSearchBar` (Filter/Search)
  - `ProjectGrid` (Display)
    - `ProjectCard` (Individual)
  - `ProjectDetailView` (Editor)
    - `CodeEditor` (Monaco)

## Technical Design

### State Management
```typescript
interface AppState {
  projects: Project[]
  selectedProject: Project | null
  view: 'grid' | 'detail'
  filters: FilterState
  theme: 'light' | 'dark'
}
```

### API Architecture
- `/api/config-files` - Project discovery
- `/api/projects/[id]` - Project details
- `/api/config-files` (PUT) - Save changes

### Performance Targets
- Initial Load: < 1s
- Project Switch: < 200ms
- Search Response: < 100ms
- Save Operation: < 500ms

## Design System

### Colors
- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Orange (#F59E0B)
- Error: Red (#EF4444)
- Neutral: Gray scale

### Typography
- Headings: Inter, 600 weight
- Body: Inter, 400 weight
- Code: JetBrains Mono

### Spacing
- Base unit: 4px
- Component padding: 16px
- Section spacing: 24px

### Components
- Cards with hover elevation
- Sticky headers with backdrop blur
- Modal dialogs for operations
- Toast notifications for feedback

## Responsive Design
- Desktop: 4-column grid
- Tablet: 2-column grid
- Mobile: Single column (future)