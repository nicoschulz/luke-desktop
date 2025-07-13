use std::fs;
use std::path::{Path, PathBuf};
use directories::ProjectDirs;
use serde_json;
use uuid::Uuid;
use thiserror::Error; // ← Wichtig für Fehlerbehandlung

use super::types::{MCPConfig, MCPServer};

#[derive(Debug, Error)] // ← Fehler-Enum mit automatischer Display-Implementierung
pub enum ConfigError {
    #[error("Fehler beim Erstellen des Konfigurationsordners: {0}")]
    CreateDir(#[from] std::io::Error),

    #[error("Fehler beim (De-)Serialisieren der Konfiguration: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("Konfigurationsordner konnte nicht ermittelt werden")]
    ConfigDir,

    #[error("Server nicht gefunden: {0}")]
    ServerNotFound(String),
}

pub struct ConfigManager {
    config_path: PathBuf,
    config: MCPConfig,
}

impl ConfigManager {
    pub fn new() -> Result<Self, ConfigError> {
        let config_path = Self::get_config_path()?;
        let config = Self::load_or_create_config(&config_path)?;

        Ok(Self {
            config_path,
            config,
        })
    }

    fn get_config_path() -> Result<PathBuf, ConfigError> {
        let proj_dirs = ProjectDirs::from("com", "lukedesktop", "LukeDesktop")
            .ok_or(ConfigError::ConfigDir)?;

        let config_dir = proj_dirs.config_dir();
        fs::create_dir_all(config_dir).map_err(ConfigError::CreateDir)?;

        Ok(config_dir.join("mcp.json"))
    }

    fn load_or_create_config(path: &Path) -> Result<MCPConfig, ConfigError> {
        if path.exists() {
            let content = fs::read_to_string(path).map_err(ConfigError::CreateDir)?;
            serde_json::from_str(&content).map_err(ConfigError::Serialization)
        } else {
            let config = MCPConfig::default();
            let content = serde_json::to_string_pretty(&config).map_err(ConfigError::Serialization)?;
            fs::write(path, content).map_err(ConfigError::CreateDir)?;
            Ok(config)
        }
    }

    pub fn save(&self) -> Result<(), ConfigError> {
        let content = serde_json::to_string_pretty(&self.config).map_err(ConfigError::Serialization)?;
        fs::write(&self.config_path, content).map_err(ConfigError::CreateDir)
    }

    pub fn add_server(&mut self, server: MCPServer) -> Result<MCPServer, ConfigError> {
        let mut new_server = server;
        new_server.id = Uuid::new_v4().to_string();

        self.config.servers.push(new_server.clone());

        if self.config.default_server.is_none() {
            self.config.default_server = Some(new_server.id.clone());
        }

        self.save()?;
        Ok(new_server)
    }

    pub fn remove_server(&mut self, id: &str) -> Result<(), ConfigError> {
        let pos = self.config.servers
            .iter()
            .position(|s| s.id == id)
            .ok_or_else(|| ConfigError::ServerNotFound(id.to_string()))?;

        self.config.servers.remove(pos);

        if let Some(default_id) = &self.config.default_server {
            if default_id == id {
                self.config.default_server = self.config.servers.first().map(|s| s.id.clone());
            }
        }

        self.save()?;
        Ok(())
    }

    pub fn update_server(&mut self, server: MCPServer) -> Result<(), ConfigError> {
        let pos = self.config.servers
            .iter()
            .position(|s| s.id == server.id)
            .ok_or_else(|| ConfigError::ServerNotFound(server.id.clone()))?;

        self.config.servers[pos] = server;
        self.save()?;
        Ok(())
    }

    pub fn get_server(&self, id: &str) -> Option<&MCPServer> {
        self.config.servers.iter().find(|s| s.id == id)
    }

    pub fn get_servers(&self) -> &[MCPServer] {
        &self.config.servers
    }

    pub fn get_default_server(&self) -> Option<&MCPServer> {
        self.config.default_server
            .as_ref()
            .and_then(|id| self.get_server(id))
    }

    pub fn set_default_server(&mut self, id: &str) -> Result<(), ConfigError> {
        if !self.config.servers.iter().any(|s| s.id == id) {
            return Err(ConfigError::ServerNotFound(id.to_string()));
        }

        self.config.default_server = Some(id.to_string());
        self.save()?;
        Ok(())
    }
}
