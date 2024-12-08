use tauri::State;
use std::sync::Mutex;
use super::config::{ConfigManager, ConfigError};
use super::types::{MCPServer};

#[tauri::command]
pub async fn get_mcp_servers(
    config: State<'_, Mutex<ConfigManager>>
) -> Result<Vec<MCPServer>, String> {
    let config = config.lock().map_err(|e| e.to_string())?;
    Ok(config.get_servers().to_vec())
}

#[tauri::command]
pub async fn get_mcp_server(
    id: String,
    config: State<'_, Mutex<ConfigManager>>
) -> Result<Option<MCPServer>, String> {
    let config = config.lock().map_err(|e| e.to_string())?;
    Ok(config.get_server(&id).cloned())
}

#[tauri::command]
pub async fn add_mcp_server(
    server: MCPServer,
    config: State<'_, Mutex<ConfigManager>>
) -> Result<MCPServer, String> {
    let mut config = config.lock().map_err(|e| e.to_string())?;
    config.add_server(server).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_mcp_server(
    server: MCPServer,
    config: State<'_, Mutex<ConfigManager>>
) -> Result<(), String> {
    let mut config = config.lock().map_err(|e| e.to_string())?;
    config.update_server(server).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn remove_mcp_server(
    id: String,
    config: State<'_, Mutex<ConfigManager>>
) -> Result<(), String> {
    let mut config = config.lock().map_err(|e| e.to_string())?;
    config.remove_server(&id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_default_mcp_server(
    config: State<'_, Mutex<ConfigManager>>
) -> Result<Option<MCPServer>, String> {
    let config = config.lock().map_err(|e| e.to_string())?;
    Ok(config.get_default_server().cloned())
}

#[tauri::command]
pub async fn set_default_mcp_server(
    id: String,
    config: State<'_, Mutex<ConfigManager>>
) -> Result<(), String> {
    let mut config = config.lock().map_err(|e| e.to_string())?;
    config.set_default_server(&id).map_err(|e| e.to_string())
}