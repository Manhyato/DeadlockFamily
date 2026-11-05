<script setup lang="ts">
import {money,isNew} from '~/shared/types'
import type {Product} from '~/shared/types'
defineProps<{product:Product;priority?:boolean}>()
</script>
<template><NuxtLink :to="`/products/${product.slug}`" class="product-card group">
  <div class="product-visual"><img :src="product.images[0]?.url" :alt="product.images[0]?.alt||product.name" :loading="priority?'eager':'lazy'" width="640" height="400"><span v-if="!product.variants.some(v=>v.available&&v.stock>0)" class="badge badge-muted">В архиве</span><span v-else-if="isNew(product)" class="badge">Новинка</span><span class="product-open"><AppIcon name="arrow" :size="20"/></span></div>
  <div class="product-caption"><h3>{{product.name}}</h3><span>{{money(product.price)}}</span></div>
</NuxtLink></template>
