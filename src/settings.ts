import { App, PluginSettingTab, Setting } from 'obsidian';
import BPPlugin from './main';

export interface BPSettings {
  initializer: string;
  weightUnit: string;
  heightUnit: string;
  useFlags: boolean;
  useIcons: boolean;
  preferFlags: boolean;
  escapePrefix: string;
  language: string;
}

export const DEFAULT_SETTINGS: BPSettings = {
  initializer: '#',
  weightUnit: 'metric',
  heightUnit: 'metric',
  useFlags: true,
  useIcons: true,
  preferFlags: true,
  escapePrefix: '!',
  language: 'en',
};

export class BPSettingTab extends PluginSettingTab {
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

    new Setting(containerEl)
      .setName('Language')
      .setDesc('Set the lanaguage used for display (does not affect settings)')
      .addDropdown(dropdown =>
        dropdown
          .addOption('en', 'English')
          .addOption('de', 'Deutsch')
          .setValue(this.plugin.settings.language)
          .onChange(async value => {
            this.plugin.settings.language = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Weight Unit')
      .setDesc('Set the unit of weight used for display')
      .addDropdown(dropdown =>
        dropdown
          .addOption('metric', 'Metric (Kilogram)')
          .addOption('imperial', 'Imperial (Pound)')
          .setValue(this.plugin.settings.weightUnit)
          .onChange(async value => {
            this.plugin.settings.weightUnit = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Height Unit')
      .setDesc('Set the unit of height used for display')
      .addDropdown(dropdown =>
        dropdown
          .addOption('metric', 'Metric (Meter)')
          .addOption('imperial', 'Imperial (Foot)')
          .setValue(this.plugin.settings.heightUnit)
          .onChange(async value => {
            this.plugin.settings.heightUnit = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Escape Prefix')
      .setDesc(
        "If a input starts with this prefix, remove the prefix and don't interpret the input, e.g. do not replace it with flags or symbols"
      )
      .addText(text =>
        text
          .setPlaceholder('!')
          .setValue(this.plugin.settings.escapePrefix)
          .onChange(async value => {
            this.plugin.settings.escapePrefix = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Use Flags')
      .setDesc('Where available, use replace input with flags')
      .addToggle(toggle =>
        toggle.setValue(this.plugin.settings.useFlags).onChange(async value => {
          this.plugin.settings.useFlags = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName('Use Icons')
      .setDesc('Where available, use replace input with icons')
      .addToggle(toggle =>
        toggle.setValue(this.plugin.settings.useIcons).onChange(async value => {
          this.plugin.settings.useIcons = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName('Prefer Flags')
      .setDesc('Where both are available, prefer flags over icons')
      .addToggle(toggle =>
        toggle.setValue(this.plugin.settings.preferFlags).onChange(async value => {
          this.plugin.settings.preferFlags = value;
          await this.plugin.saveSettings();
        })
      );
  }
}
