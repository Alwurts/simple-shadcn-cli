# Contributing to Simple Shadcn CLI

Thank you for your interest in contributing to Simple Shadcn CLI! This document will guide you through the contribution process.

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow existing code formatting (we use Biome.js)
- Keep functions small and focused
- Add comments for complex logic
- Use meaningful variable and function names

### Documentation

- Update README.md for new features or changes
- Add JSDoc comments for exported functions
- Include examples in documentation when helpful

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages. This helps us automatically generate changelogs and determine semantic version bumps.

### Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

### Detailed Commit Examples

```
feat(registry): add new button component to registry
- Added button component JSON schema
- Implemented component validation
- Updated documentation

fix(cli): resolve path resolution in Windows environments
- Fixed backslash handling in file paths
- Added tests for Windows-specific scenarios

docs(readme): update installation instructions
- Added npm installation method
- Updated prerequisites section
- Added troubleshooting guide

refactor(build): improve component generation logic
- Simplified template processing
- Removed redundant code
- Improved type safety

BREAKING CHANGE: change component registry format
- New schema format is incompatible with previous versions
- Users need to update their component definitions
- See migration guide for details

style(components): format code according to style guide
- Applied prettier formatting
- Fixed indentation
- Organized imports

test(cli): add integration tests for build command
- Added test cases for different configurations
- Improved test coverage
- Added error case testing
```

### Best Practices for Commits

1. Keep commits atomic and focused on a single change
2. Write clear, concise descriptions in imperative mood
3. Include context in the body when needed
4. Reference issues/PRs in footer when applicable
5. Break down large changes into smaller commits

## Pull Request Process

1. Fork the repository and create your branch from `main`.
2. Ensure your code follows the existing style conventions.
3. Update the documentation if needed.
4. Make sure your commits follow the conventional commit format.
5. Create a Pull Request to the `main` branch.

### PR Guidelines

- Use a clear, descriptive title following commit convention
- Link related issues
- Respond to review comments promptly
- Keep PRs focused and reasonable in size

## Release Process

The project uses semantic-release for automated versioning and publishing. Here's how it works:

1. Commits to the `main` branch trigger the release workflow.
2. Based on conventional commits, semantic-release will:
   - Determine the next version number
   - Generate/update the CHANGELOG.md
   - Create a GitHub release
   - Publish to npm

### Version Bumps

- `feat:` commits trigger a minor version bump (0.X.0)
- `fix:` commits trigger a patch version bump (0.0.X)
- `BREAKING CHANGE:` in commit body triggers a major version bump (X.0.0)

### Release Notes

The release notes are automatically generated based on your commit messages, which is why following the commit convention is crucial. Good commit messages result in clear, useful release notes.
