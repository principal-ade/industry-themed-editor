/**
 * @principal-ade/industry-themed-monaco
 *
 * A Monaco editor wrapper that integrates with @a24z/industry-theme
 */

// Main components
export { ThemedMonacoEditor } from './src/components/ThemedMonacoEditor';
export type { ThemedMonacoEditorProps } from './src/components/ThemedMonacoEditor';

export { ThemedMonacoWithProvider } from './src/components/ThemedMonacoWithProvider';
export type { ThemedMonacoWithProviderProps } from './src/components/ThemedMonacoWithProvider';

// Re-export types from @a24z/industry-theme for convenience
export type { Theme } from '@a24z/industry-theme';
