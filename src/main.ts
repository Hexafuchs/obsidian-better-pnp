import { App, MarkdownPostProcessorContext, Plugin, PluginManifest } from 'obsidian';
import Parser from './parser';
import { FrontmatterObserver, viewRender } from './view';
import { BPSettings, BPSettingTab, DEFAULT_SETTINGS } from './settings';

export default class BPPlugin extends Plugin {
  settings: BPSettings;
  parser: Parser;
  frontmatterObservers: Record<string, FrontmatterObserver> = {};

  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest);
  }

  async onload() {
    await this.loadSettings();

    this.addSettingTab(new BPSettingTab(this.app, this));

    //this.registerEditorExtension(viewInlinePlugin(this.app, this.settings));

    this.registerPriorityMarkdownPostProcessor(-100, async (el, ctx) => {
      if (!(ctx.sourcePath in this.frontmatterObservers)) {
        this.frontmatterObservers[ctx.sourcePath] = new FrontmatterObserver(this.app, ctx.sourcePath);
      }
      viewRender(el, ctx, ctx.sourcePath, this.settings, this.app, this.frontmatterObservers[ctx.sourcePath]);
    });

    this.parser = new Parser(this.app, this.settings);
  }

  public registerPriorityMarkdownPostProcessor(
    priority: number,
    processor: (el: HTMLElement, ctx: MarkdownPostProcessorContext) => Promise<void>
  ) {
    const registered = this.registerMarkdownPostProcessor(processor);
    registered.sortOrder = priority;
  }

  onunload() {
    for (const key in this.frontmatterObservers) {
      this.frontmatterObservers[key].stop();
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
