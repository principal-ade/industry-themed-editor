declare module 'monaco-vim' {
  import type * as monaco from 'monaco-editor';

  export interface VimMode {
    dispose: () => void;
  }

  export function initVimMode(
    editor: monaco.editor.IStandaloneCodeEditor,
    statusNode?: HTMLElement
  ): VimMode;
}
