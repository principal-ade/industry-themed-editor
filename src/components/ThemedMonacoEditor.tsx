import type { Theme } from '@a24z/industry-theme';
import Editor, { loader, EditorProps, OnMount } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { initVimMode } from 'monaco-vim';
import React, { useMemo, useRef, useEffect } from 'react';

// Configure Monaco to use the locally bundled version
loader.config({ monaco });

// Configure workers when in browser
if (typeof window !== 'undefined') {
  (
    window as unknown as {
      MonacoEnvironment: {
        getWorkerUrl: (moduleId: string, label: string) => string;
      };
    }
  ).MonacoEnvironment = {
    getWorkerUrl: (_moduleId: string, label: string) => {
      if (label === 'json') return './json.worker.js';
      if (label === 'css' || label === 'scss' || label === 'less') return './css.worker.js';
      if (label === 'html' || label === 'handlebars' || label === 'razor')
        return './html.worker.js';
      if (label === 'typescript' || label === 'javascript') return './ts.worker.js';
      return './editor.worker.js';
    },
  };
}

/**
 * Determine Monaco theme ('vs' or 'vs-dark') based on background color luminance
 */
function getMonacoTheme(theme: Theme): 'vs' | 'vs-dark' {
  try {
    const bgColor = theme.colors?.background;
    if (bgColor && typeof bgColor === 'string') {
      const colorStr = bgColor.toLowerCase();
      if (colorStr.startsWith('#')) {
        const hex = colorStr.slice(1);
        if (hex.length >= 6) {
          const r = parseInt(hex.slice(0, 2), 16);
          const g = parseInt(hex.slice(2, 4), 16);
          const b = parseInt(hex.slice(4, 6), 16);
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          return luminance < 0.5 ? 'vs-dark' : 'vs';
        }
      }
    }
  } catch {
    // Ignore parsing errors, fall back to default
  }
  return 'vs-dark';
}

export interface ThemedMonacoEditorProps extends Omit<EditorProps, 'theme' | 'loading'> {
  /**
   * Industry theme object to use for theming the editor
   */
  theme: Theme;
  /**
   * Custom loading component
   */
  loadingComponent?: React.ReactNode;
  /**
   * Enable Vim mode keybindings
   */
  vimMode?: boolean;
}

/**
 * A Monaco editor component that integrates with industry-theme
 */
export const ThemedMonacoEditor: React.FC<ThemedMonacoEditorProps> = ({
  theme,
  loadingComponent,
  options,
  vimMode = false,
  onMount,
  ...editorProps
}) => {
  const monacoTheme = useMemo(() => getMonacoTheme(theme), [theme]);
  const vimModeRef = useRef<{ dispose: () => void } | null>(null);
  const statusNodeRef = useRef<HTMLDivElement | null>(null);

  const defaultOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    readOnly: false,
    wordWrap: 'on',
    minimap: { enabled: false },
    fontSize: theme.fontSizes?.[2] || 13,
    fontFamily: theme.fonts?.monospace || 'monospace',
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
  };

  const loading = loadingComponent || (
    <div style={{ color: theme.colors.textSecondary, padding: 8 }}>Loading editor…</div>
  );

  const handleMount: OnMount = (editor, monaco) => {
    // Initialize Vim mode if enabled
    if (vimMode && statusNodeRef.current) {
      vimModeRef.current = initVimMode(editor, statusNodeRef.current);
    }

    // Call user's onMount handler if provided
    if (onMount) {
      onMount(editor, monaco);
    }
  };

  // Cleanup Vim mode on unmount or when vimMode changes
  useEffect(() => {
    return () => {
      if (vimModeRef.current) {
        vimModeRef.current.dispose();
        vimModeRef.current = null;
      }
    };
  }, [vimMode]);

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <Editor
        theme={monacoTheme}
        options={mergedOptions}
        loading={loading}
        onMount={handleMount}
        {...editorProps}
      />
      {vimMode && (
        <div
          ref={statusNodeRef}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '4px 8px',
            backgroundColor: theme.colors.backgroundSecondary,
            color: theme.colors.text,
            fontFamily: theme.fonts?.monospace || 'monospace',
            fontSize: theme.fontSizes?.[1] || 12,
            borderTop: `1px solid ${theme.colors.border}`,
            zIndex: 1000,
          }}
        />
      )}
    </div>
  );
};
