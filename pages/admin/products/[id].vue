<script setup lang="ts">const route=useRoute();useSeoMeta({title:'Редактирование товара — Deadlock Family'})</script>
<template><AdminShell title="Редактирование товара"><ProductEditor :key="String(route.params.id)" :product-id="String(route.params.id)"/></AdminShell></template>
