# Better Pen and Paper Obsidian Writing

Small snippets to create parametrized pen and paper assets.

## Usage

Clone into your .obsidian/plugins folder, restart Obsidian, and activate the plugin in the settings menu under community plugins section. If you haven't already, activate community plugins to see the plugin.

### NPCs

To render a NPC, you can use the following properties in the file header:

```markdown
---
name:
age:
purpose:
job:
gender:
sexuality:
hair_color:
skin_color:
species:
height:
weight:
image:
---
```

> Pro Tip: You can create a template for this. If support for more properties is added, you can update the template, and then include the template into the existing files. Only newly added properties are added to the files this way. Checkout the templates/ folder at https://github.com/Hexafuchs/obsidian-better-pnp for more info.

You then have to add the following snippet at the position where the snippet should be rendered:

```markdown
`#npc`
```

For gender, certain genders are supported with flags and icons: `female`, `male`, `non-binary`, `trans`, `agender`, `intersex`
For sexuality, certain sexualities are supported with flags: `straight`, `gay`, `lesbian`, `bisexual`, `pansexual`, `asexual`, `aromatic`

Most of this labels also have alternative names, e.g. `bi` for `bisexual` and `girl` for `female`, as well as one character abbreviations, e.g. `t` for `trans` and `p` for `pansexual`. You can join names or abbreviations, but you cannot mix them up, e.g. `transfem`, `trans fem` and `tf` are allowed. Also, abbreviations cannot contain spaces, so `t m` is not allowed. In special case some words, like `roseboy`, trigger unwanted icons, as this triggers the keyword `boy`. You can prefix words with a exclamation mark to make sure they are always printed as literals, e.g. `!Roseboy`.

## Contributions

There is a lot to do, both on the technical implementation site, support for settings, custom properties, better styling, wider property support, etc. I cannot promise anything, as this is a side project at best. Feel free to ask for features or even create a pull request to add your own. If you are unsure if your change will be accepted or what the best starting point is, you can open a topic and we can discuss it beforehand.

## Development

### Building

```bash
npm run build
```

### Dev Server

```bash
npm run dev
```

### Run linter

```bash
npm run lint:scripts
npm run lint:styles
```

## Testing

```bash
npm run test
```

## Changelog

Please see [CHANGELOG](https://github.com/Hexafuchs/obsidian-better-pnp/blob/main/CHANGELOG.md) for more information on what has changed recently.

## License

The MIT License (MIT). Please see [License File](https://github.com/Hexafuchs/obsidian-better-pnp/blob/main/LICENSE.md) for more information.

## Attributions

### Code

#### obsidian-dataview

Heavily influenced by https://github.com/blacksmithgu/obsidian-dataview

> MIT License
> Copyright (c) 2021 Michael Brenan
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
> The above copyright notice and this permission notice shall be included in all
> copies or substantial portions of the Software.
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
> SOFTWARE.

### Icons

#### Lucide

> ISC License
> Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
> Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
> THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

#### Emir Saldierna

> Public Domain Icons by Emir Saldierna https://www.svgrepo.com/author/Emir%20Saldierna/
