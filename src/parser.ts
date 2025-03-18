import { App } from 'obsidian';

import { ABBR_MAPPING, TERM_MAPPING } from './parser/base';
import { genderAbbrMappings, genderTermMappings } from './parser/gender';
import { BPSettings } from './settings';
import { sexualityAbbrMappings, sexualityTermMappings } from './parser/sexuality';
import { t } from './translations';

export default class Parser {
  constructor(
    public app: App,
    public settings: BPSettings
  ) {}

  private t(identifier: string): string {
    const translation = t(this.settings.language, identifier);
    if (translation === null) {
      throw new Error('Missing translation for ' + identifier);
    }
    return translation;
  }

  public parseEntry(type: string, frontmatter: Array<string>) {
    switch (type) {
      case 'npc':
        return this.parseNPC(frontmatter);
      default:
        return 'None';
    }
  }

  addAttributeNamed(key: string, value: string) {
    let row = '<div class="attribute">';

    row += '<div class="attribute-key">';
    row += key;
    row += '</div>';

    row += '<span class="attribute-separator"></span>';

    row += '<div class="attribute-value">';
    row += value;
    row += '</div>';

    row += '</div>';
    return row;
  }

  addAttribute(value: string) {
    let row = '<div class="attribute attribute-single">';

    row += '<div class="attribute-value attribute-value-single">';
    row += value;
    row += '</div>';

    row += '</div>';
    return row;
  }

  addImage(value: string) {
    let row = '<div class="attribute attribute-image">';

    row += '<div class="attribute-value attribute-image-container">';

    const files = this.app.vault.getFiles().filter(e => e.name === value);
    if (files.length === 0) {
      return '';
    }

    row += '<img src="';
    const uri = this.app.vault.getResourcePath(files[0]);
    row += uri;
    row += '" class="attribute-image-source" alt="Could not load image">';

    row += '</div>';

    row += '</div>';
    return row;
  }

  addIcon(value: string) {
    let row = '<div class="attribute attribute-single attribute-icon">';

    row += '<div class="attribute-value attribute-value-single attribute-value-icon attribute-value-icon-single">';
    row += value;
    row += '</div>';

    row += '</div>';
    return row;
  }

  private mixupArrays(array1: Array<string>, array2: Array<string>) {
    return array1.flatMap(d => array2.map(v => d + v)).concat(array1.flatMap(d => array2.map(v => v + d)));
  }

  private arrayContains(haystack: Array<string>, needle: string) {
    return haystack.indexOf(needle) !== -1;
  }

  private containsTerm(needle: string, haystack: Array<string>) {
    return haystack.filter(e => needle.includes(e)).length > 0;
  }

  addMultiIcon(value: string, termMapping: Array<TERM_MAPPING>, abbrMapping: Array<ABBR_MAPPING>) {
    const lc_value = value.toLowerCase().replace(' ', '').replace('-', '');
    let found = false;
    let output = '';

    if (value.startsWith(this.settings.escapePrefix)) {
      return this.addAttribute(value.substring(this.settings.escapePrefix.length));
    }

    for (const [terms, icon] of termMapping) {
      if (this.containsTerm(lc_value, terms)) {
        found = true;
        output += icon;
      }
    }

    if (!found && value === lc_value) {
      const chars = lc_value.split('');
      let match = [];
      for (const [abbrs, icon] of abbrMapping) {
        match = chars.filter(e => this.arrayContains(abbrs, e));
        if (match.length === 1) {
          output += icon;
          chars.splice(chars.indexOf(match[0]), 1);
        }
      }

      if (chars.length === 0) {
        found = true;
      } else {
        output = '';
      }
    }

    if (!found) {
      return this.addAttribute(value);
    }

    return this.addIcon(output);
  }

  addGenderIcon(value: string) {
    return this.addMultiIcon(value, genderTermMappings(this.settings), genderAbbrMappings(this.settings));
  }

  addSexualityIcon(value: string) {
    return this.addMultiIcon(value, sexualityTermMappings(this.settings), sexualityAbbrMappings(this.settings));
  }

  addColorNamed(name: string, color: string) {
    if (color.startsWith(this.settings.escapePrefix)) {
      return this.addAttributeNamed(name, color.substring(this.settings.escapePrefix.length));
    }
    return this.addAttributeNamed(name, `<div class="attribute-color" style="background-color: ${color};"></div>`);
  }

  addHeightNamed(name: string, height: string) {
    if (height.startsWith(this.settings.escapePrefix)) {
      return this.addAttributeNamed(name, height.substring(this.settings.escapePrefix.length));
    }
    const unit = this.settings.heightUnit === 'metric' ? 'm' : 'f';
    return this.addAttributeNamed(name, `${height}${unit}`);
  }

  addWeightNamed(name: string, weight: string) {
    if (weight.startsWith(this.settings.escapePrefix)) {
      return this.addAttributeNamed(name, weight.substring(this.settings.escapePrefix.length));
    }
    const unit = this.settings.weightUnit === 'metric' ? 'kg' : 'lbs';
    return this.addAttributeNamed(name, `${weight}${unit}`);
  }

  parseNPC(frontmatter: any) {
    const name = frontmatter['name'];
    const age = frontmatter['age'];
    const job = frontmatter['job'];
    const purpose = frontmatter['purpose'];
    const goal = frontmatter['goal'];
    const image = frontmatter['image'];
    const gender = frontmatter['gender'];
    const sexuality = frontmatter['sexuality'];
    const hairColor = frontmatter['hair_color'];
    const skinColor = frontmatter['skin_color'];
    const weight = frontmatter['weight'];
    const height = frontmatter['height'];
    const species = frontmatter['species'];
    const characteristics = frontmatter['characteristics'];
    const notes = frontmatter['notes'];

    let element = '<div class="npc">';
    if (name) element += this.addAttribute(name);
    if (age) element += this.addAttribute(age);
    if (gender) element += this.addGenderIcon(gender);
    if (sexuality) element += this.addSexualityIcon(sexuality);
    element += '</div>';
    element += '<div class="npc">';
    if (height) element += this.addHeightNamed(this.t('height'), height);
    if (weight) element += this.addWeightNamed(this.t('weight'), weight);
    if (hairColor) element += this.addColorNamed(this.t('hair'), hairColor);
    if (skinColor) element += this.addColorNamed(this.t('skin'), skinColor);
    if (species) element += this.addAttributeNamed(this.t('species'), species);
    element += '</div>';
    element += '<div class="npc">';
    if (job) element += this.addAttributeNamed(this.t('job'), job);
    if (purpose) element += this.addAttributeNamed(this.t('purpose'), purpose);
    if (goal) element += this.addAttributeNamed(this.t('goal'), goal);
    if (characteristics) element += this.addAttributeNamed(this.t('characteristics'), characteristics);
    if (notes) element += this.addAttributeNamed(this.t('notes'), notes);
    element += '</div>';
    element += '<div class="npc">';
    if (image) element += this.addImage(image);
    element += '</div>';

    return element;
  }
}
