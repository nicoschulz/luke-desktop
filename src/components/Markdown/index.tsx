interface CodeBlockProps {
  code?: string;
  language?: string;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ 
  code, 
  language, 
  className 
}) => {
  return (
    <pre className={`language-${language || 'text'} ${className || ''}`}>
      <code>{code}</code>
    </pre>
  );
};