import * as d3Color from 'd3-color';
import * as d3Selection from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import { BaseCharts } from '../../core/BaseCharts';

const d3 = { ...d3Color, ...d3Selection, ...d3Shape, ...d3Scale };

export type PieCircleDataItemType = {
  label: string;
  value: number;
  color?: string;
};
export type PieCircleDataType = PieCircleDataItemType[];

const defaultOptions = {
  length: 270,
  rotation: 0,
  innerRadius: 0.5,
  outerRadius: 1,
  itemGap: 2,
  itemPadding: 5,
  bgLength: 'full' as 'full' | 'max' | 'data',
  bgColor: '#fff' as string | ((d: PieCircleDataItemType, index: number) => string),
};

export class PieCircle extends BaseCharts<PieCircleDataType, Partial<typeof defaultOptions>> {
  constructor(el: HTMLElement, options?: Partial<typeof defaultOptions>, data?: PieCircleDataType) {
    super(el, options, data);

    this.options = Object.assign(defaultOptions, options);
    this.el = el;
    this.data = data || [];

    this.init();
  }

  setData(data: PieCircleDataType): void {
    this.data = data;
    this.draw();
  }

  svg = d3.create('svg');

  init() {
    this.el.appendChild(this.svg.node()!);

    this.svg.style('background-color', 'transparent').style('overflow', 'visible');

    super.init();
  }

  drawClear(): void {
    this.svg.selectAll('*').remove();
  }

  band = d3.scaleBand();
  bgband = d3.scaleBand();
  arc = d3.arc<PieCircleDataItemType>();
  bgArc = d3.arc<PieCircleDataItemType>();

  draw(): void {
    this.drawClear();

    const { data: _data, options } = this;
    const { rotation, length, innerRadius, outerRadius, itemGap, itemPadding, bgColor, bgLength } = Object.assign(defaultOptions, options);

    const width = this.el.clientWidth;
    const height = this.el.clientHeight;

    const list = _data || [];

    const size = Math.min(width, height) / 2;

    const inner = size * innerRadius;
    const outer = size * outerRadius;

    const itemWidth = (outer - inner) / list.length;

    this.svg.attr('width', width).attr('height', height);

    const max = Math.max(...list.map((d) => d.value));

    this.band
      .domain(list.map((d) => d.label))
      .paddingInner(itemGap / itemWidth + (itemPadding * 2) / itemWidth)
      .paddingOuter(itemPadding / itemWidth)
      .range([inner, outer]);

    this.arc
      .innerRadius((_d) => (this.band(_d.label) || 0) + this.band.bandwidth() / 2 - 0.1)
      .outerRadius((_d) => (this.band(_d.label) || 0) + this.band.bandwidth() / 2 + 0.1)
      .startAngle(() => rotation * (Math.PI / 180))
      .endAngle((d) => rotation * (Math.PI / 180) + (d.value / max) * (length * (Math.PI / 180)))
      .cornerRadius(size);

    this.bgband
      .domain(list.map((d) => d.label))
      .paddingInner(itemGap / itemWidth)
      .range([inner, outer]);

    this.bgArc
      .innerRadius((_d) => (this.band(_d.label) || 0) + this.band.bandwidth() / 2 - 0.1)
      .outerRadius((_d) => (this.band(_d.label) || 0) + this.band.bandwidth() / 2 + 0.1)
      .startAngle(() => rotation * (Math.PI / 180))
      .endAngle((d) => {
        if (bgLength === 'data') {
          return rotation * (Math.PI / 180) + (d.value / max) * (length * (Math.PI / 180)) * 0.999;
        }
        if (bgLength === 'max') {
          return rotation * (Math.PI / 180) + length * (Math.PI / 180) * 0.999;
        }
        return rotation * (Math.PI / 180) + Math.PI * 2 * 0.999;
      })
      .cornerRadius(size);

    const ringsGroup = this.svg
      .append('g')
      .classed('ringGroup', true)
      .attr('transform', 'translate(' + width / 2 + ' ' + height / 2 + ')');

    ringsGroup
      .selectAll('.bg-ring')
      .data(list)
      .join('path')
      .classed('bg-ring', true)
      .style('opacity', 0.4)
      .style('stroke-linecap', 'round')
      .style('stroke', (d, index) => {
        return typeof bgColor === 'function' ? bgColor(d, index) : bgColor;
      })
      .style('stroke-width', this.bgband.bandwidth() + 'px')
      .attr('d', this.bgArc);

    ringsGroup
      .selectAll('.ring')
      .data(list)
      .join('path')
      .classed('ring', true)
      .style('stroke-linecap', 'round')
      .style('stroke', (d) => d.color || '')
      .style('stroke-width', this.band.bandwidth() + 'px')
      .attr('d', this.arc);

    super.draw();
  }

  destroy(): void {
    super.destroy();
  }
}
