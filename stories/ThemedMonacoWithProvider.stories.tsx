import {
  ThemeProvider,
  terminalTheme,
  regalTheme,
  glassmorphismTheme,
  matrixTheme,
  matrixMinimalTheme,
  slateTheme,
  type Theme,
} from '@principal-ade/industry-theme';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import React, { useState } from 'react';
import { ThemedMonacoWithProvider } from '../src/components/ThemedMonacoWithProvider';

const meta: Meta<typeof ThemedMonacoWithProvider> = {
  title: 'Monaco Editor/ThemedMonacoWithProvider',
  component: ThemedMonacoWithProvider,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider theme={terminalTheme}>
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ThemedMonacoWithProvider>;

const sampleCode = `// ThemedMonacoWithProvider example
// This component automatically uses the theme from ThemeProvider context

interface User {
  id: number;
  name: string;
  email: string;
}

async function fetchUsers(): Promise<User[]> {
  const response = await fetch('/api/users');
  return response.json();
}

// React component example
const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers().then(setUsers);
  }, []);

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          {user.name} ({user.email})
        </li>
      ))}
    </ul>
  );
};
`;

const availableThemes: Record<string, Theme> = {
  Terminal: terminalTheme,
  Regal: regalTheme,
  Glassmorphism: glassmorphismTheme,
  Matrix: matrixTheme,
  'Matrix Minimal': matrixMinimalTheme,
  Slate: slateTheme,
};

// Interactive story with theme switcher using ThemeProvider
export const WithThemeProvider: Story = {
  render: () => {
    const [code, setCode] = useState(sampleCode);
    const [selectedTheme, setSelectedTheme] = useState<string>('Terminal');

    const currentTheme = availableThemes[selectedTheme];

    return (
      <ThemeProvider theme={currentTheme}>
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
              Theme (via ThemeProvider):
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
            <ThemedMonacoWithProvider
              value={code}
              onChange={(value) => setCode(value || '')}
              language="typescript"
              height="100%"
            />
          </div>
        </div>
      </ThemeProvider>
    );
  },
  decorators: [],
};

// Basic example
export const Basic: Story = {
  args: {
    value: sampleCode,
    language: 'typescript',
    height: '600px',
    onChange: fn(),
    onMount: fn(),
  },
};

// With custom options
export const CustomOptions: Story = {
  args: {
    value: sampleCode,
    language: 'typescript',
    height: '600px',
    onChange: fn(),
    onMount: fn(),
    options: {
      minimap: { enabled: true },
      lineNumbers: 'on',
      fontSize: 16,
    },
  },
};

// Read-only
export const ReadOnly: Story = {
  args: {
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

// Vim mode
export const VimMode: Story = {
  args: {
    value: sampleCode,
    language: 'typescript',
    height: '600px',
    vimMode: true,
    onChange: fn(),
    onMount: fn(),
  },
};

// Multi-file editor simulation
export const MultiFileEditor: Story = {
  render: () => {
    const files = {
      'index.ts': `export { ThemedMonacoEditor } from './ThemedMonacoEditor';
export { ThemedMonacoWithProvider } from './ThemedMonacoWithProvider';`,
      'ThemedMonacoEditor.tsx': `import React from 'react';
import Editor from '@monaco-editor/react';
import type { Theme } from '@a24z/industry-theme';

export const ThemedMonacoEditor: React.FC = () => {
  return <Editor />;
};`,
      'types.ts': `export interface Theme {
  colors: {
    background: string;
    text: string;
    primary: string;
  };
  fonts: {
    body: string;
    monospace: string;
  };
}`,
    };

    const [selectedFile, setSelectedFile] = useState<string>('index.ts');
    const [code, setCode] = useState(files['index.ts']);

    const handleFileChange = (filename: string) => {
      setSelectedFile(filename);
      setCode(files[filename as keyof typeof files]);
    };

    return (
      <ThemeProvider theme={terminalTheme}>
        <div
          style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: terminalTheme.colors.background,
          }}
        >
          <div
            style={{
              padding: '8px',
              backgroundColor: terminalTheme.colors.backgroundSecondary,
              borderBottom: `1px solid ${terminalTheme.colors.border}`,
              display: 'flex',
              gap: '4px',
            }}
          >
            {Object.keys(files).map((filename) => (
              <button
                key={filename}
                onClick={() => handleFileChange(filename)}
                style={{
                  padding: '8px 16px',
                  backgroundColor:
                    selectedFile === filename
                      ? terminalTheme.colors.backgroundTertiary
                      : 'transparent',
                  color: terminalTheme.colors.text,
                  border: 'none',
                  borderRadius: '4px 4px 0 0',
                  cursor: 'pointer',
                  fontFamily: terminalTheme.fonts.monospace,
                  fontSize: '13px',
                }}
              >
                {filename}
              </button>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            <ThemedMonacoWithProvider
              value={code}
              onChange={(value) => setCode(value || '')}
              language="typescript"
              height="100%"
            />
          </div>
        </div>
      </ThemeProvider>
    );
  },
  decorators: [],
};
