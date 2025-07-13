export interface Project {
  id: string;
  name: string;
  path: string;
  createdAt: Date;
  description?: string;
  settings?: any;
}

export class ProjectManager {
  private projects: Project[] = [];

  async getProjects(): Promise<Project[]> {
    return this.projects;
  }

  async listProjects(): Promise<Project[]> {
    return this.projects;
  }

  async addProject(project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    this.projects.push(newProject);
    return newProject;
  }

  async createProject(name: string, description?: string, settings?: any): Promise<Project> {
    return this.addProject({ name, path: `/projects/${name}`, description, settings });
  }

  async getProject(id: string): Promise<Project> {
    const project = this.projects.find(p => p.id === id);
    if (!project) throw new Error(`Project ${id} not found`);
    return project;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) throw new Error(`Project ${id} not found`);
    this.projects[index] = { ...this.projects[index], ...updates };
    return this.projects[index];
  }

  async removeProject(id: string): Promise<void> {
    this.projects = this.projects.filter(p => p.id !== id);
  }

  async deleteProject(id: string): Promise<void> {
    return this.removeProject(id);
  }
}

export const projectManager = new ProjectManager();