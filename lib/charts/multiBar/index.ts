import * as d3Color from 'd3-color';
import * as d3Selection from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Axis from 'd3-axis';
import * as d3Shape from 'd3-shape';
import { BaseCharts } from '../../core/BaseCharts';

const d3 = { ...d3Color, ...d3Selection, ...d3Shape, ...d3Scale, ...d3Axis };

export type MultiBarDataItemType = {
  legends: { label: string; color?: string }[];
  data: { label: string; values: number[] }[];
};
export type MultiBarDataType = MultiBarDataItemType;

const defaultOptions = {
  length: 270,
  rotation: 0,
  innerRadius: 0.5,
  outerRadius: 1,
  itemGap: 2,
  itemPadding: 5,
  bgLength: 'full' as 'full' | 'max' | 'data',
  bgColor: '#fff' as string | ((d: MultiBarDataItemType, index: number) => string),
  itemRender: (_legend: string, _itemLabel: string, _value: number) => {
    return document.createElement('div');
  },
};

export class MultiBar extends BaseCharts<MultiBarDataType, Partial<typeof defaultOptions>> {
  constructor(el: HTMLElement, options?: Partial<typeof defaultOptions>, data?: MultiBarDataType) {
    super(el, options, data);

    this.options = Object.assign(defaultOptions, options);
    this.el = el;
    this.data = data;

    this.init();
  }

  setData(data: MultiBarDataType): void {
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

  x = d3.scaleBand();
  xBars = d3.scaleBand();
  y = d3.scaleLinear().nice();
  draw(): void {
    this.drawClear();

    const { data: _data, options } = this;
    const {} = Object.assign(defaultOptions, options);

    const width = this.el.clientWidth;
    const height = this.el.clientHeight;

    this.svg.attr('width', width).attr('height', height);

    const data = _data?.data || [];
    const legends = _data?.legends || [];
    const max = Math.max(...data?.map((d) => Math.max(...d.values)));

    const x = this.x;
    const y = this.y;
    const xBars = this.xBars;

    const padding = { top: 200, right: 50, bottom: 100, left: 100 };

    x.domain(data.map((_d, i) => i.toString()))
      .range([padding.left, width - padding.right])
      .padding(0.1);
    xBars
      .domain(legends.map((item) => item.label))
      .range([0, x.bandwidth()])
      .paddingInner(0.1);
    y.domain([max, 0])
      .nice()
      .range([padding.top, height - padding.bottom]);

    this.svg
      .append('g')
      .selectAll('g')
      .data(data)
      .enter()
      .append('g')
      .attr('x', (_d, index) => x(index.toString())!)
      .attr('y', (_d) => 0)
      .attr('class', 'bar-container')
      .attr('fill', 'white');

    legends.forEach((letter, index) => {
      this.svg
        .selectAll<SVGRectElement, { values: number[]; label: string }>('.bar-container')
        .append('foreignObject')
        .attr('x', (_d, index) => x(index.toString())! + xBars(letter.label)!)
        .attr('y', (d) => y(d.values[index]))
        .attr('height', (d) => y(0) - y(d.values[index]))
        .attr('width', xBars.bandwidth())
        .append((d, _i) => {
          const dom = options?.itemRender?.(letter.label, d.label, d.values[index]);
          return dom || document.createElement('div');
        });
    });

    this.svg.append('g').call((g) =>
      g.attr('transform', `translate(0,${height - padding.bottom})`).call(
        d3
          .axisBottom(x)
          .tickFormat((d) => data[+d].label)
          .tickSizeOuter(0)
      )
    );

    this.svg.append('g').call((g) =>
      g
        .attr('transform', `translate(${padding.left},0)`)
        .call(d3.axisLeft(y))
        .call((g) => g.select('.domain').remove())
    );

    super.draw();
  }

  destroy(): void {
    super.destroy();
  }
}
