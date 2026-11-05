<script setup lang="ts">
import {money,variantLabel,isNew} from '~/shared/types'
import {detailImageUrl,productImageSources} from '~/shared/product-images'
const route=useRoute(),api=useApi(),cart=useCartStore()
const {data:product,error,pending,refresh}=await useAsyncData(()=>`product-${route.params.slug}`,()=>api.product(String(route.params.slug)))
if(error.value&&(error.value as {statusCode?:number}).statusCode===404)throw createError({statusCode:404,statusMessage:'Товар не найден'})
const defaultVariant=()=>product.value?.variants.find(v=>v.available&&v.stock>0)?.id||product.value?.variants[0]?.id||''
const selected=ref(defaultVariant()),imageIndex=ref(0),added=ref(false),addError=ref('')
const variant=computed(()=>product.value?.variants.find(v=>v.id===selected.value))
const inStock=computed(()=>Boolean(variant.value?.available&&variant.value.stock>0))
const currentImage=computed(()=>product.value?.images[imageIndex.value])
watch(()=>product.value?.id,()=>{selected.value=defaultVariant();imageIndex.value=0})
function add(){if(!product.value||!variant.value||!inStock.value)return;cart.hydrate();if(cart.add(product.value,variant.value)){added.value=true;addError.value=''}else addError.value='В корзине уже максимальное доступное количество.'}
watch(selected,()=>{added.value=false;addError.value=''})
function refreshAvailability(){if(document.visibilityState==='visible')refresh()}
onMounted(()=>{window.addEventListener('focus',refreshAvailability);window.addEventListener('pageshow',refreshAvailability);document.addEventListener('visibilitychange',refreshAvailability)})
onBeforeUnmount(()=>{window.removeEventListener('focus',refreshAvailability);window.removeEventListener('pageshow',refreshAvailability);document.removeEventListener('visibilitychange',refreshAvailability)})
useSeoMeta({title:()=>`${product.value?.name||'Товар'} — Deadlock Family`,description:()=>product.value?.shortDescription,ogTitle:()=>product.value?.name,ogImage:()=>detailImageUrl(product.value?.images[0])})
</script>
<template>
  <div class="container page">
    <div class="breadcrumbs"><NuxtLink to="/">Главная</NuxtLink><AppIcon name="chevron"/><NuxtLink to="/shop">Магазин</NuxtLink><AppIcon name="chevron"/><span>{{product?.name||'Товар'}}</span></div>
    <ApiState :pending="pending" :error="error" @retry="refresh()"/>
    <div v-if="product&&!error&&!pending" class="product-detail">
      <div class="product-gallery">
        <img :src="detailImageUrl(currentImage)" :srcset="productImageSources(currentImage)" sizes="(max-width:700px) 100vw, 55vw" :alt="currentImage?.alt||product.name" width="1536" height="1024" fetchpriority="high">
        <div v-if="product.images.length>1" class="thumbnails"><button v-for="(image,i) in product.images" :key="i" :class="{selected:i===imageIndex}" :aria-label="`Изображение ${i+1}`" @click="imageIndex=i"><img :src="image.url" :alt="image.alt"></button></div>
      </div>
      <div class="product-info">
        <span class="eyebrow">{{isNew(product)?'НОВАЯ ГЛАВА В АРХИВЕ':'ИЗ КОЛЛЕКЦИИ DEADLOCK FAMILY'}}</span>
        <h1>{{product.name}}</h1><p class="short-description">{{product.shortDescription}}</p><div class="product-price">{{money(variant?.price??product.price)}}</div>
        <p class="sidebar-label">{{product.category==='clothing'?'Выберите размер и цвет':'Вариант'}}</p>
        <div class="size-options"><button v-for="v in product.variants" :key="v.id" class="size-button" :class="{selected:selected===v.id}" :disabled="!v.available||v.stock===0" :aria-pressed="selected===v.id" :title="!v.available||!v.stock?'Нет в наличии':`В наличии: ${v.stock} шт.`" @click="selected=v.id">{{variantLabel(v)}}</button></div>
        <p class="stock-status" :class="{'stock-empty':!inStock}" aria-live="polite">{{inStock?`В наличии: ${variant!.stock} шт. · SKU ${variant!.sku}`:`Нет в наличии${variant?` · Остаток: ${variant.stock} шт. · SKU ${variant.sku}`:''}`}}</p>
        <p v-if="!inStock" class="notice stock-notice">{{product.variants.some(v=>v.available&&v.stock>0)?'Этот вариант закончился. Выберите другой размер или цвет.':'Все доступные экземпляры разобраны. Товар остаётся в каталоге — ожидаем пополнение.'}}</p>
        <button class="btn btn-primary" :disabled="!inStock" @click="add"><AppIcon :name="added?'check':'bag'" :size="20"/>{{!inStock?'Нет в наличии':added?'Добавлено в корзину':'Добавить в корзину'}}<span style="margin-left:auto">{{money(variant?.price??product.price)}}</span></button>
        <NuxtLink v-if="added" to="/cart" class="text-link" aria-live="polite">Перейти в корзину <AppIcon name="arrow" :size="16"/></NuxtLink>
        <p v-if="addError" class="notice error" role="alert">{{addError}}</p>
        <div class="purchase-benefits"><span><AppIcon name="box"/>Тестовая доставка</span><span><AppIcon name="heart"/>Создано для семьи</span></div>
        <div class="product-description"><h2>В деталях</h2>{{product.description}}</div>
      </div>
    </div>
  </div>
</template>