import { editorInfoField } from 'obsidian';
import { EditorView } from '@codemirror/view';
import { tokenClassNodeProp } from '@codemirror/language';
import { SyntaxNode } from '@lezer/common';

export function selectionAndRangeOverlap(view: EditorView, node: SyntaxNode) {
  // don't continue if current cursor position and inline code node (including formatting symbols) overlap
  const selection = view.state.selection;

  for (const range of selection.ranges) {
    if (range.from <= node.to + 1 && range.to >= node.from - 1) {
      return true;
    }
  }

  return false;
}

export function isInlineQuery(prefix: string, view: EditorView, node: SyntaxNode) {
  const text = getTextFromNode(view, node);
  return text.startsWith(prefix);
}

export function getProps(node: SyntaxNode) {
  const type = node.type;
  const tokenProps = type.prop<string>(tokenClassNodeProp);
  return new Set(tokenProps?.split(' '));
}

/**
 * In a note embedded in a Canvas, app.workspace.getActiveFile() returns
 * the canvas file, not the note file. On the other hand,
 * view.state.field(editorInfoField).file returns the note file itself.
 */
export function getCurrentFileFromView(view: EditorView) {
  return view.state.field(editorInfoField).file;
}

export function getText(view: EditorView, from: number, to: number) {
  return view.state.doc.sliceString(from, to);
}

export function getTextFromNode(view: EditorView, node: SyntaxNode) {
  return getText(view, node.from, node.to);
}
