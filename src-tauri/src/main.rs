#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod auth;
use auth::AuthService;
use std::sync::Arc;
use tauri::{State, Builder};
use tauri_plugin_shell::init;

struct AppState {
    auth: Arc<AuthService>,
}

#[tauri::command]
async fn register(
    state: State<'_, AppState>,
    username: String,
    password: String,
) -> Result<auth::User, String> {
    state.auth.register(username, password).await
}

#[tauri::command]
async fn login(
    state: State<'_, AppState>,
    username: String,
    password: String,
) -> Result<auth::Session, String> {
    state.auth.login(username, password).await
}

#[tauri::command]
async fn validate_session(
    state: State<'_, AppState>,
    token: String,
) -> Result<auth::User, String> {
    state.auth.validate_session(token).await
}

#[tauri::command]
async fn logout(state: State<'_, AppState>, token: String) -> Result<(), String> {
    state.auth.logout(token).await
}

fn main() {
    let auth_service = Arc::new(AuthService::new());

    Builder::default()
        .plugin(init()) // ← Shell-Plugin korrekt eingebunden
        .manage(AppState {
            auth: auth_service,
        })
        .invoke_handler(tauri::generate_handler![
            register,
            login,
            validate_session,
            logout,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
