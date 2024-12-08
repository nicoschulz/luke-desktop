import React from 'react';
import { useProject } from '../../hooks/useProject';

export function ProjectList() {
  const {
    projects,
    currentProject,
    loading,
    error,
    createProject,
    loadProject,
    deleteProject
  } = useProject();

  const handleCreateProject = async () => {
    const name = prompt('Enter project name:');
    if (name) {
      try {
        await createProject(name);
      } catch (err) {
        console.error('Failed to create project:', err);
      }
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
      } catch (err) {
        console.error('Failed to delete project:', err);
      }
    }
  };

  if (loading) {
    return <div className="p-4">Loading projects...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Projects</h2>
        <button
          onClick={handleCreateProject}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          New Project
        </button>
      </div>

      <div className="grid gap-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className={`p-4 border rounded-lg ${
              currentProject?.id === project.id ? 'border-blue-500' : 'border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium">{project.name}</h3>
                {project.description && (
                  <p className="text-gray-600 mt-1">{project.description}</p>
                )}
                <div className="text-sm text-gray-500 mt-2">
                  <p>Created: {new Date(project.created).toLocaleDateString()}</p>
                  <p>Messages: {project.metadata.messageCount}</p>
                  <p>Attachments: {project.metadata.attachmentCount}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => loadProject(project.id)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Open
                </button>
                <button
                  onClick={() => handleDeleteProject(project.id)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No projects yet. Click "New Project" to create one.
          </div>
        )}
      </div>
    </div>
  );
}