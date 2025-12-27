# Contributing to Bus Tracker

Thank you for your interest in contributing to the Bus Tracker project! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Respect different viewpoints

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (browser, OS, etc.)
   - Screenshots if applicable

### Suggesting Features

1. Check existing feature requests
2. Create a new issue with:
   - Clear description of the feature
   - Use case and benefits
   - Potential implementation approach
   - Any relevant examples

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow code style guidelines
   - Write clear commit messages
   - Add tests if applicable
   - Update documentation

4. **Test your changes**
   - Test locally
   - Ensure no linting errors
   - Verify functionality

5. **Submit pull request**
   - Clear title and description
   - Reference related issues
   - Add screenshots for UI changes

## Development Setup

See [SETUP.md](SETUP.md) for detailed setup instructions.

## Code Style

### JavaScript/React

- Use ES6+ features
- Follow React best practices
- Use functional components with hooks
- Keep components small and focused
- Use meaningful variable names

### Naming Conventions

- Components: PascalCase (`BusTracker.jsx`)
- Files: camelCase for utilities, PascalCase for components
- Variables: camelCase
- Constants: UPPER_SNAKE_CASE

### Code Formatting

- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas
- Maximum line length: 100 characters

## Commit Messages

Follow conventional commits:

```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Tests
- `chore`: Maintenance

Examples:
```
feat(tracker): add offline mode support
fix(beacon): resolve location update issue
docs(readme): update setup instructions
```

## Testing

- Test on multiple browsers
- Test on mobile devices
- Test offline functionality
- Test with multiple beacons
- Verify privacy features

## Documentation

- Update README for user-facing changes
- Update ARCHITECTURE.md for system changes
- Add code comments for complex logic
- Update API documentation if needed

## Areas for Contribution

### High Priority
- Battery optimization improvements
- Offline functionality enhancements
- Error handling improvements
- Performance optimizations
- Accessibility improvements

### Medium Priority
- Additional map features
- Enhanced admin dashboard
- Better analytics
- Mobile app (React Native)
- Internationalization

### Low Priority
- UI/UX improvements
- Additional themes
- Documentation improvements
- Code refactoring

## Questions?

- Open an issue for questions
- Check existing documentation
- Review code comments
- Ask in discussions

Thank you for contributing! 🚀

