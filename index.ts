/**
 * @principal-ade/industry-themed-monaco
 *
 * A Monaco editor wrapper that integrates with @principal-ade/industry-theme
 */

// Main components
export { ThemedMonacoEditor } from './src/components/ThemedMonacoEditor';
export type { ThemedMonacoEditorProps } from './src/components/ThemedMonacoEditor';

export { ThemedMonacoDiffEditor } from './src/components/ThemedMonacoDiffEditor';
export type { ThemedMonacoDiffEditorProps } from './src/components/ThemedMonacoDiffEditor';

export { ThemedMonacoWithProvider } from './src/components/ThemedMonacoWithProvider';
export type { ThemedMonacoWithProviderProps } from './src/components/ThemedMonacoWithProvider';

// Re-export types from @principal-ade/industry-theme for convenience
export type { Theme } from '@principal-ade/industry-theme';
