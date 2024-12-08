use tauri::Manager;
use window_vibrancy::{apply_blur, apply_vibrancy, NSVisualEffectMaterial};

mod mcp;

use std::sync::Mutex;
use mcp::config::ConfigManager;
use mcp::commands::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(target_os = "macos")]
            {
                let window = app.get_window("main").unwrap();
                apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None)
                    .expect("Failed to apply vibrancy");
            }

            #[cfg(target_os = "windows")]
            {
                let window = app.get_window("main").unwrap();
                apply_blur(&window, Some((18, 18, 18, 125)))
                    .expect("Failed to apply blur");
            }

            Ok(())
        })
        .manage(Mutex::new(ConfigManager::new().expect("Failed to initialize config manager")))
        .invoke_handler(tauri::generate_handler![
            get_mcp_servers,
            get_mcp_server,
            add_mcp_server,
            update_mcp_server,
            remove_mcp_server,
            get_default_mcp_server,
            set_default_mcp_server,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}