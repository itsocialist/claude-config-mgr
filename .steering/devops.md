# DevOps Configuration

## Development Environment
- Node.js 18+
- npm 9+
- Next.js 14
- Electron 27+

## Scripts
```bash
npm run dev          # Development server
npm run build        # Production build
npm run electron:dev # Electron development
npm run electron:build # Package Electron app
```

## Deployment
### Web Version
1. Build: `npm run build`
2. Deploy to Vercel/Netlify
3. Set environment variables
4. Configure custom domain

### Desktop Version
1. Build: `npm run electron:build`
2. Code sign application
3. Notarize for macOS
4. Create installers
5. Distribute via GitHub Releases

## CI/CD Pipeline (Future)
```yaml
on: [push, pull_request]
jobs:
  - lint
  - type-check
  - test
  - build
  - deploy (on main)
```

## Monitoring
- Error tracking: Sentry (future)
- Analytics: Posthog (future)
- Performance: Web Vitals
- Uptime: Status page

## Backup Strategy
- Code: GitHub
- Configurations: User's local
- Database: N/A (file-based)

## Security
- Dependency scanning
- Code scanning
- Secret scanning
- Security headers