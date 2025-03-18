import { App } from 'obsidian';

import { GENDER_ABBR_MAPPING, GENDER_TERMS_MAPPING } from './parser/gender';
import { ABBR_MAPPING, TERM_MAPPING } from './parser/base';
import { SEXUALITY_ABBR_MAPPING, SEXUALITY_TERMS_MAPPING } from './parser/sexuality';

export default class Parser {
  app: App;

  constructor(app: App) {
    this.app = app;
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

    if (value.startsWith('!')) {
      return this.addAttribute(value.substring(1));
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
    return this.addMultiIcon(value, GENDER_TERMS_MAPPING, GENDER_ABBR_MAPPING);
  }

  addSexualityIcon(value: string) {
    return this.addMultiIcon(value, SEXUALITY_TERMS_MAPPING, SEXUALITY_ABBR_MAPPING);
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

    let element = '<div class="npc">';
    if (name) element += this.addAttribute(name);
    if (age) element += this.addAttribute(age);
    if (gender) element += this.addGenderIcon(gender);
    if (sexuality) element += this.addSexualityIcon(sexuality);
    if (job) element += this.addAttribute(job);
    element += '</div>';
    element += '<div class="npc">';
    if (purpose) element += this.addAttributeNamed('Zweck', purpose);
    if (goal) element += this.addAttributeNamed('Ziel', goal);
    element += '</div>';
    element += '<div class="npc">';
    if (image) element += this.addImage(image);
    element += '</div>';

    return element;
  }
}
