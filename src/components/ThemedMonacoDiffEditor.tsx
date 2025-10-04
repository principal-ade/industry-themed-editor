import type { Theme } from '@a24z/industry-theme';
import { DiffEditor, loader, DiffEditorProps, DiffOnMount } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { initVimMode } from 'monaco-vim';
import React, { useMemo, useRef, useEffect } from 'react';

// Configure Monaco to use the locally bundled version
loader.config({ monaco });

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

export interface ThemedMonacoDiffEditorProps extends Omit<DiffEditorProps, 'theme' | 'loading'> {
  /**
   * Industry theme object to use for theming the editor
   */
  theme: Theme;
  /**
   * Custom loading component
   */
  loadingComponent?: React.ReactNode;
  /**
   * Enable Vim mode keybindings (only works in unified/inline view)
   */
  vimMode?: boolean;
}

/**
 * A Monaco diff editor component that integrates with industry-theme
 */
export const ThemedMonacoDiffEditor: React.FC<ThemedMonacoDiffEditorProps> = ({
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

  const defaultOptions: monaco.editor.IDiffEditorConstructionOptions = {
    readOnly: false,
    wordWrap: 'on',
    minimap: { enabled: false },
    fontSize: theme.fontSizes?.[2] || 13,
    fontFamily: theme.fonts?.monospace || 'monospace',
    scrollBeyondLastLine: false,
    automaticLayout: true,
    renderSideBySide: true,
    enableSplitViewResizing: true,
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
  };

  const loading = loadingComponent || (
    <div style={{ color: theme.colors.textSecondary, padding: 8 }}>Loading diff editor…</div>
  );

  const handleMount: DiffOnMount = (editor, monaco) => {
    // Initialize Vim mode if enabled and in unified view
    if (vimMode && statusNodeRef.current && mergedOptions.renderSideBySide === false) {
      // In unified view, get the modified editor (the single visible editor)
      const modifiedEditor = editor.getModifiedEditor();
      vimModeRef.current = initVimMode(modifiedEditor, statusNodeRef.current);
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

  const isUnifiedView = mergedOptions.renderSideBySide === false;
  const showVimStatus = vimMode && isUnifiedView;

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <DiffEditor
        theme={monacoTheme}
        options={mergedOptions}
        loading={loading}
        onMount={handleMount}
        {...editorProps}
      />
      {showVimStatus && (
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
