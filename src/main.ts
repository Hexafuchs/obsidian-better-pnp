import { App, MarkdownPostProcessorContext, Plugin, PluginManifest, PluginSettingTab, Setting } from 'obsidian';
import Parser from './parser';
import { BPSettings } from './types';
import viewInlinePlugin, { viewRender } from './view';

const DEFAULT_SETTINGS: BPSettings = {
  initializer: '#',
};

export default class BPPlugin extends Plugin {
  settings: BPSettings;
  parser: Parser;

  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest);
  }

  async onload() {
    await this.loadSettings();

    this.addSettingTab(new BPSettingTab(this.app, this));

    //this.registerEditorExtension(viewInlinePlugin(this.app, this.settings));

    this.registerPriorityMarkdownPostProcessor(-100, async (el, ctx) => {
      viewRender(el, ctx, ctx.sourcePath, this.settings, this.app);
    });

    this.parser = new Parser(this.app);
  }

  public registerPriorityMarkdownPostProcessor(
    priority: number,
    processor: (el: HTMLElement, ctx: MarkdownPostProcessorContext) => Promise<void>
  ) {
    const registered = this.registerMarkdownPostProcessor(processor);
    registered.sortOrder = priority;
  }

  onunload() {}

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
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName('Initializer')
      .setDesc('Prefix to start rendering a better pnp block')
      .addText(text =>
        text
          .setPlaceholder('!')
          .setValue(this.plugin.settings.initializer)
          .onChange(async value => {
            this.plugin.settings.initializer = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
