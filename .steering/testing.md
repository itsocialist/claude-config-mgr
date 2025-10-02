# Testing Strategy

## Test Levels
1. **Unit Tests**: Individual functions/components
2. **Integration Tests**: Component interactions
3. **E2E Tests**: User workflows
4. **Performance Tests**: Load and speed
5. **Accessibility Tests**: WCAG compliance

## Current Test Coverage
- Manual testing only
- Focus on critical paths
- Bug tracking in `.spec/bugs-issues.md`

## Test Scenarios
### Critical Paths
1. Project discovery and display
2. Configuration viewing/editing
3. Save operations
4. Theme switching
5. Search and filter

### Edge Cases
1. No projects found
2. Large number of projects (100+)
3. Corrupt configuration files
4. Network failures
5. Permission issues

## Future Test Implementation
```typescript
// Example test structure
describe('ProjectCard', () => {
  it('displays project name', () => {})
  it('shows configuration counts', () => {})
  it('handles click events', () => {})
})
```

## QA Checklist
- [ ] Functionality works as expected
- [ ] UI renders correctly
- [ ] Dark mode displays properly
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Accessibility compliant

## Bug Reporting Template
```markdown
### Description
Brief description of the issue

### Steps to Reproduce
1. Step one
2. Step two

### Expected Behavior
What should happen

### Actual Behavior
What actually happens

### Environment
- OS:
- Browser:
- Version:
```