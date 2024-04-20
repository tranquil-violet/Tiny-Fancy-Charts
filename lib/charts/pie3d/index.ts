import * as d3Color from 'd3-color';
import * as d3Selection from 'd3-selection';
import * as d3Shape from 'd3-shape';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { BaseCharts } from '../../core/BaseCharts';

const d3 = Object.assign({}, d3Color, d3Selection, d3Shape);

export type Pie3dDataType = {
  label: string;
  value: number;
  color?: string;
}[];

const defaultOptions = {
  rotation: 180,
  height: 10,
  opacity: 0.8,
  innerRadius: 0.74,
  hoverHeight: 40,
  lineOpacity: 0.4,
  lineColor: '#ffffff',
  dark: 0.5,
  ratio: 1.6,
  y: 5,
};

const findParent = (object: THREE.Object3D): THREE.Object3D | null => {
  if (!object) return null;
  if (object.parent) {
    if (Object.keys(object.parent.userData).length) {
      return object.parent;
    } else {
      return findParent(object.parent);
    }
  } else {
    return null;
  }
};

export class Pie3d extends BaseCharts<Pie3dDataType, Partial<typeof defaultOptions>> {
  constructor(el: HTMLElement, options?: Partial<typeof defaultOptions>, data?: Pie3dDataType) {
    super(el, options, data);

    this.options = Object.assign(defaultOptions, options);
    this.el = el;
    this.data = data || [];

    this.init();
  }

  setData(data: Pie3dDataType): void {
    this.data = data;
    this.draw();
  }

  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer();

  hoverItem: THREE.Group | null = null;

  timer!: number;

  init() {
    const el = this.el;
    const width = this.el.clientWidth;
    const height = this.el.clientHeight;

    const renderer = this.renderer;

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 1000);
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(this.options?.ratio || defaultOptions.ratio);

    el.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update();
    controls.enabled = false;
    camera.position.z = 10;
    camera.position.y = this.options?.y || defaultOptions.y;

    const raycaster = new THREE.Raycaster();

    let pointer = new THREE.Vector2();
    pointer.x = -10;
    pointer.y = -10;
    el.addEventListener('pointermove', (event) => {
      pointer.x = (event.offsetX / width) * 2 - 1;
      pointer.y = -(event.offsetY / height) * 2 + 1;
    });

    const animate = () => {
      let oldGroup = this.hoverItem;
      raycaster.setFromCamera(pointer, camera);

      this.timer = requestAnimationFrame(animate);
      controls.update();

      if (this.scene.children.length) {
        // 计算物体和射线的焦点
        const intersects = raycaster.intersectObjects(this.intersectObjects, false);

        const group = findParent(intersects?.[0]?.object);
        if (!group) this.hoverItem = null;
        if (group && group instanceof THREE.Group) this.hoverItem = group;
        if (oldGroup !== this.hoverItem) {
          if (this.hoverItem) {
            this.events.emit('hover', this.hoverItem.userData);
          } else {
            this.events.emit('hover', null);
          }
        }
      }

      this.scene.children[0]?.children.forEach((group) => {
        if (group instanceof THREE.Group && this.hoverItem === group) {
          group.scale.y = (this.options?.hoverHeight || defaultOptions.hoverHeight) / (this.options?.height || defaultOptions.height) || 1;
        } else {
          group.scale.y = 1;
        }
      });

      renderer.render(this.scene, camera);
    };

    animate();

