# Tiny Fancy Charts

Tiny Fancy Charts is a simple and lightweight library to create fancy charts for your web applications.

## External Libraries

- Pie3D - 3D Pie Chart
  - [Three.js](https://threejs.org/)

## Usage

### install

```bash
npm install tiny-fancy-charts

# or

pnpm install tiny-fancy-charts
```

### Pie3D

```typescript
import { Pie3d } from 'tiny-fancy-charts/es/pie3d';

const pie3d = new Pie3d(containerDom, {
  // Start Angle
  rotation: 180,

  // Bar Item Height (Not entirely accurate)
  height: 10,

  // Bar Item Opacity
  opacity: 0.8,

  // Inner Radius
  innerRadius: 0.7,

  // Hover Height (Multiplying by height)
  hoverHeight: 40,

  // Out Line Opacity
  lineOpacity: 0.4,

  // Out Line Color
  lineColor: '#fffff,f'

  // Side Face Dark Color
  dark: 0.5,

  // 3D Ratio
  ratio: 1.6,

  // Tilt angle, larger and more perpendicular
  y: 5,

  // Target X
  targetY: 0.2,
});

/** Set Data */
pie3d.setData([
  { label: 'A', value: 100, color: l1 },
  { label: 'B', value: 200, color: l2 },
  { label: 'C', value: 300, color: l3 },
  { label: 'D', value: 400, color: l4 },
  { label: 'E', value: 500, color: l5 },
]);

/** Set Hover */
pie3d.setHover("A");

/*** Clear Hover */
pie3d.clearHover();
```

### PieCircle

```typescript
import { PieCircle } from 'tiny-fancy-charts/es/pie3d';

const pie3d = new PieCircle(containerDom, {
  // Total Length
  length: 270,

  // Start Angle
  rotation: 0,

  // Inner Radius
  innerRadius: 0.5,

  // Outer Radius
  outerRadius: 1,

  // Bar Gap
  itemGap: 2,

  // Bar Padding
  itemPadding: 5,

  // Bar Length Calculation Method 
  bgLength: 'full' as 'full' | 'max' | 'data',

  // Bar Item Color
  bgColor: '#fff' as string | ((d: PieCircleDataItemType, index: number) => string),

});

/** Set Data */
pie3d.setData([
  { label: 'A', value: 100, color: l1 },
  { label: 'B', value: 200, color: l2 },
  { label: 'C', value: 300, color: l3 },
  { label: 'D', value: 400, color: l4 },
  { label: 'E', value: 500, color: l5 },
]);
```
