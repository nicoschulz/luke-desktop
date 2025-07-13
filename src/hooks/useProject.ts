import { useState, useEffect } from 'react';
import { projectManager } from '../lib/project/manager';
import { Project } from '../lib/project/types';

export interface UseProjectReturn {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  createProject: (name: string, description?: string) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
}

export function useProject(): UseProjectReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const projectList = await projectManager.getProjects();
        // Convert to match the expected Project type
        const convertedProjects: Project[] = projectList.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          created: p.createdAt?.getTime()?.toString() || Date.now().toString(),
          updated: p.createdAt?.getTime()?.toString() || Date.now().toString(),
          settings: p.settings || {},
          metadata: {
            messageCount: 0,
            attachmentCount: 0,
            totalTokens: 0
          }
        }));
        setProjects(convertedProjects);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const createProject = async (name: string, description?: string): Promise<Project> => {
    try {
      const newProject = await projectManager.createProject(name, description);
      // Convert to match the expected Project type
      const convertedProject: Project = {
        id: newProject.id,
        name: newProject.name,
        description: newProject.description || '',
        created: newProject.createdAt?.getTime()?.toString() || Date.now().toString(),
        updated: newProject.createdAt?.getTime()?.toString() || Date.now().toString(),
        settings: newProject.settings || {},
        metadata: {
          messageCount: 0,
          attachmentCount: 0,
          totalTokens: 0
        }
      };
      setProjects(prev => [...prev, convertedProject]);
      return convertedProject;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>): Promise<Project> => {
    try {
      const updatedProject = await projectManager.updateProject(id, updates);
      // Convert to match the expected Project type
      const convertedProject: Project = {
        id: updatedProject.id,
        name: updatedProject.name,
        description: updatedProject.description || '',
        created: updatedProject.createdAt?.getTime()?.toString() || Date.now().toString(),
        updated: updatedProject.createdAt?.getTime()?.toString() || Date.now().toString(),
        settings: updatedProject.settings || {},
        metadata: {
          messageCount: 0,
          attachmentCount: 0,
          totalTokens: 0
        }
      };
      setProjects(prev => prev.map(p => p.id === id ? convertedProject : p));
      if (currentProject?.id === id) {
        setCurrentProject(convertedProject);
      }
      return convertedProject;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update project');
    }
  };

  const deleteProject = async (id: string): Promise<void> => {
    try {
      await projectManager.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      if (currentProject?.id === id) {
        setCurrentProject(null);
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  return {
    projects,
    currentProject,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    setCurrentProject,
  };
}