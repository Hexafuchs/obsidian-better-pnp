import { EditorView, WidgetType } from '@codemirror/view';

export class InlineWidget extends WidgetType {
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
      for (const value of other.cssClasses) {
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
  toDOM(): HTMLElement {
    this.el.addClasses(this.cssClasses);
    return this.el;
  }

  ignoreEvent(): boolean {
    return false;
  }
}
