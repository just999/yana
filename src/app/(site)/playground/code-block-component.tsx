import React from 'react';

import { NodeViewContent, NodeViewProps, NodeViewWrapper } from '@tiptap/react';

interface CodeBlockComponentProps extends NodeViewProps {
  // Add any additional props you need
}

const CodeBlockComponent: React.FC<CodeBlockComponentProps> = ({
  node,
  updateAttributes,
  extension,
}) => {
  // Safely access the language attribute with fallback
  const defaultLanguage = node.attrs.language || null;

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    updateAttributes({ language: event.target.value });
  };

  // Get available languages safely with optional chaining
  const languages =
    (extension?.options as any)?.lowlight?.listLanguages?.() || [];

  return (
    <NodeViewWrapper className='code-block'>
      <select
        contentEditable={false}
        defaultValue={defaultLanguage || 'null'}
        onChange={handleLanguageChange}
        className='code-language-select'
      >
        <option value='null'>auto</option>
        <option disabled>—</option>
        {languages.map((lang: string, index: number) => (
          <option key={index} value={lang}>
            {lang}
          </option>
        ))}
      </select>
      <pre>
        <NodeViewContent as='div' className='code-content' />
      </pre>
    </NodeViewWrapper>
  );
};

export default CodeBlockComponent;
