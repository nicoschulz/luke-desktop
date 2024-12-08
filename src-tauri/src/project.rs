use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::api::path::data_dir;

#[derive(Debug, Serialize, Deserialize)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub created: String,
    pub updated: String,
    pub tags: Option<Vec<String>>,
    pub settings: ProjectSettings,
    pub metadata: ProjectMetadata,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectSettings {
    pub default_model: Option<String>,
    pub temperature: Option<f32>,
    pub max_tokens: Option<u32>,
    pub default_server: Option<String>,
    pub system_prompt: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectMetadata {
    pub message_count: u32,
    pub attachment_count: u32,
    pub total_tokens: u32,
    pub last_message_date: Option<String>,
}

pub fn get_projects_dir() -> PathBuf {
    let mut path = data_dir().expect("Failed to get data directory");
    path.push("LukeDesktop");
    path.push("projects");
    path
}

#[tauri::command]
pub fn list_project_directories() -> Result<Vec<String>, String> {
    let projects_dir = get_projects_dir();
    
    if !projects_dir.exists() {
        fs::create_dir_all(&projects_dir).map_err(|e| e.to_string())?;
    }

    let entries = fs::read_dir(&projects_dir)
        .map_err(|e| e.to_string())?
        .filter_map(|entry| {
            let entry = entry.ok()?;
            let path = entry.path();
            if path.is_dir() {
                path.file_name()?.to_str().map(String::from)
            } else {
                None
            }
        })
        .collect();

    Ok(entries)
}

#[tauri::command]
pub fn ensure_project_directory(project_id: &str) -> Result<(), String> {
    let mut path = get_projects_dir();
    path.push(project_id);
    
    if !path.exists() {
        fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    }

    let mut attachments_path = path.clone();
    attachments_path.push("attachments");
    if !attachments_path.exists() {
        fs::create_dir_all(&attachments_path).map_err(|e| e.to_string())?;
    }

    Ok(())
}