    super.init();
  }

  drawClear(): void {
    this.intersectObjects = [];
    this.scene.clear();
  }

  intersectObjects: THREE.Object3D[] = [];

  draw(): void {
    this.drawClear();

    const { data: _data, options } = this;
    const { rotation, innerRadius, dark, opacity, lineOpacity, lineColor } = options || defaultOptions;
    const pieHeight = (this.options?.height || defaultOptions.height) / 20;

    const _lineColor = d3.rgb(lineColor!).formatHex();

    const data = d3
      .pie<Pie3dDataType[0]>()
      .sort((a, b) => a.value - b.value)
      .value((d) => d.value)(_data || [])
      .map((d) => {
        return Object.assign(d, {
          startAngle: d.startAngle + (Math.PI * 2 * (rotation! % 360)) / 360,
          endAngle: d.endAngle + (Math.PI * 2 * (rotation! % 360)) / 360,
        });
      });

    const mainGroup = new THREE.Group();

    data.forEach((d) => {
      const group = new THREE.Group();

      const color = d3.rgb(d.data.color || '#fff').formatHex();
      const darkColor = d3.rgb(color).darker(dark).formatHex();

      // 柱状体顶面
      {
        const geometry = new THREE.RingGeometry(innerRadius, 1, 32, 1, d.startAngle, d.endAngle - d.startAngle);
        const material = new THREE.MeshBasicMaterial({
          color: color,
          side: THREE.DoubleSide,
          opacity: opacity,
          transparent: true,
          depthWrite: false,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.rotation.z = -Math.PI / 2;
        mesh.position.y = pieHeight;

        const edges = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(
          edges,
          new THREE.LineBasicMaterial({ color: _lineColor, linewidth: 0, opacity: lineOpacity, transparent: true })
        );
        line.rotation.x = -Math.PI / 2;
        line.rotation.z = -Math.PI / 2;
        line.position.y = pieHeight;

        this.intersectObjects.push(mesh);

        group.add(mesh, line);
      }
      // 柱状体底面
      {
        const geometry = new THREE.RingGeometry(innerRadius, 1, 32, 1, d.startAngle, d.endAngle - d.startAngle);
        const material = new THREE.MeshBasicMaterial({
          color: color,
          side: THREE.DoubleSide,
          opacity: opacity,
          transparent: true,
          depthWrite: false,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.rotation.z = -Math.PI / 2;

        const edges = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(
          edges,
          new THREE.LineBasicMaterial({ color: _lineColor, linewidth: 0, opacity: lineOpacity, transparent: true })
        );
        line.rotation.x = -Math.PI / 2;
        line.rotation.z = -Math.PI / 2;

        this.intersectObjects.push(mesh);

        group.add(mesh, line);
      }
      // 柱状体外侧
      {
        const points: THREE.Vector2[] = [new THREE.Vector2(1, 0), new THREE.Vector2(1, pieHeight)];
        const geometry = new THREE.LatheGeometry(points, 32, d.startAngle, d.endAngle - d.startAngle);
        const material = new THREE.MeshBasicMaterial({
          color: darkColor,
          side: THREE.DoubleSide,
          opacity: opacity,
          transparent: true,
          depthWrite: false,
        });
        const lathe = new THREE.Mesh(geometry, material);

        this.intersectObjects.push(lathe);

        group.add(lathe);
      }
      // 柱状体内侧
      {
        const points: THREE.Vector2[] = [new THREE.Vector2(innerRadius, 0), new THREE.Vector2(innerRadius, pieHeight)];
        const geometry = new THREE.LatheGeometry(points, 32, d.startAngle, d.endAngle - d.startAngle);
        const material = new THREE.MeshBasicMaterial({
          color: darkColor,
          side: THREE.DoubleSide,
          opacity: opacity,
          transparent: true,
          depthWrite: false,
        });
        const lathe = new THREE.Mesh(geometry, material);
        this.intersectObjects.push(lathe);
        group.add(lathe);
      }
      // 柱状体起始侧面
      {
        const planeGeometry = new THREE.PlaneGeometry(1 - innerRadius!, pieHeight);
        const material = new THREE.MeshBasicMaterial({
          color: darkColor,
          side: THREE.DoubleSide,
          opacity: opacity,
          transparent: true,
          depthWrite: false,
        });
        const plane = new THREE.Mesh(planeGeometry, material);
        const planeGroup = new THREE.Group();
        plane.position.y = pieHeight / 2;
        plane.position.x = 1 - (1 - innerRadius!) / 2;

        const edges = new THREE.EdgesGeometry(planeGeometry);
        const line = new THREE.LineSegments(
          edges,
          new THREE.LineBasicMaterial({ color: _lineColor, linewidth: 0, opacity: lineOpacity, transparent: true })
        );
        line.position.y = pieHeight / 2;
        line.position.x = 1 - (1 - innerRadius!) / 2;

        planeGroup.rotation.y = d.startAngle - Math.PI / 2;
        planeGroup.add(plane, line);

        this.intersectObjects.push(plane);
        group.add(planeGroup);
      }
      // 柱状体结束侧面
      {
        const planeGeometry = new THREE.PlaneGeometry(1 - innerRadius!, pieHeight);
        const material = new THREE.MeshBasicMaterial({
          color: darkColor,
          side: THREE.DoubleSide,
          opacity: opacity,
          transparent: true,
          depthWrite: false,
        });
        const plane = new THREE.Mesh(planeGeometry, material);
        const planeGroup = new THREE.Group();
        plane.position.y = pieHeight / 2;
        plane.position.x = 1 - (1 - innerRadius!) / 2;

        planeGroup.rotation.y = d.endAngle - Math.PI / 2;
        planeGroup.add(plane);
        this.intersectObjects.push(plane);
        group.add(planeGroup);
      }

      group.userData = d.data;

      mainGroup.add(group);
    });

    mainGroup.scale.y = 0.2;

    this.scene.add(mainGroup);

    super.draw();
  }

  destroy(): void {
    this.scene.clear();
    this.renderer.domElement.remove();
    this.renderer.dispose();

    cancelAnimationFrame(this.timer);

    this.el.innerHTML = '';

    super.destroy();
  }
}
