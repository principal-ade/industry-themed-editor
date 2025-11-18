# @principal-ade/industry-themed-monaco

A Monaco editor wrapper that seamlessly integrates with [@principal-ade/industry-theme](https://www.npmjs.com/package/@principal-ade/industry-theme), providing a themed code editor experience that matches your application's industry theme.

## Features

- 🎨 **Automatic theming** - Editor theme automatically adapts to your industry-theme colors
- 🔧 **Fully typed** - Complete TypeScript support with industry-theme integration
- 📦 **Lightweight** - Minimal wrapper around Monaco editor
- ⚡ **Easy to use** - Works standalone or with ThemeProvider
- 🎯 **Configurable** - Full access to Monaco editor options
- ⌨️ **Vim mode support** - Built-in Vim keybindings with status bar

## Installation

```bash
npm install @principal-ade/industry-themed-monaco @principal-ade/industry-theme @monaco-editor/react monaco-editor
```

or with bun:

```bash
bun add @principal-ade/industry-themed-monaco @principal-ade/industry-theme @monaco-editor/react monaco-editor
```

## Usage

### With ThemeProvider (Recommended)

The easiest way to use the editor is with `ThemedMonacoWithProvider`, which automatically pulls the theme from React context:

```tsx
import React, { useState } from 'react';
import { ThemeProvider, terminalTheme } from '@principal-ade/industry-theme';
import { ThemedMonacoWithProvider } from '@principal-ade/industry-themed-monaco';

function App() {
  const [code, setCode] = useState('// Start coding...');

  return (
    <ThemeProvider theme={terminalTheme}>
      <div style={{ height: '100vh' }}>
        <ThemedMonacoWithProvider
          value={code}
          onChange={(value) => setCode(value || '')}
          language="typescript"
          height="100%"
        />
      </div>
    </ThemeProvider>
  );
}
```

### Standalone (Without ThemeProvider)

You can also use `ThemedMonacoEditor` directly by passing a theme object:

```tsx
import React, { useState } from 'react';
import { terminalTheme } from '@principal-ade/industry-theme';
import { ThemedMonacoEditor } from '@principal-ade/industry-themed-monaco';

function CodeEditor() {
  const [code, setCode] = useState('console.log("Hello, World!");');

  return (
    <ThemedMonacoEditor
      theme={terminalTheme}
      value={code}
      onChange={(value) => setCode(value || '')}
      language="javascript"
      height="400px"
    />
  );
}
```

### Uncontrolled editing with save shortcuts

`ThemedMonacoEditor` can manage its own value when you omit the `value` prop. Provide an `initialValue` and an `onSave` callback to let the component keep track of dirty state, show a Saved/Unsaved badge, and hook into `Ctrl/Cmd + S`:

```tsx
import { useCallback, useState } from 'react';
import { terminalTheme } from '@principal-ade/industry-theme';
import { ThemedMonacoEditor } from '@principal-ade/industry-themed-monaco';

function FileEditor({ filePath }: { filePath: string }) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleSave = useCallback(
    async (contents: string) => {
      setStatus('saving');
      try {
        const response = await fetch(`/api/files/${encodeURIComponent(filePath)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'text/plain' },
          body: contents,
        });
        if (!response.ok) {
          throw new Error('Failed to save file');
        }
        setStatus('saved');
      } catch (error) {
        console.error(error);
        setStatus('error');
        throw error;
      }
    },
    [filePath]
  );

  return (
    <div style={{ height: '100%' }}>
      <ThemedMonacoEditor
        theme={terminalTheme}
        filePath={filePath}
        initialValue={'// Contents fetched from your backend'}
        language="typescript"
        height="100%"
        onSave={handleSave}
        onDirtyChange={(dirty) => dirty && setStatus('idle')}
      />
      <div>{status === 'saving' ? 'Saving…' : status === 'error' ? 'Save failed' : null}</div>
    </div>
  );
}
```

> ℹ️ Fetch the initial file contents from your backend, pass them into `initialValue`, and reuse the same endpoint inside `onSave`. The save callback can be synchronous or return a promise—`ThemedMonacoEditor` waits for it to resolve before clearing the dirty badge.

Disable the keyboard shortcut entirely by setting `enableSaveShortcut={false}` when you want to handle save triggers in your own UI.

### Advanced Usage

You can pass any Monaco editor options through the `options` prop:

```tsx
import { ThemedMonacoWithProvider } from '@principal-ade/industry-themed-monaco';

function AdvancedEditor() {
  return (
    <ThemedMonacoWithProvider
      value={code}
      onChange={setCode}
      language="typescript"
      height="600px"
      options={{
        minimap: { enabled: true },
        fontSize: 14,
        lineNumbers: 'on',
        readOnly: false,
        wordWrap: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
      }}
    />
  );
}
```

### Vim Mode

Enable Vim keybindings with the `vimMode` prop. This adds Vim-style navigation and editing commands, along with a status bar showing the current mode:

```tsx
import { ThemedMonacoWithProvider } from '@principal-ade/industry-themed-monaco';

