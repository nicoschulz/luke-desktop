import { useState, useCallback, useEffect } from 'react';
import { projectManager } from '../lib/project/manager';
import type { Project, ProjectSettings, ProjectError } from '../lib/project/types';

interface UseProjectResult {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: ProjectError | null;
  createProject: (name: string, description?: string, settings?: Partial<ProjectSettings>) => Promise<Project>;
  loadProject: (id: string) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  refreshProjects: () => Promise<void>;
}

export function useProject(): UseProjectResult {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ProjectError | null>(null);

  const refreshProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const projectList = await projectManager.listProjects();
      setProjects(projectList);
    } catch (err) {
      setError(err as ProjectError);
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = useCallback(async (
    name: string,
    description?: string,
    settings?: Partial<ProjectSettings>
  ): Promise<Project> => {
    try {
      setLoading(true);
      setError(null);
      const newProject = await projectManager.createProject(name, description, settings);
      await refreshProjects();
      return newProject;
    } catch (err) {
      setError(err as ProjectError);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshProjects]);

  const loadProject = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const project = await projectManager.getProject(id);
      setCurrentProject(project);
    } catch (err) {
      setError(err as ProjectError);
      setCurrentProject(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedProject = await projectManager.updateProject(id, updates);
      setCurrentProject(updatedProject);
      await refreshProjects();
    } catch (err) {
      setError(err as ProjectError);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshProjects]);

  const deleteProject = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await projectManager.deleteProject(id);
      if (currentProject?.id === id) {
        setCurrentProject(null);
      }
      await refreshProjects();
    } catch (err) {
      setError(err as ProjectError);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentProject, refreshProjects]);

  // Load projects on mount
  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  return {
    projects,
    currentProject,
    loading,
    error,
    createProject,
    loadProject,
    updateProject,
    deleteProject,
    refreshProjects,
  };
}