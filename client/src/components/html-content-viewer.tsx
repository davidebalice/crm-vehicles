import React from 'react';

interface HtmlContentViewerProps {
  htmlContent: string;
}

export function HtmlContentViewer({ htmlContent }: HtmlContentViewerProps) {
  return (
    <div 
      className="markdown-content" 
      dangerouslySetInnerHTML={{ __html: htmlContent }} 
    />
  );
}