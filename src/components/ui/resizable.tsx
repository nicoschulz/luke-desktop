import React from 'react';

interface ResizablePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  children: React.ReactNode;
}

interface ResizablePanelGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: string;
  children: React.ReactNode;
}

export const ResizablePanel = React.forwardRef<HTMLDivElement, ResizablePanelProps>(
  ({ children, defaultSize, minSize, maxSize, ...rest }, ref) => (
    <div ref={ref} {...rest}>
      {children}
    </div>
  )
);
ResizablePanel.displayName = 'ResizablePanel';

export const ResizablePanelGroup = React.forwardRef<HTMLDivElement, ResizablePanelGroupProps>(
  ({ children, direction, ...rest }, ref) => (
    <div ref={ref} data-direction={direction} {...rest}>
      {children}
    </div>
  )
);
ResizablePanelGroup.displayName = 'ResizablePanelGroup';
