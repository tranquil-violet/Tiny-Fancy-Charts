import mitt from "mitt";

type Options = {
  [key: string]: any;
};

export class BaseCharts<D, O = Options> {
  name?: string;

  options?: O;

  data?: D;

  el: HTMLElement;

  events = mitt();

  inited = false;

  resizeObserver = new ResizeObserver(() => {
    if (!this.inited) return;
    this.events.emit("resize");
  });

  constructor(el: HTMLElement, options?: O, data?: D) {
    this.el = el;
    this.options = options;
    this.data = data;

    this.resizeObserver.observe(this.el);
  }

  init(): void | Promise<void> {
    this.events.emit("initAfter");
    this.inited = true;
  }

  draw(): void {
    this.events.emit("drawAfter");
  }

  destroy() {
    this.events.emit("destroyBefore");
    this.resizeObserver.disconnect();
    this.events.all.clear();
  }
}
