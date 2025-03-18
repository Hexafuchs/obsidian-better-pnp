import { App, TFile } from 'obsidian';
import { Decoration, EditorView } from "@codemirror/view";
import { SyntaxNode } from "@lezer/common";
import Parser from './parser';
import { getText, getTextFromNode } from './helper';
import { Literal, BPSettings } from './types';
import { InlineWidget } from './widget';

export class Renderer {
    app: App;
    parser: Parser;
    settings: BPSettings;

    constructor(app: App, settings: BPSettings) {
        this.app = app;
        this.parser = new Parser(app);
        this.settings = settings;
    }

    renderWidget(node: SyntaxNode, view: EditorView, currentFile: TFile) {
        // safety net against unclosed inline code
        if (getText(view, node.to, node.to + 1) === "\n") return;

        const text = getTextFromNode(view, node);
        let content: string = "";
        let result: Literal = "";
        const PREAMBLE: string = "const betterpnp=this;const bp=this;";
        const renderRootElement = createSpan({
            cls: ["betterpnp", "betterpnp-inline"],
        });
        /* If the query result is predefined text (e.g. in the case of errors), set innerText to it.
        * Otherwise, pass on an empty element and fill it in later.
        * This is necessary because {@link InlineWidget.toDOM} is synchronous but some rendering
        * asynchronous.
        */
        if (text.startsWith(this.settings.initializer)) {
            content = text.substring(this.settings.initializer.length).trim();
            try {
                this.renderFieldFromInput(content)
                    .then(result => renderRootElement.innerHTML = result);
            } catch (error) {
                result = `Error for '${content}': ${error} \n\n${error.stack}}`;
                renderRootElement.innerText = result;
            }
        } else {
            return;
        }

        return Decoration.replace({
            widget: new InlineWidget([], content, renderRootElement, view),
            inclusive: false,
            block: false,
        }).range(node.from - 1, node.to + 1);
    }

    async renderFieldFromInput(content: string) {
        const file = this.app.workspace.getActiveFile();
        if (file === null) return 'Could not fetch active file';

        let output = "";
        await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
            output = this.parser.parseEntry(content, frontmatter);
        });	
        return output;			
    }


}