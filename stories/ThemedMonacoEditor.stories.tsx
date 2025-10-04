import {
  terminalTheme,
  regalTheme,
  glassmorphismTheme,
  matrixTheme,
  matrixMinimalTheme,
  slateTheme,
  type Theme,
} from '@a24z/industry-theme';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import React, { useState } from 'react';
import { ThemedMonacoEditor } from '../src/components/ThemedMonacoEditor';

const meta: Meta<typeof ThemedMonacoEditor> = {
  title: 'Monaco Editor/ThemedMonacoEditor',
  component: ThemedMonacoEditor,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ThemedMonacoEditor>;

const sampleCode = `function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Example usage
const result = fibonacci(10);
console.log(\`Fibonacci(10) = \${result}\`);

// Class example
class Calculator {
  constructor(private value: number = 0) {}

  add(n: number): this {
    this.value += n;
    return this;
  }

  subtract(n: number): this {
    this.value -= n;
    return this;
  }

  getValue(): number {
    return this.value;
  }
}

const calc = new Calculator(10)
  .add(5)
  .subtract(3)
  .getValue();
`;

const availableThemes: Record<string, Theme> = {
  Terminal: terminalTheme,
  Regal: regalTheme,
  Glassmorphism: glassmorphismTheme,
  Matrix: matrixTheme,
  'Matrix Minimal': matrixMinimalTheme,
  Slate: slateTheme,
};

// Interactive story with theme switcher
export const ThemeSwitcher: Story = {
  render: () => {
    const [code, setCode] = useState(sampleCode);
    const [selectedTheme, setSelectedTheme] = useState<string>('Terminal');

    const currentTheme = availableThemes[selectedTheme];

    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: currentTheme.colors.background,
        }}
      >
        <div
          style={{
            padding: '16px',
            backgroundColor: currentTheme.colors.backgroundSecondary,
            borderBottom: `1px solid ${currentTheme.colors.border}`,
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              color: currentTheme.colors.text,
              fontFamily: currentTheme.fonts.body,
              alignSelf: 'center',
              marginRight: '8px',
            }}
          >
            Theme:
          </span>
          {Object.keys(availableThemes).map((themeName) => (
            <button
              key={themeName}
              onClick={() => setSelectedTheme(themeName)}
              style={{
                padding: '8px 16px',
                backgroundColor:
                  selectedTheme === themeName
                    ? currentTheme.colors.primary
                    : currentTheme.colors.muted,
                color:
                  selectedTheme === themeName
                    ? '#ffffff'
                    : currentTheme.colors.text,
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: currentTheme.fonts.body,
                fontSize: '14px',
              }}
            >
              {themeName}
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }}>
          <ThemedMonacoEditor
            theme={currentTheme}
            value={code}
            onChange={(value) => setCode(value || '')}
            language="typescript"
            height="100%"
          />
        </div>
      </div>
    );
  },
};

// Individual theme stories
export const TerminalTheme: Story = {
  args: {
    theme: terminalTheme,
    value: sampleCode,
    language: 'typescript',
    height: '600px',
    onChange: fn(),
    onMount: fn(),
  },
};

export const RegalTheme: Story = {
  args: {
    theme: regalTheme,
    value: sampleCode,
    language: 'typescript',
    height: '600px',
    onChange: fn(),
    onMount: fn(),
  },
};

export const GlassmorphismTheme: Story = {
  args: {
    theme: glassmorphismTheme,
    value: sampleCode,
    language: 'typescript',
    height: '600px',
    onChange: fn(),
    onMount: fn(),
  },
};

export const MatrixTheme: Story = {
  args: {
    theme: matrixTheme,
    value: sampleCode,
    language: 'typescript',
    height: '600px',
    onChange: fn(),
    onMount: fn(),
  },
};

export const MatrixMinimalTheme: Story = {
  args: {
    theme: matrixMinimalTheme,
    value: sampleCode,
    language: 'typescript',
    height: '600px',
    onChange: fn(),
    onMount: fn(),
  },
};

export const SlateTheme: Story = {
  args: {
    theme: slateTheme,
    value: sampleCode,
    language: 'typescript',
    height: '600px',
    onChange: fn(),
    onMount: fn(),
  },
};

// Read-only example
export const ReadOnly: Story = {
  args: {
    theme: terminalTheme,
    value: sampleCode,
    language: 'typescript',
    height: '600px',
    onChange: fn(),
    onMount: fn(),
    options: {
      readOnly: true,
    },
  },
};

// Different language examples
const pythonCode = `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

# Example usage
result = fibonacci(10)
print(f"Fibonacci(10) = {result}")

# Class example
class Calculator:
    def __init__(self, value=0):
        self.value = value

    def add(self, n):
        self.value += n
        return self

    def subtract(self, n):
        self.value -= n
        return self

    def get_value(self):
        return self.value

calc = Calculator(10).add(5).subtract(3).get_value()
`;

export const PythonEditor: Story = {
  args: {
    theme: terminalTheme,
    value: pythonCode,
    language: 'python',
    height: '600px',
    onChange: fn(),
    onMount: fn(),
  },
};

