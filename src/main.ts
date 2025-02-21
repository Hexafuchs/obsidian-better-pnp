import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, Component, editorInfoField, editorLivePreviewField, TFile } from 'obsidian';
import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate, WidgetType } from "@codemirror/view";
import { EditorSelection, Range, Extension } from "@codemirror/state";
import { syntaxTree, tokenClassNodeProp } from "@codemirror/language";
import { SyntaxNode } from "@lezer/common";
import { DateTime, Duration } from "luxon";
import Parser from './parser';

export type Literal =
    | boolean
    | number
    | string
    | DateTime
    | Duration
    | Array<Literal>
    | Function
    | null
    | HTMLElement;

interface BPSettings {
	initializer: string;
}

const DEFAULT_SETTINGS: BPSettings = {
	initializer: '#'
}

export default class BPPlugin extends Plugin {
	settings: BPSettings;

	private codeMirrorExtensions: Extension[];

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new BPSettingTab(this.app, this));

		this.registerEditorExtension(
			this.inlinePlugin(this.app, this.settings)
		);
	}

	inlinePlugin(app: App, settings: BPSettings) {
		return ViewPlugin.fromClass(
			class {
				decorations: DecorationSet;
				component: Component;
				parser: Parser;

				constructor(view: EditorView) {
					this.parser = new Parser(app);
					this.component = new Component();
					this.component.load();
					this.decorations = this.inlineRender(view) ?? Decoration.none;
				}

				async renderFieldFromInput(code: string) {
					let file = app.workspace.getActiveFile();
					if (file === null) {
						return 'Could not fetch active file';
					}
					let output = "";
					await app.fileManager.processFrontMatter(file, (frontmatter) => {
						output = this.parser.parseEntry(code, frontmatter);
					});	
					return output;			
				}

				inlineRender(view: EditorView) {
					const currentFile = view.state.field(editorInfoField).file;
                	if (!currentFile) return;

					const widgets: Range<Decoration>[] = [];

					for (const { from, to } of view.visibleRanges) {
						syntaxTree(view.state).iterate({
							from,
							to,
							enter: ({ node }) => {
								if (!this.shouldRenderNode(view, node).render) return;
								const widget = this.renderWidget(node, view, currentFile);
								if (widget) {
									widgets.push(widget);
								}
							},
						});
					}

					return Decoration.set(widgets, true);
				}

				renderWidget(node: SyntaxNode, view: EditorView, currentFile: TFile) {
					const type = node.type;
					// contains the position of inline code
					const start = node.from;
					const end = node.to;
					// safety net against unclosed inline code
					if (view.state.doc.sliceString(end, end + 1) === "\n") {
						return;
					}
					const text = view.state.doc.sliceString(start, end);
					let code: string = "";
					let result: Literal = "";
					const PREAMBLE: string = "const betterpnp=this;const bp=this;";
					const el = createSpan({
						cls: ["betterpnp", "betterpnp-inline"],
					});
					/* If the query result is predefined text (e.g. in the case of errors), set innerText to it.
					 * Otherwise, pass on an empty element and fill it in later.
					 * This is necessary because {@link InlineWidget.toDOM} is synchronous but some rendering
					 * asynchronous.
					 */
					if (text.startsWith(settings.initializer)) {
						code = text.substring(settings.initializer.length).trim();
						try {
							this.renderFieldFromInput(code)
								.then(e => el.innerHTML = e);
						} catch (error) {
							result = `Error for '${code}': ${error} \n\n${error.stack}}`;
							el.innerText = result;
						}
					} else {
						return;
					}
	
					const tokenProps = type.prop<String>(tokenClassNodeProp);
					const props = new Set(tokenProps?.split(" "));
	
					return Decoration.replace({
						widget: new InlineWidget([], code, el, view),
						inclusive: false,
						block: false,
					}).range(start - 1, end + 1);
				}

				shouldRenderNode(view: EditorView, node: SyntaxNode) {
					const type = node.type;
					const tokenProps = type.prop<String>(tokenClassNodeProp);
					const props = new Set(tokenProps?.split(" "));
					// current node is inline code
					if (!props.has("inline-code") || props.has("formatting")) {
						return { render: false, isQuery: false };
					}
					// contains the position of inline code
					const start = node.from;
					const end = node.to;
					// don't continue if current cursor position and inline code node (including formatting symbols) overlap
					const selection = view.state.selection;
					return { 
						render: !this.selectionAndRangeOverlap(selection, start - 1, end + 1), 
						isQuery: this.isInlineQuery(view, start, end) 
					};
				}

				isInlineQuery(view: EditorView, start: number, end: number) {
					const text = view.state.doc.sliceString(start, end);
					return text.startsWith(settings.initializer);
				}

				selectionAndRangeOverlap(selection: EditorSelection, rangeFrom: number, rangeTo: number) {
					for (const range of selection.ranges) {
						if (range.from <= rangeTo && range.to >= rangeFrom) {
							return true;
						}
					}
				
					return false;
				}

				update(update: ViewUpdate) {
					// only activate in LP and not source mode
					if (!update.state.field(editorLivePreviewField)) {
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

				removeDeco(node: SyntaxNode) {
					this.decorations.between(node.from - 1, node.to + 1, (from, to, value) => {
						this.decorations = this.decorations.update({
							filterFrom: from,
							filterTo: to,
							filter: (from, to, value) => false,
						});
					});
				}
	
				addDeco(node: SyntaxNode, view: EditorView) {
					const from = node.from - 1;
					const to = node.to + 1;
					let exists = false;
					this.decorations.between(from, to, (from, to, value) => {
						exists = true;
					});
					if (!exists) {
						/**
						 * In a note embedded in a Canvas, app.workspace.getActiveFile() returns
						 * the canvas file, not the note file. On the other hand,
						 * view.state.field(editorInfoField).file returns the note file itself,
						 * which is more suitable here.
						 */
						const currentFile = view.state.field(editorInfoField).file;
						if (!currentFile) return;
						const newDeco = this.renderWidget(node, view, currentFile)?.value;
						if (newDeco) {
							this.decorations = this.decorations.update({
								add: [{ from: from, to: to, value: newDeco }],
							});
						}
					}
				}

				destroy() {
					this.component.unload();
				}
			}, { decorations: v => v.decorations }
		);
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class BPSettingTab extends PluginSettingTab {
	plugin: BPPlugin;

	constructor(app: App, plugin: BPPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Initializer')
			.setDesc('Prefix to start rendering a better pnp block')
			.addText(text => text
				.setPlaceholder('!')
				.setValue(this.plugin.settings.initializer)
				.onChange(async (value) => {
					this.plugin.settings.initializer = value;
					await this.plugin.saveSettings();
				}));
	}
}

class InlineWidget extends WidgetType {
    constructor(
        readonly cssClasses: string[],
        readonly rawQuery: string,
        private el: HTMLElement,
        private view: EditorView
    ) {
        super();
    }

    // Widgets only get updated when the raw query changes/the element gets focus and loses it
    // to prevent redraws when the editor updates.
    eq(other: InlineWidget): boolean {
        if (other.rawQuery === this.rawQuery) {
            // change CSS classes without redrawing the element
            for (let value of other.cssClasses) {
                if (!this.cssClasses.includes(value)) {
                    this.el.removeClass(value);
                } else {
                    this.el.addClass(value);
                }
            }
            return true;
        }
        return false;
    }

    // Add CSS classes and return HTML element.
    // In "complex" cases it will get filled with the correct text/child elements later.
    toDOM(view: EditorView): HTMLElement {
        this.el.addClasses(this.cssClasses);
        return this.el;
    }

    /* Make queries only editable when shift is pressed (or navigated inside with the keyboard
     * or the mouse is placed at the end, but that is always possible regardless of this method).
     * Mostly useful for links, and makes results selectable.
     * If the widgets should always be expandable, make this always return false.
     */
    ignoreEvent(event: MouseEvent | Event): boolean {
        // instanceof check does not work in pop-out windows, so check it like this
        if (event.type === "mousedown") {
            const currentPos = this.view.posAtCoords({ x: (event as MouseEvent).x, y: (event as MouseEvent).y });
            if ((event as MouseEvent).shiftKey) {
                // Set the cursor after the element so that it doesn't select starting from the last cursor position.
                if (currentPos) {
                    const { editor } = this.view.state.field(editorInfoField);
                    if (editor) {
                        editor.setCursor(editor.offsetToPos(currentPos));
                    }
                }
                return false;
            }
        }
        return true;
    }
}

