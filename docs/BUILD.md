# Luke Desktop Build Guide

## Build Configuration for Tauri 2.x

### Prerequisites
- Node.js v22.11.0+
- Rust v1.83.0+
- Cargo v1.83.0+
- Operating System Requirements:
  - Windows: Windows 7 or later, VS 2019+ build tools
  - macOS: 10.15 or later, Xcode command line tools
  - Linux: libwebkit2gtk, libgtk-3, libayatana-appindicator3

### Development Build

1. **Initialize Development Environment**
   ```bash
   npm install
   npm run tauri dev
   ```

2. **Development Server Configuration**
   ```javascript
   // vite.config.ts
   export default defineConfig({
     plugins: [react()],
     server: {
       port: 1420,
       strictPort: true,
       watch: {
         ignored: ['**/src-tauri/**']
       }
     },
     build: {
       target: ['es2021', 'chrome100', 'safari13'],
       minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
       sourcemap: !!process.env.TAURI_DEBUG
     }
   });
   ```

### Production Build Pipeline

1. **Asset Optimization**
   - Image optimization with `vite-imagetools`
   - CSS/JS minification with esbuild
   - Tree shaking for unused code
   ```javascript
   // vite.config.ts additions
   build: {
     rollupOptions: {
       output: {
         manualChunks: {
           'react-vendor': ['react', 'react-dom'],
           'ui-vendor': ['lucide-react', 'class-variance-authority']
         }
       }
     }
   }
   ```

2. **Build Commands**
   ```json
   {
     "scripts": {
       "build": "npm run build:fe && npm run build:tauri",
       "build:fe": "tsc && vite build",
       "build:tauri": "tauri build",
       "build:debug": "tauri build --debug"
     }
   }
   ```

3. **Tauri Build Configuration**
   ```json
   // src-tauri/tauri.conf.json
   {
     "build": {
       "beforeBuildCommand": "npm run build:fe",
       "beforeDevCommand": "npm run dev",
       "devPath": "http://localhost:1420",
       "distDir": "../dist"
     },
     "bundle": {
       "active": true,
       "targets": ["nsis", "msi", "app", "dmg", "deb"],
       "identifier": "com.lukedesktop.dev",
       "icon": ["icons/32x32.png", "icons/128x128.png", "icons/128x128@2x.png"],
       "resources": ["resources/*"],
       "windows": {
         "certificateThumbprint": null,
         "digestAlgorithm": "sha256",
         "timestampUrl": "",
         "webviewInstallMode": {
           "type": "downloadBootstrapper"
         }
       }
     }
   }
   ```

### Cross-Platform Packaging

1. **Windows (NSIS & MSI)**
   ```json
   {
     "tauri": {
       "bundle": {
         "windows": {
           "nsis": {
             "installMode": "perMachine",
             "languages": ["en-US"],
             "displayLanguageSelector": false
           },
           "msi": {
             "upgradeCode": "your-upgrade-code",
             "productCode": "your-product-code"
           }
         }
       }
     }
   }
   ```

2. **macOS (DMG)**
   ```json
   {
     "tauri": {
       "bundle": {
         "macOS": {
           "frameworks": [],
           "minimumSystemVersion": "10.15",
           "signing": {
             "identity": null,
             "certificate-file": null,
             "certificate-password": null
           },
           "dmg": {
             "window": {
               "width": 540,
               "height": 380
             }
           }
         }
       }
     }
   }
   ```

3. **Linux (AppImage & Debian)**
   ```json
   {
     "tauri": {
       "bundle": {
         "linux": {
           "deb": {
             "depends": ["libwebkit2gtk-4.0-37", "libgtk-3-0"],
             "files": {
               "/usr/share/applications/com.lukedesktop.dev.desktop": "assets/linux/app.desktop"
             }
           },
           "appimage": {
             "bundleMediaFramework": true
           }
         }
       }
     }
   }
   ```

### Auto-Update System

1. **Update Configuration**
   ```json
   {
     "tauri": {
       "updater": {
         "active": true,
         "dialog": true,
         "pubkey": "your-public-key",
         "endpoints": [
           "https://releases.yourdomain.com/{{target}}/{{current_version}}"
         ]
       }
     }
   }
   ```

2. **Update Server Implementation**
   ```typescript
   import { checkUpdate, installUpdate } from '@tauri-apps/api/updater';
   
   async function checkForUpdates() {
     try {
       const update = await checkUpdate();
       if (update.available) {
         await installUpdate();
       }
     } catch (error) {
       console.error('Error checking for updates:', error);
     }
   }
   ```

### Build Pipeline Optimization

1. **Memory Management**
   ```json
   {
     "tauri": {
       "bundle": {
         "resources": {
           "memoryOptimization": true,
           "compressionLevel": "best"
         }
       }
     }
   }
   ```

2. **Performance Optimization**
   - Enable code splitting
   - Implement lazy loading for routes
   - Optimize asset loading
   - Configure service worker for caching

### Security Considerations

1. **CSP Configuration**
   ```json
   {
     "tauri": {
       "security": {
         "csp": "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'"
       }
     }
   }
   ```

2. **File System Security**
   ```json
   {
     "tauri": {
       "allowlist": {
         "fs": {
           "scope": ["$APPDATA/*", "$RESOURCE/*"],
           "all": false
         }
       }
     }
   }
   ```

### Debugging and Profiling

1. **Debug Build**
   ```bash
   npm run tauri build -- --debug
   ```

2. **Performance Profiling**
   - Enable Chrome DevTools in development
   - Use Rust profiling tools
   - Monitor memory usage and leaks

### CI/CD Integration

1. **GitHub Actions Workflow**
   ```yaml
   name: Build
   on: [push, pull_request]
   
   jobs:
     build:
       runs-on: ${{ matrix.os }}
       strategy:
         matrix:
           os: [ubuntu-latest, windows-latest, macos-latest]
           
       steps:
         - uses: actions/checkout@v2
         - name: Setup Node.js
           uses: actions/setup-node@v2
           with:
             node-version: '22.x'
         - name: Install Rust
           uses: actions-rs/toolchain@v1
           with:
             toolchain: stable
         - name: Install dependencies
           run: npm install
         - name: Build
           run: npm run build
   ```

Remember to replace placeholder values (upgrade codes, product codes, public keys, etc.) with your actual values before building for production.