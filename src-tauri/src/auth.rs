use argon2::{self, Config};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct User {
    id: String,
    username: String,
    #[serde(skip_serializing)]
    password_hash: String,
    created_at: i64,
    last_login: Option<i64>,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct Session {
    token: String,
    user_id: String,
    created_at: i64,
    expires_at: i64,
}

#[derive(Clone)]
pub struct AuthService {
    users: Arc<RwLock<Vec<User>>>,
    sessions: Arc<RwLock<Vec<Session>>>,
}

impl AuthService {
    pub fn new() -> Self {
        AuthService {
            users: Arc::new(RwLock::new(Vec::new())),
            sessions: Arc::new(RwLock::new(Vec::new())),
        }
    }

    pub async fn register(&self, username: String, password: String) -> Result<User, String> {
        let users = self.users.read().await;
        if users.iter().any(|u| u.username == username) {
            return Err("Username already exists".to_string());
        }
        drop(users);

        let salt = Uuid::new_v4().to_string();
        let config = Config::default();
        let hash = argon2::hash_encoded(password.as_bytes(), salt.as_bytes(), &config)
            .map_err(|e| format!("Failed to hash password: {}", e))?;

        let user = User {
            id: Uuid::new_v4().to_string(),
            username,
            password_hash: hash,
            created_at: chrono::Utc::now().timestamp(),
            last_login: None,
        };

        let mut users = self.users.write().await;
        users.push(user.clone());

        Ok(user)
    }

    pub async fn login(&self, username: String, password: String) -> Result<Session, String> {
        let users = self.users.read().await;
        let user = users
            .iter()
            .find(|u| u.username == username)
            .ok_or("Invalid username or password")?;

        if !argon2::verify_encoded(&user.password_hash, password.as_bytes())
            .map_err(|e| format!("Failed to verify password: {}", e))? {
            return Err("Invalid username or password".to_string());
        }

        let session = Session {
            token: Uuid::new_v4().to_string(),
            user_id: user.id.clone(),
            created_at: chrono::Utc::now().timestamp(),
            expires_at: chrono::Utc::now().timestamp() + (24 * 60 * 60), // 24 hours
        };

        let mut sessions = self.sessions.write().await;
        sessions.push(session.clone());

        // Update last login
        drop(users);
        let mut users = self.users.write().await;
        if let Some(user) = users.iter_mut().find(|u| u.username == username) {
            user.last_login = Some(chrono::Utc::now().timestamp());
        }

        Ok(session)
    }

    pub async fn validate_session(&self, token: String) -> Result<User, String> {
        let sessions = self.sessions.read().await;
        let session = sessions
            .iter()
            .find(|s| s.token == token)
            .ok_or("Invalid session")?;

        if session.expires_at < chrono::Utc::now().timestamp() {
            return Err("Session expired".to_string());
        }

        let users = self.users.read().await;
        let user = users
            .iter()
            .find(|u| u.id == session.user_id)
            .ok_or("User not found")?;

        Ok(user.clone())
    }

    pub async fn logout(&self, token: String) -> Result<(), String> {
        let mut sessions = self.sessions.write().await;
        sessions.retain(|s| s.token != token);
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_register_and_login() {
        let auth = AuthService::new();
        
        // Test registration
        let username = "testuser".to_string();
        let password = "testpass123".to_string();
        
        let user = auth.register(username.clone(), password.clone()).await.unwrap();
        assert_eq!(user.username, username);
        
        // Test login
        let session = auth.login(username, password).await.unwrap();
        assert!(!session.token.is_empty());
        
        // Test session validation
        let validated_user = auth.validate_session(session.token.clone()).await.unwrap();
        assert_eq!(validated_user.id, user.id);
        
        // Test logout
        auth.logout(session.token).await.unwrap();
    }
}
