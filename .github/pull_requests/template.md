# Pull Request Template

## Description

<!-- What does this PR do? -->
<!-- Link to related issue if applicable -->

## Type of Change

- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix or feature that causes existing functionality to change)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] Performance improvement
- [ ] Test coverage update

## AI Agent Skills Applied

<!-- Check any Matt Pocock or GStack skills used in this PR -->

### Matt Pocock Skills Used
- [ ] `/diagnose` - Error analysis and fix
- [ ] `/grill-me` - Design review
- [ ] `/grill-with-docs` - Documentation update
- [ ] `/tdd` - Test-driven development
- [ ] `/improve-codebase-architecture` - Architecture improvement
- [ ] `/to-issues` - Task breakdown
- [ ] `/zoom-out` - High-level review
- [ ] Other: ____________

### GStack Skills Applied
- [ ] Design Consultation
- [ ] QA Testing
- [ ] Ship & Deploy
- [ ] Code Review
- [ ] Document Release
- [ ] Other: ____________

## Checklist

### Code Quality
- [ ] Code follows project style guidelines
- [ ] ESLint passes without errors
- [ ] TypeScript compilation succeeds
- [ ] No hardcoded values (use constants/config)
- [ ] Error handling is comprehensive
- [ ] Comments explain "why" not "what"

### Testing
- [ ] Unit tests added/updated for new features
- [ ] Unit tests pass locally (`npm run test`)
- [ ] E2E tests added for user flows
- [ ] Test coverage meets project standards (>70%)

### Documentation
- [ ] JSDoc comments for public APIs
- [ ] README updated if needed
- [ ] CHANGELOG.md updated
- [ ] Architecture decisions documented in ADRs

### Offline & Mobile Considerations
- [ ] Features work offline (IndexedDB/SW)
- [ ] Mobile-first responsive design
- [ ] Touch targets ≥44px
- [ ] Performance optimized for basic smartphones

### Security
- [ ] No sensitive data in code
- [ ] Input sanitization
- [ ] SQL injection prevention
- [ ] XSS protection

### Performance
- [ ] Bundle size check (no unintended growth)
- [ ] Lazy loading where applicable
- [ ] No memory leaks
- [ ] Optimized images/assets

## Screenshots/Recordings

<!-- Add screenshots or screen recordings if UI changes -->

## Related Issues

<!-- Link to GitHub issues -->
Closes #________
Related to #________

## Notes for Reviewers

<!-- Special instructions for reviewers -->
<!-- Known limitations -->
<!-- Testing instructions -->

## Deployment Checklist

- [ ] Build succeeds (`npm run build`)
- [ ] Preview tested locally
- [ ] Migration scripts run (if applicable)
- [ ] Environment variables configured
- [ ] Database migrations applied
