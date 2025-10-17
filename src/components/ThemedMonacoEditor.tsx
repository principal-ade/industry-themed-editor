import type { Theme } from '@a24z/industry-theme';
import Editor, { loader, EditorProps, OnMount } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { initVimMode } from 'monaco-vim';
import React, {
  useMemo,
  useRef,
  useEffect,
  useState,
  useCallback,
} from 'react';

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

  // Configure language defaults: Keep syntax validation, disable semantic validation
  // This provides syntax highlighting and catches syntax errors without spurious warnings
  // about missing modules, type mismatches, etc. that need project context

  // TypeScript - keep syntax errors, disable semantic validation
  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true, // No type checking/module resolution
    noSyntaxValidation: false, // Keep syntax errors
    noSuggestionDiagnostics: true,
  });

  // JavaScript - same settings
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: false,
    noSuggestionDiagnostics: true,
  });

  // JSON - allow syntax errors but no schema validation
  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    schemas: [], // No schema validation
  });

  // CSS - keep syntax validation
  monaco.languages.css.cssDefaults.setDiagnosticsOptions({
    validate: true,
  });
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
  /**
   * Initial value to seed the editor with when used in uncontrolled mode
   */
  initialValue?: string;
  /**
   * Callback invoked when the editor content should be saved (e.g., via Ctrl/Cmd+S)
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
   * Optional callback that is notified when the dirty state changes
   */
  onDirtyChange?: (isDirty: boolean) => void;
  /**
   * Hide the built-in status bar (for vim mode and save indicators)
   * Useful when the parent component wants to show its own UI
   */
  hideStatusBar?: boolean;
  /**
   * TypeScript diagnostics options (overrides global defaults)
   * Use this to enable semantic validation or customize error reporting
   */
  typescriptDiagnosticsOptions?: monaco.languages.typescript.DiagnosticsOptions;
  /**
   * JavaScript diagnostics options (overrides global defaults)
   */
  javascriptDiagnosticsOptions?: monaco.languages.typescript.DiagnosticsOptions;
  /**
   * JSON diagnostics options (overrides global defaults)
   */
  jsonDiagnosticsOptions?: monaco.languages.json.DiagnosticsOptions;
  /**
   * CSS diagnostics options (overrides global defaults)
   */
  cssDiagnosticsOptions?: monaco.languages.css.DiagnosticsOptions;
}

/**
 * A Monaco editor component that integrates with industry-theme
 */
export const ThemedMonacoEditor: React.FC<ThemedMonacoEditorProps> = (props) => {
  const {
    theme,
    loadingComponent,
    options,
    vimMode = false,
    onMount,
    initialValue,
    onSave,
    filePath,
    enableSaveShortcut = true,
    onDirtyChange,
    hideStatusBar = false,
    typescriptDiagnosticsOptions,
    javascriptDiagnosticsOptions,
    jsonDiagnosticsOptions,
    cssDiagnosticsOptions,
    ...restEditorProps
  } = props;

  const {
    value: controlledValue,
    defaultValue,
    onChange: externalOnChange,
    ...forwardedEditorProps
  } = restEditorProps;

  const isControlled = controlledValue !== undefined;

  const computeInitialValue = useCallback(() => {
    if (initialValue !== undefined) return initialValue;
    if (typeof controlledValue === 'string') return controlledValue;
    if (typeof defaultValue === 'string') return defaultValue;
    return '';
  }, [controlledValue, defaultValue, initialValue]);

  const [internalValue, setInternalValue] = useState<string>(() => computeInitialValue());
  const [savedValue, setSavedValue] = useState<string>(() => computeInitialValue());
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const monacoTheme = useMemo(() => getMonacoTheme(theme), [theme]);
  const vimModeRef = useRef<{ dispose: () => void } | null>(null);
  const vimStatusNodeRef = useRef<HTMLDivElement | null>(null);
  const prevFilePathRef = useRef<string | undefined>(filePath);
  const prevInitialValueRef = useRef<string | undefined>(initialValue);

  const currentValue = isControlled
    ? (controlledValue as string | undefined) ?? ''
    : internalValue;

  useEffect(() => {
    if (!isControlled && initialValue !== undefined && initialValue !== prevInitialValueRef.current) {
      setInternalValue(initialValue);
      setSavedValue(initialValue);
      setIsDirty(false);
      prevInitialValueRef.current = initialValue;
    }
  }, [initialValue, isControlled]);

  useEffect(() => {
    if (filePath !== prevFilePathRef.current) {
      const baseline = initialValue ?? currentValue;
      if (!isControlled && initialValue !== undefined) {
        setInternalValue(initialValue);
      }
      setSavedValue(baseline);
      setIsDirty(false);
      prevFilePathRef.current = filePath;
    }
  }, [currentValue, filePath, initialValue, isControlled]);

  useEffect(() => {
    const dirty = currentValue !== savedValue;
    setIsDirty((prev) => (prev === dirty ? prev : dirty));
  }, [currentValue, savedValue]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const updateSavedState = useCallback(
    (nextSavedValue: string) => {
      setSavedValue(nextSavedValue);
      setIsDirty(false);
    },
    []
  );

  const handleChange = useCallback<NonNullable<EditorProps['onChange']>>( 
    (value, event) => {
      const nextValue = value ?? '';
      if (!isControlled) {
        setInternalValue(nextValue);
      }
      const dirty = nextValue !== savedValue;
      setIsDirty((prev) => (prev === dirty ? prev : dirty));
      externalOnChange?.(value, event);
    },
    [externalOnChange, isControlled, savedValue]
  );

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

  const handleMount: OnMount = (editor, monacoInstance) => {
    // Apply language diagnostics options if provided
    if (typescriptDiagnosticsOptions) {
      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(
        typescriptDiagnosticsOptions
      );
    }
    if (javascriptDiagnosticsOptions) {
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(
        javascriptDiagnosticsOptions
      );
    }
    if (jsonDiagnosticsOptions) {
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions(jsonDiagnosticsOptions);
    }
    if (cssDiagnosticsOptions) {
      monaco.languages.css.cssDefaults.setDiagnosticsOptions(cssDiagnosticsOptions);
    }

    // Initialize Vim mode if enabled
    if (vimMode && vimStatusNodeRef.current) {
      vimModeRef.current = initVimMode(editor, vimStatusNodeRef.current);
    }

    if (enableSaveShortcut && onSave) {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, async () => {
        const latestValue = editor.getValue();
        try {
          const result = onSave(latestValue, { filePath });
          if (result && typeof (result as Promise<void>).then === 'function') {
            await result;
          }
          updateSavedState(latestValue);
        } catch (error) {
          console.error('Failed to save editor contents', error);
        }
      });
    }

    // Call user's onMount handler if provided
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
    };
  }, [vimMode]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Editor
          theme={monacoTheme}
          options={mergedOptions}
          loading={loading}
          onMount={handleMount}
          value={currentValue}
          onChange={handleChange}
          defaultValue={defaultValue}
          {...forwardedEditorProps}
        />
      </div>
      {!hideStatusBar && (vimMode || onSave || !isControlled) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 8px',
            backgroundColor: theme.colors.backgroundSecondary,
            color: theme.colors.text,
            fontFamily: theme.fonts?.monospace || 'monospace',
            fontSize: theme.fontSizes?.[1] || 12,
            borderTop: `1px solid ${theme.colors.border}`,
          }}
        >
          {vimMode && (
            <div
              ref={vimStatusNodeRef}
              style={{ flex: 1, minHeight: '1em' }}
            />
          )}
          <div
            style={{
              marginLeft: vimMode ? 'auto' : 0,
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
