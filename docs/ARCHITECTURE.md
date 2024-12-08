# Luke Desktop Architecture

## Overview
Luke Desktop is built using Tauri 2.1.0, React, and TypeScript, following a modular architecture with clear separation of concerns:

### Frontend (React + TypeScript)
- Components: Reusable UI components
- Hooks: Custom React hooks for shared logic
- Context: Global state management
- Utils: Helper functions and utilities

### Backend (Tauri + Rust)
- Commands: Tauri command handlers
- Services: Business logic implementations
- Models: Data structures and types
- Config: Application configuration

### MCP Integration
- Server Management
- Connection Handling
- Request/Response Processing

## Security Architecture
- Process Isolation
- Permission System
- Secure IPC
- File System Security