import {
  App,
  Component,
  editorLivePreviewField,
  MarkdownPostProcessorContext,
  MarkdownRenderChild,
  MetadataCache,
  TFile,
} from 'obsidian';
import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { Range, StateEffect, StateEffectType } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import { SyntaxNode } from '@lezer/common';
import { PluginValue } from '@codemirror/view';
import { selectionAndRangeOverlap, isInlineQuery, getProps, getCurrentFileFromView, isInlineQueryNode } from './helper';
import { BPSettings } from './types';
import { Renderer } from './render';

export default function viewInlinePlugin(app: App, settings: BPSettings) {
  return ViewPlugin.fromClass(
    class implements PluginValue {
      decorations: DecorationSet;
      decorationEffect: StateEffectType<DecorationSet>;
      component: Component;
      renderer: Renderer;
      frontmatterIsDirty: boolean;
      frontmatterObserver: FrontmatterObserver;

      constructor(view: EditorView) {
        this.renderer = new Renderer(app, settings);
        this.component = new Component();
        this.component.load();
        this.decorations = this.inlineRender(view) ?? Decoration.none;
        this.decorationEffect = StateEffect.define();
        this.frontmatterIsDirty = false;
        this.frontmatterObserver = new FrontmatterObserver(app, () => (this.frontmatterIsDirty = true));
      }

      private checkIfLivePreviewMode(update: ViewUpdate) {
        return update.state.field(editorLivePreviewField);
      }

      update(update: ViewUpdate) {
        if (!this.checkIfLivePreviewMode(update)) {
          this.decorations = Decoration.none;
          return;
        }
        if (update.docChanged) {
          this.decorations = this.decorations.map(update.changes);
          this.updateTree(update.view);
        } else if (update.selectionSet) {
          this.updateTree(update.view);
        } else if (update.viewportChanged /*|| update.selectionSet*/) {
          this.decorations = this.inlineRender(update.view) ?? Decoration.none;
        }
      }

      updateTree(view: EditorView) {
        for (const { from, to } of view.visibleRanges) {
          syntaxTree(view.state).iterate({
            from,
            to,
            enter: ({ node }) => {
              const { render, isQuery } = this.shouldRenderNode(view, node);
              if (!render && isQuery) {
                this.removeDeco(node);
                return;
              } else if (!render) {
                return;
              } else {
                this.addDeco(node, view);
              }
            },
          });
        }
      }

      shouldRenderNode(view: EditorView, node: SyntaxNode) {
        const props = getProps(node);

        // check if current node is inline code
        if (!props.has('inline-code') || props.has('formatting')) {
          return { render: false, isQuery: false };
        }
        return {
          render: !selectionAndRangeOverlap(view, node),
          isQuery: isInlineQueryNode(settings.initializer, view, node),
        };
      }

      addDeco(node: SyntaxNode, view: EditorView) {
        let exists = false;
        this.decorations.between(node.from - 1, node.to + 1, () => {
          exists = true;
        });
        if (exists) {
          if (!this.frontmatterIsDirty) {
            return;
          }
          this.removeDeco(node);
        }

        const currentFile = getCurrentFileFromView(view);
        if (!currentFile) return;

        const newDeco = this.renderer.renderWidget(node, view)?.value;
        if (!newDeco) return;

        this.decorations = this.decorations.update({
          add: [{ from: node.from - 1, to: node.to + 1, value: newDeco }],
        });
        this.frontmatterIsDirty = false;
      }

      removeDeco(node: SyntaxNode) {
        this.decorations.between(node.from - 1, node.to + 1, (from, to) => {
          this.decorations = this.decorations.update({
            filterFrom: from,
            filterTo: to,
            filter: () => false,
          });
        });
      }

      inlineRender(view: EditorView) {
        const currentFile = getCurrentFileFromView(view);
        if (!currentFile) return;

        const widgets: Range<Decoration>[] = [];

        for (const { from, to } of view.visibleRanges) {
          syntaxTree(view.state).iterate({
            from,
            to,
            enter: ({ node }) => {
              if (!this.shouldRenderNode(view, node).render) return;
              const widget = this.renderer.renderWidget(node, view);
              if (widget) widgets.push(widget);
            },
          });
        }

        return Decoration.set(widgets, true);
      }

      destroy() {
        this.component.unload();
      }
    },
    {
      decorations: v => {
        const cursor = v.decorations.iter();
        let deco = cursor.value;
        while (deco !== null) {
          cursor.next();
          deco = cursor.value;
        }
        return v.decorations;
      },
    }
  );
}

export function viewRender(
  el: HTMLElement,
  component: Component | MarkdownPostProcessorContext,
  sourcePath: string,
  settings: BPSettings,
  app: App
) {
  // Search for <code> blocks inside this element; for each one, look for things of the form `= ...`.
  const codeblocks = el.querySelectorAll('code');
  for (let index = 0; index < codeblocks.length; index++) {
    const codeblock = codeblocks.item(index);

    // Skip code inside of pre elements
    if (codeblock.parentElement && codeblock.parentElement.nodeName.toLowerCase() == 'pre') continue;

    const text = codeblock.innerText.trim();
    if (!isInlineQuery(settings.initializer, text)) {
      continue;
    }
    component.addChild(new ViewRenderPlugin(text, el, codeblock, app, settings));
  }
}

type FrontmatterCallback = (frontmatter: any) => void;

export class FrontmatterObserver {
  metadataCache: MetadataCache;
  file: TFile;
  debounceTask: NodeJS.Timeout;
  oldFrontmatter: any;
  running: boolean = true;

  public constructor(
    public app: App,
    public callback: FrontmatterCallback
  ) {
    this.metadataCache = app.metadataCache;
    const file = app.workspace.getActiveFile();
    if (file === null) return;
    this.file = file;

    this.metadataCache.on('changed', this.run);
  }

  stop() {
    this.running = false;
    this.metadataCache.off('changed', this.run);
  }

  run(changedFile: TFile) {
    if (this === undefined || !this.running) {
      return;
    }
    if (changedFile.path === this.file.path) {
      // Debounce logic here
      clearTimeout(this.debounceTask);
      this.debounceTask = setTimeout(() => {
        this.app.fileManager.processFrontMatter(this.file, frontmatter => {
          if (JSON.stringify(frontmatter) != JSON.stringify(this.oldFrontmatter)) {
            this.oldFrontmatter = structuredClone(frontmatter);
            this.callback(structuredClone(frontmatter));
          }
        });
      }, 400); // 400ms debounce
    }
  }
}

export class ViewRenderPlugin extends MarkdownRenderChild {
  renderer: Renderer;
  frontmatterObserver: FrontmatterObserver;
  oldElement: HTMLElement | null = null;

  public constructor(
    public code: string,
    public container: HTMLElement,
    public codeblock: HTMLElement,
    public app: App,
    public settings: BPSettings
  ) {
    super(container);
    this.renderer = new Renderer(app, settings);
    this.frontmatterObserver = new FrontmatterObserver(app, () => this.render());
  }

  onload() {
    this.render();
    // when the DOM is shown (sidebar expands, tab selected, nodes scrolled into view).
    //this.register(this.container.onNodeInserted(this.render));
  }

  onunload() {
    this.frontmatterObserver.stop();
  }

  render() {
    const [el, content] = this.renderer.renderHtml(this.code);
    if (el === null || content === null) return;

    if (this.oldElement === null) {
      this.codeblock.replaceWith(el);
    } else {
      this.oldElement.replaceWith(el);
    }
    this.oldElement = el;
  }
}
