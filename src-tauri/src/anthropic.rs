use serde::{Deserialize, Serialize};
use tauri::State;
use std::sync::Mutex;
use keyring::Entry;
use anyhow::{Result, anyhow};

const SERVICE_NAME: &str = "luke-desktop";
const ACCOUNT_NAME: &str = "anthropic-api-key";

#[derive(Debug, Serialize, Deserialize)]
pub struct AnthropicConfig {
    api_key: Option<String>,
}

pub struct AnthropicState(pub Mutex<AnthropicConfig>);

impl Default for AnthropicState {
    fn default() -> Self {
        Self(Mutex::new(AnthropicConfig { api_key: None }))
    }
}

#[tauri::command]
pub async fn set_api_key(api_key: String, state: State<'_, AnthropicState>) -> Result<(), String> {
    let keyring = Entry::new(SERVICE_NAME, ACCOUNT_NAME)
        .map_err(|e| format!("Failed to access keyring: {}", e))?;

    keyring.set_password(&api_key)
        .map_err(|e| format!("Failed to store API key: {}", e))?;

    let mut config = state.0.lock()
        .map_err(|e| format!("Failed to acquire lock: {}", e))?;
    
    config.api_key = Some(api_key);
    Ok(())
}

#[tauri::command]
pub async fn get_api_key(state: State<'_, AnthropicState>) -> Result<Option<String>, String> {
    let mut config = state.0.lock()
        .map_err(|e| format!("Failed to acquire lock: {}", e))?;

    if let Some(api_key) = &config.api_key {
        return Ok(Some(api_key.clone()));
    }

    let keyring = Entry::new(SERVICE_NAME, ACCOUNT_NAME)
        .map_err(|e| format!("Failed to access keyring: {}", e))?;

    match keyring.get_password() {
        Ok(api_key) => {
            config.api_key = Some(api_key.clone());
            Ok(Some(api_key))
        }
        Err(_) => Ok(None),
    }
}

#[tauri::command]
pub async fn delete_api_key(state: State<'_, AnthropicState>) -> Result<(), String> {
    let keyring = Entry::new(SERVICE_NAME, ACCOUNT_NAME)
        .map_err(|e| format!("Failed to access keyring: {}", e))?;

    keyring.delete_password()
        .map_err(|e| format!("Failed to delete API key: {}", e))?;

    let mut config = state.0.lock()
        .map_err(|e| format!("Failed to acquire lock: {}", e))?;
    
    config.api_key = None;
    Ok(())
}