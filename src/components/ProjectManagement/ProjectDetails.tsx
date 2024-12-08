import React, { useState } from 'react';
import { useProject } from '../../hooks/useProject';
import type { Project, ProjectSettings } from '../../lib/project/types';

interface ProjectDetailsProps {
  project: Project;
}

export function ProjectDetails({ project }: ProjectDetailsProps) {
  const { updateProject } = useProject();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || '',
    settings: {
      defaultModel: project.settings.defaultModel,
      temperature: project.settings.temperature,
      maxTokens: project.settings.maxTokens,
      defaultServer: project.settings.defaultServer,
      systemPrompt: project.settings.systemPrompt,
    },
  });

  const handleSave = async () => {
    try {
      await updateProject(project.id, {
        name: formData.name,
        description: formData.description || undefined,
        settings: formData.settings as ProjectSettings,
      });
      setEditing(false);
    } catch (err) {
      console.error('Failed to update project:', err);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith('settings.')) {
      const settingName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          [settingName]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  if (!editing) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-semibold">{project.name}</h2>
            {project.description && (
              <p className="text-gray-600 mt-1">{project.description}</p>
            )}
          </div>
          <button
            onClick={() => setEditing(true)}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Edit
          </button>
        </div>

        <div className="grid gap-6">
          <section>
            <h3 className="text-lg font-medium mb-2">Project Information</h3>
            <div className="grid gap-2 text-sm text-gray-600">
              <p>Created: {new Date(project.created).toLocaleString()}</p>
              <p>Last Updated: {new Date(project.updated).toLocaleString()}</p>
              <p>Messages: {project.metadata.messageCount}</p>
              <p>Attachments: {project.metadata.attachmentCount}</p>
              <p>Total Tokens: {project.metadata.totalTokens}</p>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-medium mb-2">Settings</h3>
            <div className="grid gap-2 text-sm text-gray-600">
              <p>Default Model: {project.settings.defaultModel || 'Not set'}</p>
              <p>Temperature: {project.settings.temperature || 'Default'}</p>
              <p>Max Tokens: {project.settings.maxTokens || 'Default'}</p>
              <p>Default Server: {project.settings.defaultServer || 'Not set'}</p>
              {project.settings.systemPrompt && (
                <div>
                  <p className="font-medium">System Prompt:</p>
                  <p className="mt-1 whitespace-pre-wrap">
                    {project.settings.systemPrompt}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-6">Edit Project</h2>
      
      <form className="grid gap-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md"
            rows={3}
          />
        </div>

        <section>
          <h3 className="text-lg font-medium mb-3">Project Settings</h3>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Model
              </label>
              <input
                type="text"
                name="settings.defaultModel"
                value={formData.settings.defaultModel || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="e.g., claude-3-opus-20240229"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature
              </label>
              <input
                type="number"
                name="settings.temperature"
                value={formData.settings.temperature || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
                step="0.1"
                min="0"
                max="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Tokens
              </label>
              <input
                type="number"
                name="settings.maxTokens"
                value={formData.settings.maxTokens || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Server
              </label>
              <input
                type="text"
                name="settings.defaultServer"
                value={formData.settings.defaultServer || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                System Prompt
              </label>
              <textarea
                name="settings.systemPrompt"
                value={formData.settings.systemPrompt || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
                rows={4}
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}