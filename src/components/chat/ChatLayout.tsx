// import React from 'react';
import { ChatSessionList } from './ChatSessionList';
import { ChatInterface } from './ChatInterface';
import { ResizablePanel, ResizablePanelGroup } from '../ui/resizable';

interface ChatLayoutProps {
  projectId?: number;
  className?: string;
}

export function ChatLayout({ projectId, className = '' }: ChatLayoutProps) {
  return (
    <div className={`h-full ${className}`}>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
          <ChatSessionList projectId={projectId} />
        </ResizablePanel>
        <ResizablePanel defaultSize={75}>
          <ChatInterface />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}