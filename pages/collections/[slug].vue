<script setup lang="ts">const route=useRoute()</script>
<template><CatalogPage :key="String(route.params.slug)" :collection-slug="String(route.params.slug)"/></template>
