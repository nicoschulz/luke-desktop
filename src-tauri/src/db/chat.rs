use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatSession {
    pub id: Option<i64>,
    pub title: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub project_id: Option<i64>,
    pub is_archived: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatMessage {
    pub id: Option<i64>,
    pub session_id: i64,
    pub role: String,
    pub content: String,
    pub created_at: DateTime<Utc>,
    pub metadata: Option<String>,
}

#[tauri::command]
pub async fn create_chat_session(title: String, project_id: Option<i64>) -> Result<ChatSession, String> {
    let conn = Connection::open("chat.db").map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare(
        "INSERT INTO chat_sessions (title, project_id) VALUES (?, ?) RETURNING *"
    ).map_err(|e| e.to_string())?;
    
    stmt.query_row(params![title, project_id], |row| {
        Ok(ChatSession {
            id: row.get(0)?,
            title: row.get(1)?,
            created_at: row.get(2)?,
            updated_at: row.get(3)?,
            project_id: row.get(4)?,
            is_archived: row.get(5)?,
        })
    }).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_chat_sessions(project_id: Option<i64>) -> Result<Vec<ChatSession>, String> {
    let conn = Connection::open("chat.db").map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare(
        "SELECT * FROM chat_sessions WHERE project_id = ? OR project_id IS NULL ORDER BY updated_at DESC"
    ).map_err(|e| e.to_string())?;
    
    let sessions = stmt.query_map(params![project_id], |row| {
        Ok(ChatSession {
            id: row.get(0)?,
            title: row.get(1)?,
            created_at: row.get(2)?,
            updated_at: row.get(3)?,
            project_id: row.get(4)?,
            is_archived: row.get(5)?,
        })
    }).map_err(|e| e.to_string())?;
    
    sessions.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn add_chat_message(
    session_id: i64,
    role: String,
    content: String,
    metadata: Option<String>,
) -> Result<ChatMessage, String> {
    let conn = Connection::open("chat.db").map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare(
        "INSERT INTO chat_messages (session_id, role, content, metadata) VALUES (?, ?, ?, ?) RETURNING *"
    ).map_err(|e| e.to_string())?;
    
    stmt.query_row(params![session_id, role, content, metadata], |row| {
        Ok(ChatMessage {
            id: row.get(0)?,
            session_id: row.get(1)?,
            role: row.get(2)?,
            content: row.get(3)?,
            created_at: row.get(4)?,
            metadata: row.get(5)?,
        })
    }).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_chat_messages(session_id: i64) -> Result<Vec<ChatMessage>, String> {
    let conn = Connection::open("chat.db").map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare(
        "SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC"
    ).map_err(|e| e.to_string())?;
    
    let messages = stmt.query_map(params![session_id], |row| {
        Ok(ChatMessage {
            id: row.get(0)?,
            session_id: row.get(1)?,
            role: row.get(2)?,
            content: row.get(3)?,
            created_at: row.get(4)?,
            metadata: row.get(5)?,
        })
    }).map_err(|e| e.to_string())?;
    
    messages.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn archive_chat_session(session_id: i64) -> Result<(), String> {
    let conn = Connection::open("chat.db").map_err(|e| e.to_string())?;
    
    conn.execute(
        "UPDATE chat_sessions SET is_archived = TRUE WHERE id = ?",
        params![session_id],
    ).map_err(|e| e.to_string())?;
    
    Ok(())
}