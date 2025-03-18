import { App, TFile } from 'obsidian';
import { Decoration, EditorView } from '@codemirror/view';
import { SyntaxNode } from '@lezer/common';
import Parser from './parser';
import { getText, getTextFromNode } from './helper';
import { Literal, BPSettings } from './types';
import { InlineWidget } from './widget';

export type RenderedHTML = [HTMLSpanElement | null, string | null];

export class Renderer {
  app: App;
  parser: Parser;
  settings: BPSettings;

  constructor(app: App, settings: BPSettings) {
    this.app = app;
    this.parser = new Parser(app);
    this.settings = settings;
  }

  renderHtml(code: string): RenderedHTML {
    /* If the query result is predefined text (e.g. in the case of errors), set innerText to it.
     * Otherwise, pass on an empty element and fill it in later.
     * This is necessary because {@link InlineWidget.toDOM} is synchronous but some rendering
     * asynchronous.
     */
    if (code.startsWith(this.settings.initializer)) {
      let content: string = '';
      let result: Literal = '';
      const renderRootElement = createSpan({
        cls: ['betterpnp', 'betterpnp-inline'],
      });
      content = code.substring(this.settings.initializer.length).trim();
      try {
        this.renderFieldFromInput(content).then(result => (renderRootElement.innerHTML = result));
      } catch (error) {
        result = `Error for '${content}': ${error} \n\n${error.stack}}`;
        renderRootElement.innerText = result;
      }
      return [renderRootElement, content];
    }
    return [null, null];
  }

  renderWidget(node: SyntaxNode, view: EditorView) {
    // safety net against unclosed inline code
    if (getText(view, node.to, node.to + 1) === '\n') return;

    const text = getTextFromNode(view, node);
    const [el, content] = this.renderHtml(text);
    if (el === null || content === null) return;

    return Decoration.replace({
      widget: new InlineWidget([], content, el, view),
      inclusive: false,
      block: false,
    }).range(node.from - 1, node.to + 1);
  }

  async renderFieldFromInput(content: string) {
    const file = this.app.workspace.getActiveFile();
    if (file === null) return 'Could not fetch active file';

    let output = '';
    await this.app.fileManager.processFrontMatter(file, frontmatter => {
      output = this.parser.parseEntry(content, frontmatter);
    });
    return output;
  }
}
