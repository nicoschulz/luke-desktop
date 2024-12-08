import { v4 as uuidv4 } from 'uuid';
import { invoke } from '@tauri-apps/api/tauri';
import { createDir, readTextFile, writeTextFile, removeDir } from '@tauri-apps/api/fs';
import type { Project, ProjectSettings, ProjectError, ChatMessage, Attachment } from './types';

export class ProjectManager {
  private projectsDir: string = 'data/projects';

  async createProject(name: string, description?: string, settings?: Partial<ProjectSettings>): Promise<Project> {
    const id = uuidv4();
    const now = new Date().toISOString();

    const project: Project = {
      id,
      name,
      description,
      created: now,
      updated: now,
      settings: {
        defaultModel: settings?.defaultModel || 'claude-3-opus-20240229',
        temperature: settings?.temperature || 0.7,
        maxTokens: settings?.maxTokens || 4096,
        defaultServer: settings?.defaultServer,
        systemPrompt: settings?.systemPrompt,
      },
      metadata: {
        messageCount: 0,
        attachmentCount: 0,
        totalTokens: 0,
      },
    };

    try {
      // Create project directory
      await createDir(`${this.projectsDir}/${id}`, { recursive: true });
      
      // Create subdirectories
      await createDir(`${this.projectsDir}/${id}/attachments`);
      
      // Save project metadata
      await this.saveProjectMetadata(id, project);
      
      return project;
    } catch (error) {
      throw this.handleError('CREATE_FAILED', `Failed to create project: ${error.message}`, { id });
    }
  }

  async getProject(id: string): Promise<Project> {
    try {
      const content = await readTextFile(`${this.projectsDir}/${id}/project.json`);
      return JSON.parse(content) as Project;
    } catch (error) {
      throw this.handleError('NOT_FOUND', `Project not found: ${id}`);
    }
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    try {
      const project = await this.getProject(id);
      const updatedProject = {
        ...project,
        ...updates,
        updated: new Date().toISOString(),
      };

      await this.saveProjectMetadata(id, updatedProject);
      return updatedProject;
    } catch (error) {
      throw this.handleError('UPDATE_FAILED', `Failed to update project: ${error.message}`, { id });
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      await removeDir(`${this.projectsDir}/${id}`, { recursive: true });
    } catch (error) {
      throw this.handleError('DELETE_FAILED', `Failed to delete project: ${error.message}`, { id });
    }
  }

  async listProjects(): Promise<Project[]> {
    try {
      const entries = await invoke<string[]>('list_project_directories');
      const projects: Project[] = [];

      for (const entry of entries) {
        try {
          const project = await this.getProject(entry);
          projects.push(project);
        } catch (error) {
          console.error(`Failed to load project ${entry}:`, error);
        }
      }

      return projects;
    } catch (error) {
      throw this.handleError('LIST_FAILED', `Failed to list projects: ${error.message}`);
    }
  }

  private async saveProjectMetadata(id: string, project: Project): Promise<void> {
    await writeTextFile(
      `${this.projectsDir}/${id}/project.json`,
      JSON.stringify(project, null, 2)
    );
  }

  private handleError(code: string, message: string, details?: Record<string, unknown>): ProjectError {
    const error: ProjectError = { code, message };
    if (details) {
      error.details = details;
    }
    return error;
  }
}

export const projectManager = new ProjectManager();