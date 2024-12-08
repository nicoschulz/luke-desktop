use std::path::{Path, PathBuf};
use tauri::{command, Runtime};
use serde::{Serialize, Deserialize};
use tokio::fs;
use uuid::Uuid;
use std::error::Error;
use flate2::Compression;
use flate2::write::{GzEncoder, GzDecoder};
use std::io::prelude::*;
use tokio::io::AsyncReadExt;

#[derive(Debug, Serialize, Deserialize)]
pub struct FileMetadata {
    id: String,
    name: String,
    size: u64,
    compressed_size: u64,
    mime_type: String,
    created_at: i64,
    project_id: String,
    chat_id: Option<String>,
    is_compressed: bool,
}

#[derive(Debug, Serialize)]
pub struct AttachmentError {
    kind: String,
    message: String,
}

const MAX_FILE_SIZE: u64 = 100 * 1024 * 1024; // 100MB
const COMPRESSION_THRESHOLD: u64 = 1024 * 1024; // 1MB
const ALLOWED_MIME_TYPES: [&str; 6] = [
    "text/plain",
    "text/markdown",
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/gif",
];

async fn compress_file(file_data: &[u8]) -> std::io::Result<Vec<u8>> {
    let mut encoder = GzEncoder::new(Vec::new(), Compression::best());
    encoder.write_all(file_data)?;
    encoder.finish()
}

async fn decompress_file(compressed_data: &[u8]) -> std::io::Result<Vec<u8>> {
    let mut decoder = GzDecoder::new(Vec::new());
    decoder.write_all(compressed_data)?;
    decoder.finish()
}

#[command(guard = "fs_scope_check")]
pub async fn save_attachment<R: Runtime>(
    app: tauri::AppHandle<R>,
    project_id: String,
    chat_id: Option<String>,
    file_path: String,
    mime_type: String,
) -> Result<FileMetadata, AttachmentError> {
    // Validate mime type
    if !ALLOWED_MIME_TYPES.contains(&mime_type.as_str()) {
        return Err(AttachmentError {
            kind: "invalid_mime_type".to_string(),
            message: "Unsupported file type".to_string(),
        });
    }

    let source_path = Path::new(&file_path);
    
    // Read file metadata
    let metadata = fs::metadata(&source_path).await.map_err(|e| AttachmentError {
        kind: "read_error".to_string(),
        message: e.to_string(),
    })?;
    
    if metadata.len() > MAX_FILE_SIZE {
        return Err(AttachmentError {
            kind: "file_too_large".to_string(),
            message: format!("File size exceeds maximum limit of {}MB", MAX_FILE_SIZE / 1024 / 1024),
        });
    }

    // Generate unique file ID
    let file_id = Uuid::new_v4().to_string();
    
    // Create attachment directory using app's resource path
    let app_dir = app.path().app_data_dir().ok_or(AttachmentError {
        kind: "path_error".to_string(),
        message: "Could not get app data directory".to_string(),
    })?;
    
    let attachment_dir = app_dir
        .join("projects")
        .join(&project_id)
        .join("attachments");
    
    fs::create_dir_all(&attachment_dir).await.map_err(|e| AttachmentError {
        kind: "create_dir_error".to_string(),
        message: e.to_string(),
    })?;

    // Read file content
    let mut file_content = Vec::new();
    let mut file = fs::File::open(&source_path).await.map_err(|e| AttachmentError {
        kind: "read_error".to_string(),
        message: e.to_string(),
    })?;
    file.read_to_end(&mut file_content).await.map_err(|e| AttachmentError {
        kind: "read_error".to_string(),
        message: e.to_string(),
    })?;

    // Determine if compression should be applied
    let (final_content, is_compressed) = if metadata.len() > COMPRESSION_THRESHOLD {
        match compress_file(&file_content).await {
            Ok(compressed) => (compressed, true),
            Err(_) => (file_content, false),
        }
    } else {
        (file_content, false)
    };

    // Save file
    let dest_path = attachment_dir.join(&file_id);
    fs::write(&dest_path, &final_content).await.map_err(|e| AttachmentError {
        kind: "write_error".to_string(),
        message: e.to_string(),
    })?;

    let compressed_size = final_content.len() as u64;

    let file_metadata = FileMetadata {
        id: file_id,
        name: source_path.file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .into_owned(),
        size: metadata.len(),
        compressed_size,
        mime_type,
        created_at: chrono::Utc::now().timestamp(),
        project_id,
        chat_id,
        is_compressed,
    };

    Ok(file_metadata)
}

#[command(guard = "fs_scope_check")]
pub async fn get_attachment<R: Runtime>(
    app: tauri::AppHandle<R>,
    project_id: String,
    file_id: String,
) -> Result<Vec<u8>, AttachmentError> {
    let app_dir = app.path().app_data_dir().ok_or(AttachmentError {
        kind: "path_error".to_string(),
        message: "Could not get app data directory".to_string(),
    })?;
    
    let file_path = app_dir
        .join("projects")
        .join(&project_id)
        .join("attachments")
        .join(&file_id);

    if !file_path.exists() {
        return Err(AttachmentError {
            kind: "not_found".to_string(),
            message: "Attachment not found".to_string(),
        });
    }

    let content = fs::read(&file_path).await.map_err(|e| AttachmentError {
        kind: "read_error".to_string(),
        message: e.to_string(),
    })?;

    // Check if file is compressed (by reading first bytes)
    if content.starts_with(&[0x1f, 0x8b]) {
        // File is gzipped
        match decompress_file(&content).await {
            Ok(decompressed) => Ok(decompressed),
            Err(e) => Err(AttachmentError {
                kind: "decompress_error".to_string(),
                message: e.to_string(),
            }),
        }
    } else {
        Ok(content)
    }
}

#[command(guard = "fs_scope_check")]
pub async fn delete_attachment<R: Runtime>(
    app: tauri::AppHandle<R>,
    project_id: String,
    file_id: String,
) -> Result<(), AttachmentError> {
    let app_dir = app.path().app_data_dir().ok_or(AttachmentError {
        kind: "path_error".to_string(),
        message: "Could not get app data directory".to_string(),
    })?;
    
    let file_path = app_dir
        .join("projects")
        .join(&project_id)
        .join("attachments")
        .join(&file_id);

    if !file_path.exists() {
        return Err(AttachmentError {
            kind: "not_found".to_string(),
            message: "Attachment not found".to_string(),
        });
    }

    fs::remove_file(&file_path).await.map_err(|e| AttachmentError {
        kind: "delete_error".to_string(),
        message: e.to_string(),
    })?;

    Ok(())
}

// Permission guard for file system operations
fn fs_scope_check<R: Runtime>(
    app: &tauri::AppHandle<R>, 
    cmd: &tauri::command::CommandItem,
) -> Result<(), tauri::Error> {
    // Check if the command has the necessary fs:default permission
    if cmd.message.permissions().contains(&"fs:default".parse().unwrap()) {
        Ok(())
    } else {
        Err(tauri::Error::PermissionDenied)
    }
}
