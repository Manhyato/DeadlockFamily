<script setup lang="ts">
const api=useApi(),search=ref('')
const {data:products,pending,error,refresh}=await useAsyncData('home-products',()=>api.products({pageSize:4,new:'true'}))
const {data:collections}=await useAsyncData('home-collections',()=>api.collections())
const {data:categories}=await useAsyncData('categories',()=>api.categories())
const {data:featured}=await useAsyncData('home-featured',()=>api.products({featured:'true',pageSize:4,sort:'price-asc'}))
function submit(){navigateTo({path:'/shop',query:search.value.trim()?{q:search.value.trim()}:{}})}
useSeoMeta({title:'Deadlock Family — вещи со своей историей',ogTitle:'Deadlock Family — магазин мерча',ogDescription:'Небольшие артефакты большого мира. Одежда, брелки, фигурки и сувениры.'})
</script>
<template><div>
  <section class="hero"><picture class="hero-background"><source media="(max-width:640px)" srcset="/assets/archive-mobile.webp"><img src="/assets/archive.webp" alt="" fetchpriority="high" width="1678" height="937"></picture><div class="hero-shade"/>
    <div class="hero-content"><div class="hero-kicker"><span/>МЕРЧ ИЗ МИРА DEADLOCK<span/></div><h1>Deadlock Family</h1><p>Вещи со своей историей.<br>Для тех, кто в семье.</p><form class="hero-search" role="search" @submit.prevent="submit"><AppIcon name="search" :size="21"/><input v-model="search" aria-label="Поиск по магазину" placeholder="Найти свою вещь в архиве…"><button type="submit" aria-label="Найти"><AppIcon name="arrow" :size="20"/></button></form><span class="hero-caption">Одежда, артефакты и немного магии</span></div>
    <div class="hero-edition"><span>АРХИВ № 001</span><span>ОТКРЫТ ДЛЯ СВОИХ</span></div>
  </section>
  <div class="category-wrap"><nav class="category-bar container" aria-label="Категории товаров"><NuxtLink v-for="category in categories" :key="category.id" :to="`/shop/category/${category.slug}`"><AppIcon :name="category.icon" :size="35"/><div><span>{{category.name}}</span><small>{{category.description}}</small></div><AppIcon class="category-arrow" name="arrow" :size="18"/></NuxtLink></nav></div>
  <div class="ornament"><span/>✧<span/></div>
  <section class="home-section container"><div class="section-heading"><div><span class="eyebrow">Новые главы нашей истории</span><h2>Недавно в архиве</h2></div><NuxtLink to="/new" class="text-link">Все новинки <AppIcon name="arrow" :size="18"/></NuxtLink></div><ApiState :pending="pending" :error="error" :empty="!products?.items.length" @retry="refresh()"/><div v-if="!pending&&!error" class="product-grid"><ProductCard v-for="product in products?.items" :key="product.id" :product="product" priority/></div></section>
  <section class="home-section collection-section container"><div class="section-heading"><div><span class="eyebrow">Собрано с особым чувством</span><h2>Найдите что-то своё</h2></div><NuxtLink to="/collections" class="text-link">Все коллекции <AppIcon name="arrow" :size="18"/></NuxtLink></div><div class="collection-grid"><CollectionCard v-for="collection in collections?.filter(c=>c.isFeatured)" :key="collection.id" :collection="collection"/></div></section>
  <section v-if="featured?.items.length" class="home-section container" style="padding-top:38px"><div class="section-heading"><div><span class="eyebrow">РЕКОМЕНДУЕМ ПРИСМОТРЕТЬСЯ</span><h2>Избранное семьёй</h2></div><NuxtLink to="/shop?featured=true" class="text-link">Все находки <AppIcon name="arrow" :size="18"/></NuxtLink></div><div class="product-grid"><ProductCard v-for="product in featured.items" :key="product.id" :product="product"/></div></section>
  <section class="family-note container"><AppIcon name="sparkles" :size="28"/><p>Больше, чем просто мерч.<br><span>Маленький знак того, что мы на одной стороне.</span></p><NuxtLink to="/about" class="text-link">История семьи <AppIcon name="arrow" :size="18"/></NuxtLink></section>
</div></template>
