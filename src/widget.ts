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
  toDOM(_view: EditorView): HTMLElement {
    this.el.addClasses(this.cssClasses);
    return this.el;
  }

  /* Make queries only editable when shift is pressed (or navigated inside with the keyboard
   * or the mouse is placed at the end, but that is always possible regardless of this method).
   * Mostly useful for links, and makes results selectable.
   * If the widgets should always be expandable, make this always return false.
   */
  ignoreEvent(_event: MouseEvent | Event): boolean {
    return false;
    // instanceof check does not work in pop-out windows, so check it like this
    /*if (event.type === 'mousedown') {
      const currentPos = this.view.posAtCoords({ x: (event as MouseEvent).x, y: (event as MouseEvent).y });
      if ((event as MouseEvent).shiftKey) {
        // Set the cursor after the element so that it doesn't select starting from the last cursor position.
        if (currentPos) {
          const { editor } = this.view.state.field(editorInfoField);
          if (editor) {
            editor.setCursor(editor.offsetToPos(currentPos));
          }
        }
        return false;
      }
    }
    return true;*/
  }
}
