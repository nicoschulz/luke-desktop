# Development Environment Setup Guide

This guide will walk you through setting up all necessary components for Luke Desktop development, with a focus on security and MCP integration.

## Prerequisites Installation

### 1. Node.js Setup (v22.11.0+)
- Visit https://nodejs.org/
- Download and install Node.js v22.11.0 or later
- Verify installation:
  ```bash
  node --version  # Should show v22.11.0 or higher
  npm --version
  ```

### 2. Rust Setup (v1.83.0+)
- Windows:
  - Visit https://rustup.rs/
  - Download and run rustup-init.exe
  - Follow the installation prompts
- MacOS/Linux:
  ```bash
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  ```
- Verify installation:
  ```bash
  rustc --version  # Should show v1.83.0 or higher
  cargo --version
  ```

### 3. Development Tools & Security Components
- Windows:
  - Install Visual Studio Build Tools 2019 or later
  - Ensure "Desktop development with C++" workload is installed
  - Install libmagic for file type validation:
    ```bash
    # Using MSYS2
    pacman -S mingw-w64-x86_64-file
    ```
- MacOS:
  ```bash
  xcode-select --install
  brew install libmagic
  ```
- Linux:
  ```bash
  # Ubuntu/Debian
  sudo apt update
  sudo apt install \
    libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    libmagic-dev
  ```

## Project Setup

### 1. Initialize Project
```bash
# Create project directory
mkdir LukeDesktop
cd LukeDesktop

# Install Tauri CLI
cargo install tauri-cli

# Create new Tauri + React + TypeScript project
npm create tauri-app
```

### 2. Install Dependencies
```bash
# Core dependencies
npm install

# UI and State Management
npm install @emotion/react @emotion/styled @mui/material @mui/icons-material
npm install @reduxjs/toolkit react-redux
npm install react-router-dom

# Security Dependencies
npm install argon2 # For password hashing
npm install crypto-js # For encryption
npm install sanitize-html # For XSS prevention

# MCP Dependencies
npm install axios # For HTTP requests
npm install socket.io-client # For WebSocket connections
npm install uuid # For message IDs
```

### 3. Security Configuration
- Set up Tauri 2.1.0 security features:
  ```rust
  // In src-tauri/tauri.conf.json
  {
    "security": {
      "csp": "default-src 'self'; script-src 'self'",
      "freezePrototype": true,
      "dangerousRemoteDomainIpcAccess": []
    },
    "allowlist": {
      // Configure specific APIs only
    }
  }
  ```

### 4. MCP Integration Setup
- Clone MCP specification:
  ```bash
  git clone https://github.com/modelcontextprotocol/servers.git reference/mcp-spec
  ```
- Set up MCP client configuration:
  ```typescript
  // src/config/mcp.ts
  export const MCPConfig = {
    defaultServer: process.env.VITE_MCP_SERVER_URL,
    timeout: 30000,
    retryAttempts: 3,
    // Add other MCP-specific configurations
  };
  ```

### 5. Development Environment Configuration
- Create a `.env` file:
  ```
  VITE_MCP_SERVER_URL=your_mcp_server_url
  VITE_ENCRYPTION_KEY=your_encryption_key
  VITE_API_KEY=your_api_key
  ```
- Configure VS Code:
  - Required extensions:
    - Rust Analyzer
    - TypeScript and JavaScript Language Features
    - Tauri
    - ESLint
    - Prettier
    - Code Spell Checker
    - Security Audit
    - TOML

### 6. File System Security Setup
- Configure secure file paths:
  ```typescript
  // src/utils/secureFiles.ts
  export const secureFilePaths = {
    base: app.getPath('userData'),
    attachments: path.join(app.getPath('userData'), 'attachments'),
    temp: path.join(app.getPath('userData'), 'temp'),
    // Add other secure paths
  };
  ```

## Project Structure
```
luke-desktop/
├── src/
│   ├── components/     # React components
│   ├── contexts/       # React contexts
│   ├── hooks/         # Custom hooks
│   ├── services/      # Services including MCP
│   ├── store/         # Redux store
│   ├── types/         # TypeScript types
│   ├── utils/         # Utility functions
│   └── security/      # Security utilities
├── src-tauri/
│   ├── src/
│   └── Cargo.toml
└── [Other configuration files]
```

## Security Best Practices
1. Always use Tauri's secure APIs
2. Implement input validation
3. Use content security policies
4. Implement secure file operations
5. Handle sensitive data properly
6. Follow MCP security guidelines
7. Regular security audits

## MCP Integration Checklist
1. Implement MCPClient class
2. Set up connection handling
3. Implement message protocols
4. Add error handling
5. Set up reconnection logic
6. Implement server health checks
7. Add capability detection

## Testing Setup
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom
npm install --save-dev vitest
```

## Version Control Setup
```bash
git init
git add .
git commit -m "Initial secure setup with MCP integration"
```

## Troubleshooting

### Common Issues

#### Windows
- WebView2 errors: Install Microsoft Edge WebView2 Runtime
- File type validation: Ensure libmagic is properly installed

#### MacOS
- Code signing issues:
  ```bash
  codesign --force --deep --sign - target/release/bundle/macos/your-app.app
  ```

#### Linux
- webkit2gtk errors:
  ```bash
  sudo apt install webkit2gtk-4.0
  ```

### Security Issues
- Permission errors: Check Tauri allowlist configuration
- File access errors: Verify path configurations
- MCP connection issues: Check server configuration and credentials

## Support Resources
- Tauri Docs: https://tauri.app/docs/
- React Docs: https://react.dev/
- MCP Specification: https://github.com/modelcontextprotocol/servers
- TypeScript Docs: https://www.typescriptlang.org/docs/
- Security Guidelines: https://tauri.app/v1/guides/security/security