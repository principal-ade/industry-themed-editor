import {
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
import { ThemedMonacoDiffEditor } from '../src/components/ThemedMonacoDiffEditor';

const meta: Meta<typeof ThemedMonacoDiffEditor> = {
  title: 'Monaco Editor/ThemedMonacoDiffEditor',
  component: ThemedMonacoDiffEditor,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ThemedMonacoDiffEditor>;

const originalCode = `function fibonacci(n: number): number {
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

const modifiedCode = `function fibonacci(n: number): number {
  // Use memoization for better performance
  const memo: Record<number, number> = {};

  function fib(num: number): number {
    if (num <= 1) return num;
    if (memo[num]) return memo[num];
    memo[num] = fib(num - 1) + fib(num - 2);
    return memo[num];
  }

  return fib(n);
}

// Example usage with timing
const start = performance.now();
const result = fibonacci(10);
const end = performance.now();
console.log(\`Fibonacci(10) = \${result}\`);
console.log(\`Execution time: \${end - start}ms\`);

// Class example with error handling
class Calculator {
  constructor(private value: number = 0) {
    if (!Number.isFinite(value)) {
      throw new Error('Initial value must be a finite number');
    }
  }

  add(n: number): this {
    if (!Number.isFinite(n)) {
      throw new Error('Value must be a finite number');
    }
    this.value += n;
    return this;
  }

  subtract(n: number): this {
    if (!Number.isFinite(n)) {
      throw new Error('Value must be a finite number');
    }
    this.value -= n;
    return this;
  }

  multiply(n: number): this {
    if (!Number.isFinite(n)) {
      throw new Error('Value must be a finite number');
    }
    this.value *= n;
    return this;
  }

  getValue(): number {
    return this.value;
  }
}

const calc = new Calculator(10)
  .add(5)
  .subtract(3)
  .multiply(2)
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
          <ThemedMonacoDiffEditor
            theme={currentTheme}
            original={originalCode}
            modified={modifiedCode}
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
    original: originalCode,
    modified: modifiedCode,
    language: 'typescript',
    height: '600px',
    onMount: fn(),
  },
};

export const RegalTheme: Story = {
  args: {
    theme: regalTheme,
    original: originalCode,
    modified: modifiedCode,
    language: 'typescript',
    height: '600px',
    onMount: fn(),
  },
};

export const GlassmorphismTheme: Story = {
  args: {
    theme: glassmorphismTheme,
    original: originalCode,
    modified: modifiedCode,
    language: 'typescript',
    height: '600px',
    onMount: fn(),
  },
};

export const MatrixTheme: Story = {
  args: {
    theme: matrixTheme,
    original: originalCode,
    modified: modifiedCode,
    language: 'typescript',
    height: '600px',
    onMount: fn(),
  },
};

export const MatrixMinimalTheme: Story = {
  args: {
    theme: matrixMinimalTheme,
    original: originalCode,
    modified: modifiedCode,
    language: 'typescript',
    height: '600px',
    onMount: fn(),
  },
};

export const SlateTheme: Story = {
  args: {
    theme: slateTheme,
    original: originalCode,
    modified: modifiedCode,
    language: 'typescript',
    height: '600px',
    onMount: fn(),
  },
};

// Read-only example
export const ReadOnly: Story = {
  args: {
    theme: terminalTheme,
    original: originalCode,
    modified: modifiedCode,
    language: 'typescript',
    height: '600px',
    onMount: fn(),
    options: {
      readOnly: true,
    },
  },
};

// Inline view (unified diff)
export const InlineView: Story = {
  args: {
    theme: matrixTheme,
    original: originalCode,
    modified: modifiedCode,
    language: 'typescript',
    height: '600px',
    onMount: fn(),
    options: {
      renderSideBySide: false,
    },
  },
};

// Different language examples
const originalPython = `def fibonacci(n):
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

const modifiedPython = `def fibonacci(n):
    """Calculate fibonacci number with memoization."""
    memo = {}

    def fib(num):
        if num <= 1:
            return num
        if num in memo:
            return memo[num]
        memo[num] = fib(num - 1) + fib(num - 2)
        return memo[num]

    return fib(n)

# Example usage with timing
import time
start = time.time()
result = fibonacci(10)
end = time.time()
print(f"Fibonacci(10) = {result}")
print(f"Execution time: {end - start}s")

# Class example with error handling
class Calculator:
    def __init__(self, value=0):
        if not isinstance(value, (int, float)):
            raise ValueError("Initial value must be a number")
        self.value = value

    def add(self, n):
        if not isinstance(n, (int, float)):
            raise ValueError("Value must be a number")
        self.value += n
        return self

    def subtract(self, n):
        if not isinstance(n, (int, float)):
            raise ValueError("Value must be a number")
        self.value -= n
        return self

    def multiply(self, n):
        if not isinstance(n, (int, float)):
            raise ValueError("Value must be a number")
        self.value *= n
        return self

    def get_value(self):
        return self.value

calc = Calculator(10).add(5).subtract(3).multiply(2).get_value()
`;

export const PythonDiff: Story = {
  args: {
    theme: terminalTheme,
    original: originalPython,
    modified: modifiedPython,
    language: 'python',
    height: '600px',
    onMount: fn(),
  },
};

// Vim mode in unified view
export const VimModeUnified: Story = {
  args: {
    theme: terminalTheme,
    original: originalCode,
    modified: modifiedCode,
    language: 'typescript',
    height: '600px',
    vimMode: true,
    onMount: fn(),
    options: {
      renderSideBySide: false,
    },
  },
};

// Vim mode with Matrix theme
export const VimModeUnifiedMatrix: Story = {
  args: {
    theme: matrixTheme,
    original: originalCode,
    modified: modifiedCode,
    language: 'typescript',
    height: '600px',
    vimMode: true,
    onMount: fn(),
    options: {
      renderSideBySide: false,
    },
  },
};
