<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { MultiBar } from '../lib/charts/multiBar/index';

const domRef = ref<HTMLElement>();
onMounted(() => {
  const pie3d = new MultiBar(domRef.value!, {
    itemRender: (legend: string, itemLabel: string, value: number) => {
      const dom = document.createElement('div');

      dom.style.width = '100%';
      dom.style.height = '100%';
      dom.style.display = 'flex';
      dom.style.justifyContent = 'center';
      dom.style.alignItems = 'center';
      dom.style.color = 'white';
      dom.style.background = legend;
      dom.innerText = `${itemLabel}: ${value}`;

      return dom;
    },
  });

  // pie3d.draw();
  pie3d.setData({
    legends: [
      { label: 'a', color: 'red' },
      { label: 'b', color: 'blue' },
    ],
    data: [
      { label: 'A1', values: [1, 2] },
      { label: 'A2', values: [2, 1] },
    ],
  });

  pie3d.events.on('hover', (e) => {
    console.log(e);
  });
});
</script>

<template>
  <div ref="domRef" style="width: 500px; height: 500px; background: #ccc"></div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
