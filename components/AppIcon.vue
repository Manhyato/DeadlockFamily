<script setup lang="ts">
withDefaults(defineProps<{name:string;size?:number}>(),{size:22})
const paths:Record<string,string>={
 search:'m21 21-5-5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
 bag:'M5 7h14l2 14H3L5 7Zm3 0V5a4 4 0 0 1 8 0v2',
 arrow:'M4 12h16m-6-6 6 6-6 6',close:'m6 6 12 12M6 18 18 6',menu:'M3 6h18M3 12h18M3 18h18',
 shirt:'m8 3-6 4 3 5 3-2v11h8V10l3 2 3-5-6-4a4 4 0 0 1-8 0Z',
 key:'M14 10a5 5 0 1 0-4-4m0 4L3 17v4h4v-3h3v-3l4-4Zm3-6h.01',
 figurine:'M9 5a3 3 0 1 0 6 0 3 3 0 0 0-6 0Zm1 4-4 9h12l-4-9M7 21h10M12 18v3',
 sparkles:'m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2ZM20 2v4m-2-2h4',
 check:'m5 12 4 4L19 6',minus:'M5 12h14',plus:'M5 12h14M12 5v14',trash:'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7',
 box:'m3 7 9-5 9 5v10l-9 5-9-5V7Zm0 0 9 5 9-5M12 12v10m-4-17 9 5',
 heart:'M20 4a5 5 0 0 0-8 2 5 5 0 0 0-8-2c-5 5 3 12 8 16 5-4 13-11 8-16Z',
 filter:'M4 7h16M4 17h16M8 4v6m8 4v6',chevron:'m8 4 8 8-8 8',refresh:'M20 8a8 8 0 1 0 0 8M20 2v6h-6',leaf:'M20 3C5 1 1 10 7 17c7 6 16 2 13-14ZM5 20 17 7'
}
</script>
<template><svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="paths[name]||paths.sparkles"/></svg></template>
