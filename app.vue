<script setup lang="ts">
const cart=useCartStore(),menuOpen=ref(false),route=useRoute(),search=ref('')
watch(()=>route.fullPath,()=>menuOpen.value=false)
onMounted(()=>cart.hydrate())
function doSearch(){navigateTo({path:'/shop',query:search.value.trim()?{q:search.value.trim()}:{}});menuOpen.value=false}
</script>
<template>
  <div class="site-shell">
    <a class="skip-link" href="#main">Перейти к содержимому</a>
    <header class="site-header" :class="{'over-hero':route.path==='/'}">
      <div class="header-inner"><NuxtLink to="/" class="brand" aria-label="Deadlock Family — главная"><BrandMark/><span>Deadlock Family</span></NuxtLink><span class="header-divider"/>
        <nav class="desktop-nav" aria-label="Основная навигация"><NuxtLink to="/shop" :class="{active:route.path==='/'||route.path.startsWith('/shop')||route.path.startsWith('/products')}">Магазин</NuxtLink><NuxtLink to="/collections">Коллекции</NuxtLink><NuxtLink to="/new">Новинки</NuxtLink><NuxtLink to="/about">О нас</NuxtLink></nav>
        <div class="header-actions"><NuxtLink to="/shop#catalog-search" class="header-search" aria-label="Поиск товаров"><AppIcon name="search"/><span>Поиск</span></NuxtLink><span class="header-divider"/><NuxtLink to="/cart" class="cart-link" :aria-label="`Корзина: ${cart.count} товаров`"><AppIcon name="bag" :size="27"/><ClientOnly><span class="cart-count">{{cart.count}}</span><template #fallback><span class="cart-count">0</span></template></ClientOnly></NuxtLink><button class="icon-button mobile-menu" :aria-expanded="menuOpen" aria-label="Меню" @click="menuOpen=!menuOpen"><AppIcon :name="menuOpen?'close':'menu'"/></button></div>
      </div>
      <div v-if="menuOpen" class="mobile-navigation"><nav aria-label="Мобильная навигация"><NuxtLink to="/shop">Магазин</NuxtLink><NuxtLink to="/collections">Коллекции</NuxtLink><NuxtLink to="/new">Новинки</NuxtLink><NuxtLink to="/about">О нас</NuxtLink></nav><form class="search-field" @submit.prevent="doSearch"><AppIcon name="search"/><input v-model="search" aria-label="Поиск товаров" placeholder="Найти свою вещь…"><button aria-label="Искать"><AppIcon name="arrow"/></button></form></div>
    </header>
    <main id="main"><NuxtPage/></main>
    <footer class="site-footer"><div class="footer-main container"><NuxtLink to="/" class="brand"><BrandMark/><span>Deadlock Family<small>У каждой вещи своя история.</small></span></NuxtLink><nav aria-label="Навигация в подвале"><NuxtLink to="/shop">Магазин</NuxtLink><NuxtLink to="/collections">Коллекции</NuxtLink><NuxtLink to="/about">О сообществе</NuxtLink></nav><p>Создано для тех,<br>кто чувствует себя здесь своим.</p></div><div class="footer-bottom container"><span>© {{new Date().getFullYear()}} Deadlock Family</span><span><i class="status-dot"/> Демонстрационный магазин · без реальных продаж</span></div></footer>
  </div>
</template>
