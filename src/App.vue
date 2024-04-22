<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { PieCircle } from '../lib/charts/pieCircle/index';

const domRef = ref<HTMLElement>();
onMounted(() => {
  const pie3d = new PieCircle(domRef.value!);

  // pie3d.draw();
  pie3d.setData([
    { label: 'Basic', color: '#2B80FF', value: 50 },
    { label: 'Plus', color: '#E5FF47', value: 20 },
    { label: 'Lite', color: '#FF912B', value: 30 },
    { label: 'Elite', color: '#FF3030', value: 18 },
  ]);

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
