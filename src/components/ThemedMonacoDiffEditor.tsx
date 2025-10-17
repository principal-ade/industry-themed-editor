import type { Theme } from '@a24z/industry-theme';
import { DiffEditor, loader, DiffEditorProps, DiffOnMount } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { initVimMode } from 'monaco-vim';
import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';

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
  /**
   * Initial value for the original model (useful for uncontrolled usage)
   */
  initialValue?: string;
  /**
   * Initial value for the modified model when used in uncontrolled mode
   */
  initialModifiedValue?: string;
  /**
   * Callback invoked when the modified content should be saved (e.g., via Ctrl/Cmd+S)
   */
  onSave?: (value: string, context: { filePath?: string }) => void | Promise<void>;
  /**
   * Optional file path used to provide additional context to save handlers
   */
  filePath?: string;
  /**
   * Enable the Ctrl/Cmd+S save shortcut (defaults to true)
   */
  enableSaveShortcut?: boolean;
  /**
   * Optional callback notified whenever the dirty state changes
   */
  onDirtyChange?: (isDirty: boolean) => void;
  /**
   * Hide the built-in status bar (for vim mode and save indicators)
   */
  hideStatusBar?: boolean;
}

/**
 * A Monaco diff editor component that integrates with industry-theme
 */
export const ThemedMonacoDiffEditor: React.FC<ThemedMonacoDiffEditorProps> = (props) => {
  const {
    theme,
    loadingComponent,
    options,
    vimMode = false,
    onMount,
    initialValue,
    initialModifiedValue,
    onSave,
    filePath,
    enableSaveShortcut = true,
    onDirtyChange,
    hideStatusBar = false,
    ...restEditorProps
  } = props;

  const {
    modified: controlledModified,
    ...forwardedEditorProps
  } = restEditorProps;

  const resolvedInitialModifiedValue = initialModifiedValue ?? initialValue;
  const isModifiedControlled = controlledModified !== undefined;

  const computeInitialModifiedValue = useCallback(() => {
    if (resolvedInitialModifiedValue !== undefined) return resolvedInitialModifiedValue;
    if (typeof controlledModified === 'string') return controlledModified;
    return '';
  }, [controlledModified, resolvedInitialModifiedValue]);

  const [internalModifiedValue, setInternalModifiedValue] = useState<string>(() =>
    computeInitialModifiedValue()
  );
  const [savedModifiedValue, setSavedModifiedValue] = useState<string>(() =>
    computeInitialModifiedValue()
  );
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const monacoTheme = useMemo(() => getMonacoTheme(theme), [theme]);
  const vimModeRef = useRef<{ dispose: () => void } | null>(null);
  const statusNodeRef = useRef<HTMLDivElement | null>(null);
  const changeSubscriptionRef = useRef<monaco.IDisposable | null>(null);
  const savedValueRef = useRef<string>(savedModifiedValue);
  const isControlledRef = useRef<boolean>(isModifiedControlled);
  const prevFilePathRef = useRef<string | undefined>(filePath);
  const prevInitialModifiedValueRef = useRef<string | undefined>(resolvedInitialModifiedValue);
  const filePathRef = useRef<string | undefined>(filePath);
  const onSaveRef = useRef<typeof onSave>(onSave);

  useEffect(() => {
    savedValueRef.current = savedModifiedValue;
  }, [savedModifiedValue]);

  useEffect(() => {
    isControlledRef.current = isModifiedControlled;
  }, [isModifiedControlled]);

  useEffect(() => {
    filePathRef.current = filePath;
  }, [filePath]);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  const currentModifiedValue = isModifiedControlled
    ? (controlledModified as string | undefined) ?? ''
    : internalModifiedValue;

  useEffect(() => {
    if (
      !isModifiedControlled &&
      resolvedInitialModifiedValue !== undefined &&
      resolvedInitialModifiedValue !== prevInitialModifiedValueRef.current
    ) {
      setInternalModifiedValue(resolvedInitialModifiedValue);
      setSavedModifiedValue(resolvedInitialModifiedValue);
      savedValueRef.current = resolvedInitialModifiedValue;
      setIsDirty(false);
    }
    prevInitialModifiedValueRef.current = resolvedInitialModifiedValue;
  }, [isModifiedControlled, resolvedInitialModifiedValue]);

  useEffect(() => {
    if (filePath !== prevFilePathRef.current) {
      const baseline = resolvedInitialModifiedValue ?? currentModifiedValue;
      if (!isModifiedControlled && resolvedInitialModifiedValue !== undefined) {
        setInternalModifiedValue(resolvedInitialModifiedValue);
      }
      setSavedModifiedValue(baseline);
      savedValueRef.current = baseline;
      setIsDirty(false);
      prevFilePathRef.current = filePath;
    }
  }, [currentModifiedValue, filePath, isModifiedControlled, resolvedInitialModifiedValue]);

  useEffect(() => {
    const dirty = currentModifiedValue !== savedModifiedValue;
    setIsDirty((prev) => (prev === dirty ? prev : dirty));
  }, [currentModifiedValue, savedModifiedValue]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const syncDirtyState = useCallback((value: string) => {
    const dirty = value !== savedValueRef.current;
    setIsDirty((prev) => (prev === dirty ? prev : dirty));
  }, []);

  const updateSavedState = useCallback((nextSavedValue: string) => {
    savedValueRef.current = nextSavedValue;
    setSavedModifiedValue(nextSavedValue);
    setIsDirty(false);
  }, []);


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

  const handleMount: DiffOnMount = (editor, monacoInstance) => {
    const modifiedEditor = editor.getModifiedEditor();

    if (changeSubscriptionRef.current) {
      changeSubscriptionRef.current.dispose();
    }

    changeSubscriptionRef.current = modifiedEditor.onDidChangeModelContent(() => {
      const latestValue = modifiedEditor.getValue();
      if (!isControlledRef.current) {
        setInternalModifiedValue(latestValue);
      }
      syncDirtyState(latestValue);
    });

    if (vimMode && statusNodeRef.current && mergedOptions.renderSideBySide === false) {
      vimModeRef.current = initVimMode(modifiedEditor, statusNodeRef.current);
    }

    if (enableSaveShortcut && onSaveRef.current) {
      modifiedEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, async () => {
        const saveHandler = onSaveRef.current;
        if (!saveHandler) {
          return;
        }
        const latestValue = modifiedEditor.getValue();
        try {
          const result = saveHandler(latestValue, { filePath: filePathRef.current });
          if (result && typeof (result as Promise<void>).then === 'function') {
            await result;
          }
          updateSavedState(latestValue);
        } catch (error) {
          console.error('Failed to save diff editor contents', error);
        }
      });
    }

    const initialEditorValue = modifiedEditor.getValue();
    if (!isModifiedControlled) {
      setInternalModifiedValue(initialEditorValue);
    }
    syncDirtyState(initialEditorValue);

    if (onMount) {
      onMount(editor, monacoInstance);
    }
  };

  // Cleanup Vim mode on unmount or when vimMode changes
  useEffect(() => {
    return () => {
      if (vimModeRef.current) {
        vimModeRef.current.dispose();
        vimModeRef.current = null;
      }
      if (changeSubscriptionRef.current) {
        changeSubscriptionRef.current.dispose();
        changeSubscriptionRef.current = null;
      }
    };
  }, [vimMode]);

  const isUnifiedView = mergedOptions.renderSideBySide === false;
  const canShowVimStatus = vimMode && isUnifiedView;
  const shouldShowStatusBar = !hideStatusBar && (vimMode || onSave || !isModifiedControlled);

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <DiffEditor
        theme={monacoTheme}
        options={mergedOptions}
        loading={loading}
        onMount={handleMount}
        modified={currentModifiedValue}
        {...forwardedEditorProps}
      />
      {shouldShowStatusBar && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 8px',
            backgroundColor: theme.colors.backgroundSecondary,
            color: theme.colors.text,
            fontFamily: theme.fonts?.monospace || 'monospace',
            fontSize: theme.fontSizes?.[1] || 12,
            borderTop: `1px solid ${theme.colors.border}`,
            zIndex: 1000,
          }}
        >
          <div style={{ flex: 1, minHeight: '1em', display: 'flex', alignItems: 'center' }}>
            {canShowVimStatus && (
              <div ref={statusNodeRef} style={{ flex: 1, minHeight: '1em' }} />
            )}
          </div>
          <div
            style={{
              marginLeft: canShowVimStatus ? 'auto' : 0,
              padding: '0 6px',
              borderRadius: 4,
              border: `1px solid ${isDirty ? theme.colors.warning : theme.colors.border}`,
              backgroundColor: isDirty
                ? theme.colors.backgroundSecondary
                : theme.colors.background,
              color: isDirty ? theme.colors.warning : theme.colors.textSecondary,
              fontWeight: 600,
            }}
          >
            {isDirty ? 'Unsaved changes' : 'Saved'}
          </div>
        </div>
      )}
    </div>
  );
};
