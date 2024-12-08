import React from 'react';
import { useProject } from '../../hooks/useProject';
import { ProjectList } from './ProjectList';
import { ProjectDetails } from './ProjectDetails';

export function ProjectManager() {
  const { currentProject } = useProject();

  return (
    <div className="flex h-full">
      <div className="w-80 border-r overflow-y-auto">
        <ProjectList />
      </div>
      <div className="flex-1 overflow-y-auto">
        {currentProject ? (
          <ProjectDetails project={currentProject} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a project or create a new one to get started
          </div>
        )}
      </div>
    </div>
  );
}