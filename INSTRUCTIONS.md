# Luke Desktop Development Instructions

## Development Setup

### Prerequisites
1. Install Node.js (v22.11.0+)
2. Install Rust (v1.83.0+)
3. Install Cargo (v1.83.0+)
4. Install libmagic (for file type validation)
   - Windows: Available through MSYS2
   - macOS: `brew install libmagic`
   - Linux: `apt-get install libmagic-dev`

### Tauri 2.x Setup
The project uses Tauri v2.1.0, which includes significant security improvements and new features:

1. **Permissions System**
   ```json
   {
     "tauri": {
       "security": {
         "capabilities": {
           "default-window-capabilities": {
             "permissions": [
               "core:default",
               "fs:default",
               "window:default",
               "app:default",
               "shell:allow-open"
             ]
           }
         }
       }
     }
   }
   ```

2. **File System Security**
   ```rust
   #[command(guard = "fs_scope_check")]
   pub async fn save_attachment<R: Runtime>(
       app: AppHandle<R>,
       file_path: String,
   ) -> Result<(), String> {
       // Implementation with path validation
   }
   ```

3. **Permission Guards**
   ```rust
   fn fs_scope_check<R: Runtime>(
       app: &AppHandle<R>, 
       cmd: &tauri::command::CommandItem,
   ) -> Result<(), tauri::Error> {
       if cmd.message.permissions().contains(&"fs:default".parse().unwrap()) {
           Ok(())
       } else {
           Err(tauri::Error::PermissionDenied)
       }
   }
   ```

### Initial Setup
1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run tauri dev` to start development server