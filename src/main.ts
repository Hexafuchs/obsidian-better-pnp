import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { Extension } from '@codemirror/state';
import Parser from './parser';
import { BPSettings } from './types';
import viewInlinePlugin from './view';

const DEFAULT_SETTINGS: BPSettings = {
  initializer: '#',
};

export default class BPPlugin extends Plugin {
  settings: BPSettings;
  parser: Parser;

  async onload() {
    await this.loadSettings();

    this.addSettingTab(new BPSettingTab(this.app, this));

    this.registerEditorExtension(viewInlinePlugin(this.app, this.settings));

    this.parser = new Parser(this.app);
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
