<script setup lang="ts">const route=useRoute()</script>
<template><CatalogPage :key="String(route.params.slug)" :category-slug="String(route.params.slug)"/></template>
