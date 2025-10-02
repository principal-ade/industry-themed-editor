import { useTheme } from '@a24z/industry-theme';
import React from 'react';
import { ThemedMonacoEditor, ThemedMonacoEditorProps } from './ThemedMonacoEditor';

/**
 * Props for ThemedMonacoWithProvider (theme is automatically pulled from context)
 */
export type ThemedMonacoWithProviderProps = Omit<ThemedMonacoEditorProps, 'theme'> & {
  /**
   * Enable Vim mode keybindings
   */
  vimMode?: boolean;
};

/**
 * A Monaco editor component that automatically uses the theme from ThemeProvider context.
 * Must be used within a ThemeProvider.
 *
 * @example
 * ```tsx
 * import { ThemeProvider, terminalTheme } from '@a24z/industry-theme';
 * import { ThemedMonacoWithProvider } from '@principal-ade/industry-themed-monaco';
 *
 * function App() {
 *   return (
 *     <ThemeProvider theme={terminalTheme}>
 *       <ThemedMonacoWithProvider
 *         value={code}
 *         onChange={setCode}
 *         language="typescript"
 *         height="400px"
 *       />
 *     </ThemeProvider>
 *   );
 * }
 * ```
 */
export const ThemedMonacoWithProvider: React.FC<ThemedMonacoWithProviderProps> = (props) => {
  const { theme } = useTheme();
  return <ThemedMonacoEditor theme={theme} {...props} />;
};