const jsonCode = `{
  "name": "@principal-ade/industry-themed-monaco",
  "version": "0.1.0",
  "description": "Industry-themed Monaco editor wrapper",
  "main": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "dependencies": {
    "@a24z/industry-theme": "^0.1.1"
  },
  "peerDependencies": {
    "@monaco-editor/react": ">=4.0.0",
    "monaco-editor": ">=0.50.0",
    "react": ">=19.0.0",
    "react-dom": ">=19.0.0"
  }
}`;

export const JSONEditor: Story = {
  args: {
    theme: matrixTheme,
    value: jsonCode,
    language: 'json',
    height: '600px',
    onChange: fn(),
    onMount: fn(),
  },
};

// Vim mode example
export const VimMode: Story = {
  args: {
    theme: terminalTheme,
    value: sampleCode,
    language: 'typescript',
    height: '600px',
    vimMode: true,
    onChange: fn(),
    onMount: fn(),
  },
};

// Vim mode with Matrix theme
export const VimModeMatrix: Story = {
  args: {
    theme: matrixTheme,
    value: sampleCode,
    language: 'typescript',
    height: '600px',
    vimMode: true,
    onChange: fn(),
    onMount: fn(),
  },
};

// Save functionality example
export const WithSaveSupport: Story = {
  render: () => {
    const [lastSaved, setLastSaved] = useState<string>('Never');
    const [isDirty, setIsDirty] = useState(false);

    const handleSave = (value: string, context: { filePath?: string }) => {
      console.log('Saving file:', context.filePath, 'with content:', value);
      setLastSaved(new Date().toLocaleTimeString());
    };

    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            padding: '16px',
            backgroundColor: terminalTheme.colors.backgroundSecondary,
            borderBottom: `1px solid ${terminalTheme.colors.border}`,
            color: terminalTheme.colors.text,
            fontFamily: terminalTheme.fonts.body,
          }}
        >
          <div>Press <kbd>Ctrl/Cmd+S</kbd> to save</div>
          <div>Last saved: {lastSaved}</div>
          <div>Dirty: {isDirty ? 'Yes' : 'No'}</div>
        </div>
        <div style={{ flex: 1 }}>
          <ThemedMonacoEditor
            theme={terminalTheme}
            initialValue={sampleCode}
            language="typescript"
            height="100%"
            filePath="example.ts"
            onSave={handleSave}
            onDirtyChange={setIsDirty}
          />
        </div>
      </div>
    );
  },
};

// Custom UI with hidden status bar
export const CustomStatusBar: Story = {
  render: () => {
    const [lastSaved, setLastSaved] = useState<string>('Never');
    const [isDirty, setIsDirty] = useState(false);
    const currentFile = 'example.ts';

    const handleSave = (value: string, context: { filePath?: string }) => {
      console.log('Saving file:', context.filePath, 'with content:', value);
      setLastSaved(new Date().toLocaleTimeString());
    };

    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Custom header bar with file info and status */}
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: matrixTheme.colors.backgroundSecondary,
            borderBottom: `2px solid ${matrixTheme.colors.primary}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span
              style={{
                color: matrixTheme.colors.text,
                fontFamily: matrixTheme.fonts.monospace,
                fontSize: '14px',
                fontWeight: 'bold',
              }}
            >
              {currentFile}
              {isDirty && (
                <span style={{ color: matrixTheme.colors.primary }}> ●</span>
              )}
            </span>
            <span
              style={{
                color: matrixTheme.colors.textSecondary,
                fontFamily: matrixTheme.fonts.body,
                fontSize: '12px',
              }}
            >
              TypeScript
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                color: isDirty ? matrixTheme.colors.primary : matrixTheme.colors.success,
                fontFamily: matrixTheme.fonts.body,
                fontSize: '12px',
              }}
            >
              {isDirty ? '⚠ Unsaved changes' : '✓ All changes saved'}
            </span>
            <span
              style={{
                color: matrixTheme.colors.textSecondary,
                fontFamily: matrixTheme.fonts.body,
                fontSize: '12px',
              }}
            >
              Last saved: {lastSaved}
            </span>
          </div>
        </div>

        {/* Editor with hidden status bar */}
        <div style={{ flex: 1 }}>
          <ThemedMonacoEditor
            theme={matrixTheme}
            initialValue={sampleCode}
            language="typescript"
            height="100%"
            filePath={currentFile}
            onSave={handleSave}
            onDirtyChange={setIsDirty}
            hideStatusBar={true}
          />
        </div>

        {/* Custom footer */}
        <div
          style={{
            padding: '8px 16px',
            backgroundColor: matrixTheme.colors.backgroundSecondary,
            borderTop: `1px solid ${matrixTheme.colors.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              color: matrixTheme.colors.textSecondary,
              fontFamily: matrixTheme.fonts.monospace,
              fontSize: '11px',
            }}
          >
            Press Ctrl/Cmd+S to save
          </span>
          <span
            style={{
              color: matrixTheme.colors.textSecondary,
              fontFamily: matrixTheme.fonts.monospace,
              fontSize: '11px',
            }}
          >
            UTF-8 | LF
          </span>
        </div>
      </div>
    );
  },
};
