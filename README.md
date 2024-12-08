# Luke Desktop

A Claude Desktop alternative with MCP server support built with Tauri + React + TypeScript.

## Features

- 🚀 Built with Tauri 2.x for optimal performance
- ⚛️ Modern React with TypeScript
- 🔄 Model Context Protocol (MCP) server integration
- 🔒 Enhanced security features
- 📁 Advanced file management
- 🎨 Tailwind CSS for styling
- 🔌 Plugin support
- 🌐 Cross-platform support

## Prerequisites

- Node.js v22.11.0+
- Rust v1.83.0+
- Cargo v1.83.0+

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/luke-desktop.git
   cd luke-desktop
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run development server:
   ```bash
   npm run tauri dev
   ```

4. Build for production:
   For detailed build instructions, see our [Build Guide](docs/BUILD.md).

## Project Structure

```
luke-desktop/
├── src/                # React frontend source
├── src-tauri/          # Tauri backend source
│   ├── src/            # Rust source code
│   └── target/         # Compiled outputs
├── public/             # Static assets
├── config/             # Configuration files
├── tests/              # Test files
└── docs/              # Documentation
    ├── BUILD.md       # Build configuration guide
    └── API.md         # API documentation
```

## Documentation

- [Build Guide](docs/BUILD.md) - Detailed build configuration and deployment
- [API Documentation](docs/API.md) - API reference and usage
- [Security Guide](SECURITY.md) - Security features and best practices
- [Contributing Guide](CONTRIBUTING.md) - Guidelines for contributors

## MCP Integration

Luke Desktop implements the Model Context Protocol (MCP) for communicating with Claude and other compatible AI models. See the [MCP specification](https://github.com/modelcontextprotocol/servers) for more details.

## Security

The application implements several security measures:
- Secure file system operations
- API key management
- Local storage encryption
- Authentication system
- Path traversal protection
- File type validation

For more details, see our [Security Documentation](SECURITY.md).

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository.

## Acknowledgments

- [Tauri](https://tauri.app/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Model Context Protocol](https://github.com/modelcontextprotocol/servers)

Last updated: 2024-12-08