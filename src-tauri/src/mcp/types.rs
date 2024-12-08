use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MCPServer {
    pub id: String,
    pub name: String,
    pub url: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub token: Option<String>,
    pub is_active: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub last_connected: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MCPConfig {
    pub version: String,
    pub default_server: Option<String>,
    pub servers: Vec<MCPServer>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MCPError {
    pub code: String,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub details: Option<HashMap<String, serde_json::Value>>,
}

impl Default for MCPConfig {
    fn default() -> Self {
        Self {
            version: "1.0".to_string(),
            default_server: None,
            servers: Vec::new(),
        }
    }
}