export default defineNuxtConfig({
  compatibilityDate: '2026-11-05',
  devtools: { enabled: false },
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  typescript: { strict: true },
  runtimeConfig: { public: { apiBase: '/api/v1' } },
  app: { head: {
    htmlAttrs: { lang: 'ru' },
    title: 'Deadlock Family — вещи со своей историей',
    meta: [{ name: 'description', content: 'Мерч, коллекционные вещи и маленькие артефакты из мира Deadlock. Демонстрационный магазин Deadlock Family.' }, { property: 'og:image', content: '/assets/archive.webp' }, { name: 'theme-color', content: '#14130f' }],
    link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }]
  }},
  telemetry: false
})
