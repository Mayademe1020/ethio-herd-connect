# Contributing to EthioHerd Connect

Thank you for your interest in contributing to EthioHerd Connect!

## Development Setup

### Prerequisites
- Node.js 18+
- npm 9+
- Supabase account (for local development)

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-org/ethio-herd-connect.git
cd ethio-herd-connect
```

2. Install dependencies
```bash
npm install
```

3. Create environment file
```bash
cp .env.example .env
```

4. Update `.env` with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

5. Start development server
```bash
npm run dev
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Route pages
├── hooks/         # Custom React hooks
├── contexts/      # React context providers
├── services/      # Business logic & API
├── stores/        # Zustand stores
├── types/         # TypeScript types
├── utils/         # Utility functions
└── i18n/         # Translations
```

## Coding Standards

### TypeScript
- Use strict TypeScript mode
- Avoid `any` - use proper types or `unknown`
- Use interfaces for object shapes

### React
- Use functional components with hooks
- Keep components small and focused
- Use proper memoization where needed

### Styling
- Use Tailwind CSS
- Follow existing class naming patterns
- Ensure responsive design

### Accessibility
- All interactive elements must be keyboard accessible
- Use semantic HTML
- Include ARIA labels where needed

## Testing

### Running Tests

```bash
# Unit tests
npm run test:run

# E2E tests
npm run test:e2e

# Watch mode
npm run test
```

### Writing Tests
- Place tests in `src/__tests__/`
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

## Git Workflow

1. Create a feature branch
```bash
git checkout -b feature/your-feature
```

2. Make changes and commit
```bash
git add .
git commit -m "feat: add new feature"
```

3. Push and create PR
```bash
git push origin feature/your-feature
```

### Commit Message Format
```
type(scope): description

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- test: Adding tests
- chore: Maintenance
```

## Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Request review from maintainers
4. Address feedback promptly

## Getting Help

- Open an issue for bugs
- Use discussions for questions
- Join our community chat

## Code of Conduct

Be respectful and inclusive. We're building for Ethiopian farmers - keep their needs in mind.
