# Development Rules

## Code Rules
1. **No console.logs in production**: Use proper logging
2. **No hardcoded values**: Use environment variables
3. **No any types**: Proper TypeScript types required
4. **No direct DOM manipulation**: React only
5. **No synchronous file operations**: Always async

## UI/UX Rules
1. **Feedback required**: Every action needs visual feedback
2. **Loading states**: Show progress for async operations
3. **Error boundaries**: Graceful error handling
4. **Accessibility**: WCAG 2.1 AA compliance
5. **Dark mode**: All components must support both themes

## Security Rules
1. **No eval()**: Never execute dynamic code
2. **Input validation**: Sanitize all user input
3. **Path traversal**: Validate file paths
4. **CORS properly configured**: Restrict origins
5. **No sensitive data in code**: Use env variables

## Performance Rules
1. **Lazy loading**: Load components as needed
2. **Debounce searches**: 300ms minimum
3. **Virtualize long lists**: >50 items
4. **Image optimization**: Use Next.js Image
5. **Bundle size limits**: <500KB initial load

## Documentation Rules
1. **Update README**: For all new features
2. **Document APIs**: All endpoints documented
3. **Comment complex logic**: Explain why, not what
4. **Update specs**: Keep .spec/ files current
5. **Semantic commits**: Follow conventional commits

## Testing Rules (Future)
1. **Unit tests**: 80% coverage target
2. **Integration tests**: Critical paths
3. **E2E tests**: User workflows
4. **Performance tests**: Load time checks
5. **Accessibility tests**: Automated checks