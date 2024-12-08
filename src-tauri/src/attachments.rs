use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Runtime, command};
use uuid::Uuid;
use path_clean::PathClean;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileMetadata {
    pub id: String,
    pub name: String,
    pub size: u64,
    pub compressed_size: Option<u64>,
    pub mime_type: String,
    pub created_at: u64,
    pub project_id: Option<String>,
    pub chat_id: Option<String>,
    pub is_compressed: bool,
}

// Permission guard for attachment operations
fn attachment_guard<R: Runtime>(
    app: &AppHandle<R>,
    cmd: &tauri::command::CommandItem,
) -> Result<(), tauri::Error> {
    if cmd.message.permissions().contains(&"fs:default".parse().unwrap()) {
        Ok(())
    } else {
        Err(tauri::Error::PermissionDenied)
    }
}

#[command(guard = "attachment_guard")]
pub async fn save_attachment<R: Runtime>(
    app: AppHandle<R>,
    file_path: String,
    mime_type: String,
    project_id: Option<String>,
    chat_id: Option<String>,
) -> Result<FileMetadata, String> {
    let file_id = Uuid::new_v4().to_string();
    let source_path = PathBuf::from(&file_path).clean();
    let file_name = source_path
        .file_name()
        .ok_or("Invalid file name")?
        .to_string_lossy()
        .into_owned();

    let app_dir = app
        .path()
        .app_data_dir()
        .ok_or("Could not resolve app data directory")?;
    let attachments_dir = app_dir.join("attachments").clean();
    fs::create_dir_all(&attachments_dir).map_err(|e| e.to_string())?;

    // Ensure the destination path is within the attachments directory
    let dest_path = attachments_dir.join(&file_id).clean();
    if !dest_path.starts_with(&attachments_dir) {
        return Err("Invalid destination path".to_string());
    }

    fs::copy(&source_path, &dest_path).map_err(|e| e.to_string())?;

    let metadata = fs::metadata(&dest_path).map_err(|e| e.to_string())?;
    let file_metadata = FileMetadata {
        id: file_id,
        name: file_name,
        size: metadata.len(),
        compressed_size: None,
        mime_type,
        created_at: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs(),
        project_id,
        chat_id,
        is_compressed: false,
    };

    Ok(file_metadata)
}

#[command(guard = "attachment_guard")]
pub async fn get_attachment<R: Runtime>(
    app: AppHandle<R>,
    file_id: String,
) -> Result<Vec<u8>, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .ok_or("Could not resolve app data directory")?;
        
    // Ensure the file path is within the attachments directory
    let attachments_dir = app_dir.join("attachments").clean();
    let file_path = attachments_dir.join(&file_id).clean();
    if !file_path.starts_with(&attachments_dir) {
        return Err("Invalid file path".to_string());
    }

    fs::read(&file_path).map_err(|e| e.to_string())
}

#[command(guard = "attachment_guard")]
pub async fn delete_attachment<R: Runtime>(
    app: AppHandle<R>,
    file_id: String,
) -> Result<(), String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .ok_or("Could not resolve app data directory")?;
        
    // Ensure the file path is within the attachments directory
    let attachments_dir = app_dir.join("attachments").clean();
    let file_path = attachments_dir.join(&file_id).clean();
    if !file_path.starts_with(&attachments_dir) {
        return Err("Invalid file path".to_string());
    }

    fs::remove_file(&file_path).map_err(|e| e.to_string())?;
    Ok(())
}

#[command]
pub async fn get_conversation_attachments<R: Runtime>(
    app: AppHandle<R>,
    conversation_id: String,
) -> Result<Vec<FileMetadata>, String> {
    // TODO: Implement database query to get attachments for conversation
    Ok(Vec::new())
}

#[command]
pub async fn add_conversation_attachment<R: Runtime>(
    conversation_id: String,
    attachment_id: String,
) -> Result<(), String> {
    // TODO: Implement database update to add attachment to conversation
    Ok(())
}

#[command]
pub async fn remove_conversation_attachment<R: Runtime>(
    conversation_id: String,
    attachment_id: String,
) -> Result<(), String> {
    // TODO: Implement database update to remove attachment from conversation
    Ok(())
}