import { App } from "obsidian";

export default class Parser {
    app: App;

    constructor(app: App) {
        this.app = app;
    }


    public parseEntry(type: string, frontmatter: Array<string>, app: App) {
        switch (type) {
            case "npc":
                return this.parseNPC(frontmatter);
            default:
                return "None";
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

        let files = this.app.vault.getFiles().filter((e) => e.name === value);
        if (files.length === 0) {
            return "";
        }

        row += '<img src="';
        let uri = this.app.vault.getResourcePath(files[0]);
        row += uri;
        row += '" class="attribute-image-source" alt="Could not load image">';
        
        row += '</div>';

        row += '</div>';
        return row;
    }

    parseNPC(frontmatter: any) {
        let name = frontmatter['name'];
        let age = frontmatter['age'];
        let job = frontmatter['job'];
        let purpose = frontmatter['purpose'];
        let goal = frontmatter['goal'];
        let image = frontmatter['image'];

        let element = '<div class="npc">';
        if (name) element += this.addAttribute(name);
        if (age) element += this.addAttribute(age);
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