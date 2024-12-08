import React, { useState, useRef, useEffect } from 'react';
import { Tag, X, Plus } from 'lucide-react';

interface ChatHeaderProps {
  title: string;
  tags: string[];
  onTitleChange: (newTitle: string) => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

export function ChatHeader({
  title,
  tags,
  onTitleChange,
  onAddTag,
  onRemoveTag
}: ChatHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    if (showTagInput && tagInputRef.current) {
      tagInputRef.current.focus();
    }
  }, [showTagInput]);

  const handleTitleSubmit = () => {
    if (newTitle.trim() && newTitle !== title) {
      onTitleChange(newTitle);
    } else {
      setNewTitle(title);
    }
    setIsEditing(false);
  };

  const handleTagSubmit = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onAddTag(newTag.trim());
      setNewTag('');
    }
    setShowTagInput(false);
  };

  return (
    <div className="border-b border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        {isEditing ? (
          <input
            ref={titleInputRef}
            type="text"
            className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={e => {
              if (e.key === 'Enter') handleTitleSubmit();
              if (e.key === 'Escape') {
                setNewTitle(title);
                setIsEditing(false);
              }
            }}
          />
        ) : (
          <h2
            className="text-xl font-semibold cursor-pointer hover:text-gray-600"
            onClick={() => setIsEditing(true)}
          >
            {title}
          </h2>
        )}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {tags.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm"
          >
            <Tag size={14} />
            {tag}
            <button
              onClick={() => onRemoveTag(tag)}
              className="ml-1 hover:text-red-500 focus:outline-none"
            >
              <X size={14} />
            </button>
          </span>
        ))}

        {showTagInput ? (
          <input
            ref={tagInputRef}
            type="text"
            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            onBlur={handleTagSubmit}
            onKeyDown={e => {
              if (e.key === 'Enter') handleTagSubmit();
              if (e.key === 'Escape') {
                setNewTag('');
                setShowTagInput(false);
              }
            }}
            placeholder="Add tag..."
          />
        ) : (
          <button
            onClick={() => setShowTagInput(true)}
            className="inline-flex items-center gap-1 px-2 py-1 text-sm text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <Plus size={14} />
            Add Tag
          </button>
        )}
      </div>
    </div>
  );
}
