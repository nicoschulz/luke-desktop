# Contributing to Luke Desktop

First off, thank you for considering contributing to Luke Desktop! It's people like you that make Luke Desktop such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* Use a clear and descriptive title
* Describe the exact steps which reproduce the problem
* Provide specific examples to demonstrate the steps
* Describe the behavior you observed after following the steps
* Explain which behavior you expected to see instead and why
* Include screenshots if possible
* Include your environment details (OS, Node.js version, Rust version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* Use a clear and descriptive title
* Provide a step-by-step description of the suggested enhancement
* Provide specific examples to demonstrate the steps
* Describe the current behavior and explain which behavior you expected to see instead
* Explain why this enhancement would be useful

### Pull Requests

* Fill in the required template
* Do not include issue numbers in the PR title
* Include screenshots and animated GIFs in your pull request whenever possible
* Follow our coding conventions
* Document new code
* End all files with a newline

## Development Process

1. Fork the repo
2. Create a new branch from `main`
3. Make your changes
4. Run the tests
5. Push your changes
6. Create a Pull Request

### Setup Development Environment

```bash
# Clone your fork
git clone https://github.com/yourusername/luke-desktop.git

# Add upstream remote
git remote add upstream https://github.com/originalowner/luke-desktop.git

# Install dependencies
npm install

# Run development server
npm run tauri dev
```

### Coding Conventions

* Use TypeScript
* Follow the existing code style
* Write meaningful commit messages
* Add tests for new features
* Update documentation as needed

## Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- path/to/test-file.test.ts
```

## Documentation

* Keep READMEs up to date
* Document all functions and complex code
* Update the wiki if needed

## Questions?

Feel free to create an issue tagged as a question.