function VimEditor() {
  return (
    <ThemedMonacoWithProvider
      value={code}
      onChange={setCode}
      language="typescript"
      height="600px"
      vimMode={true}  // Enable Vim mode
    />
  );
}
```

When Vim mode is enabled:
- A status bar appears at the bottom showing the current mode (Normal, Insert, Visual, etc.)
- Standard Vim keybindings are available (i, a, o for insert mode, hjkl for navigation, etc.)
- The status bar is styled to match your theme

You can also toggle Vim mode dynamically:

```tsx
function ToggleableVimEditor() {
  const [vimEnabled, setVimEnabled] = useState(false);

  return (
    <>
      <button onClick={() => setVimEnabled(!vimEnabled)}>
        {vimEnabled ? 'Disable' : 'Enable'} Vim Mode
      </button>
      <ThemedMonacoWithProvider
        value={code}
        onChange={setCode}
        language="typescript"
        height="600px"
        vimMode={vimEnabled}
      />
    </>
  );
}
```

### Custom Loading Component

Provide a custom loading component that matches your theme:

```tsx
import { ThemedMonacoEditor } from '@principal-ade/industry-themed-monaco';
import { terminalTheme } from '@a24z/industry-theme';

function EditorWithCustomLoading() {
  return (
    <ThemedMonacoEditor
      theme={terminalTheme}
      value={code}
      onChange={setCode}
      language="python"
      loadingComponent={
        <div style={{
          color: terminalTheme.colors.primary,
          padding: 20,
          textAlign: 'center'
        }}>
          Loading editor...
        </div>
      }
    />
  );
}
```

## Available Themes

The package works with all themes from `@principal-ade/industry-theme`:

```tsx
import {
  terminalTheme,
  regalTheme,
  glassmorphismTheme,
  matrixTheme,
  matrixMinimalTheme,
  slateTheme,
} from '@principal-ade/industry-theme';
```

## API Reference

### `ThemedMonacoEditor`

The base editor component that accepts a theme prop.

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `theme` | `Theme` | Yes | Industry theme object |
| `value` | `string` | No | Current editor value |
| `onChange` | `(value: string \| undefined) => void` | No | Callback when value changes |
| `language` | `string` | No | Programming language (e.g., 'typescript', 'javascript', 'python') |
| `height` | `string \| number` | No | Editor height (default: '100%') |
| `width` | `string \| number` | No | Editor width (default: '100%') |
| `options` | `monaco.editor.IStandaloneEditorConstructionOptions` | No | Monaco editor options |
| `loadingComponent` | `React.ReactNode` | No | Custom loading component |
| `vimMode` | `boolean` | No | Enable Vim mode keybindings (default: false) |

Plus all other props from `@monaco-editor/react`'s `EditorProps`.

### `ThemedMonacoWithProvider`

A convenience component that automatically uses the theme from `ThemeProvider` context.

#### Props

Same as `ThemedMonacoEditor` but without the `theme` prop (automatically pulled from context).

## Examples

### Read-only Code Viewer

```tsx
<ThemedMonacoWithProvider
  value={sourceCode}
  language="typescript"
  options={{ readOnly: true }}
  height="500px"
/>
```

### Multi-language Editor

```tsx
function MultiLanguageEditor() {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');

  return (
    <>
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="javascript">JavaScript</option>
        <option value="typescript">TypeScript</option>
        <option value="python">Python</option>
        <option value="json">JSON</option>
      </select>
      <ThemedMonacoWithProvider
        value={code}
        onChange={setCode}
        language={language}
        height="400px"
      />
    </>
  );
}
```

## Monaco Worker Configuration

The package automatically configures Monaco editor workers for the browser environment. If you need custom worker paths, you can configure them before importing the component:

```tsx
window.MonacoEnvironment = {
  getWorkerUrl: (moduleId: string, label: string) => {
    // Your custom worker configuration
  }
};
```

## License

MIT

## Contributing

Contributions are welcome! Please check the [repository](https://github.com/principal-ade/industry-themed-monaco) for guidelines.

## Related Packages

- [@principal-ade/industry-theme](https://www.npmjs.com/package/@principal-ade/industry-theme) - Theme system
- [themed-markdown](https://www.npmjs.com/package/themed-markdown) - Themed markdown renderer
- [@monaco-editor/react](https://www.npmjs.com/package/@monaco-editor/react) - React wrapper for Monaco

## Support

For issues and questions, please visit the [GitHub repository](https://github.com/principal-ade/industry-themed-monaco/issues).
