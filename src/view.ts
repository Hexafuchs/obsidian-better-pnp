import { App, Component, editorLivePreviewField, MetadataCache, TFile } from 'obsidian';
import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { Range, StateEffect, StateEffectType } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import { SyntaxNode } from '@lezer/common';
import { PluginValue } from '@codemirror/view';
import { selectionAndRangeOverlap, isInlineQuery, getProps, getCurrentFileFromView } from './helper';
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
      oldFrontmatter: any;
      metadataCache: MetadataCache;
      file: TFile | null;
      debounceTask: NodeJS.Timeout;

      constructor(view: EditorView) {
        this.renderer = new Renderer(app, settings);
        this.component = new Component();
        this.component.load();
        this.decorations = this.inlineRender(view) ?? Decoration.none;
        this.decorationEffect = StateEffect.define();
        this.frontmatterIsDirty = false;
        this.oldFrontmatter = null;
        this.metadataCache = app.metadataCache;
        this.file = app.workspace.getActiveFile();

        if (this.file) {
          this.metadataCache.on('changed', changedFile => {
            if (changedFile.path === this.file?.path) {
              // Debounce logic here
              clearTimeout(this.debounceTask);
              this.debounceTask = setTimeout(() => {
                this.frontmatterIsDirty = true;
              }, 250); // 250ms debounce
            }
          });
        }
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
        //if (props.has("hmd-frontmatter")) {
        //    const file = app.workspace.getActiveFile();
        //    if (file !== null) {
        //        app.fileManager.processFrontMatter(file, (frontmatter) => {
        //            if (JSON.stringify(frontmatter) != JSON.stringify(this.oldFrontmatter)) {
        //                this.oldFrontmatter = structuredClone(frontmatter);
        //                this.frontmatterIsDirty = true;
        //            }
        //        });
        //    }
        // }

        // check if current node is inline code
        if (!props.has('inline-code') || props.has('formatting')) {
          return { render: false, isQuery: false };
        }
        return {
          render: !selectionAndRangeOverlap(view, node),
          isQuery: isInlineQuery(settings.initializer, view, node),
        };
      }

      addDeco(node: SyntaxNode, view: EditorView) {
        let exists = false;
        //console.log("A")
        //console.log(this.decorations);
        this.decorations.between(node.from - 1, node.to + 1, () => {
          exists = true;
        });
        if (exists) {
          if (!this.frontmatterIsDirty) {
            return;
          }
          //console.log("B")
          this.removeDeco(node);
        }

        const currentFile = getCurrentFileFromView(view);
        if (!currentFile) return;

        const newDeco = this.renderer.renderWidget(node, view, currentFile)?.value;
        if (!newDeco) return;

        this.decorations = this.decorations.update({
          add: [{ from: node.from - 1, to: node.to + 1, value: newDeco }],
        });
        this.frontmatterIsDirty = false;
        //console.log(this.decorations);
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
              const widget = this.renderer.renderWidget(node, view, currentFile);
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
          //console.log(deco.spec.widget.el);
          //console.log(deco.spec.widget.el.innerText)
          //console.log(deco.spec.widget.el.innerHTML)
          cursor.next();
          deco = cursor.value;
        }
        return v.decorations;
      },
    }
  );
}
