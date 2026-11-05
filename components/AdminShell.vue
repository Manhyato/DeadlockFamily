<script setup lang="ts">
defineProps<{title:string}>()
useSeoMeta({robots:'noindex,nofollow'})
</script>
<template><div class="container page"><div class="admin-banner"><div><span class="eyebrow">DEADLOCK FAMILY · УПРАВЛЕНИЕ АРХИВОМ</span><h1>{{title}}</h1></div><NuxtLink to="/shop" class="text-link">Открыть магазин <AppIcon name="arrow" :size="17"/></NuxtLink></div><div class="notice">Демо-панель без настоящей авторизации. Изменения видны только в этой браузерной сессии и могут сбрасываться при перезапуске сервера. Используйте вымышленные данные.</div><nav class="admin-tabs" aria-label="Административная навигация"><NuxtLink to="/admin">Обзор</NuxtLink><NuxtLink to="/admin/products">Товары</NuxtLink><NuxtLink to="/admin/collections">Коллекции</NuxtLink><NuxtLink to="/admin/orders">Тестовые заказы</NuxtLink></nav><slot/></div></template>
