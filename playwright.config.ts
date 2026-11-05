import {defineConfig} from '@playwright/test'
export default defineConfig({testDir:'./tests/e2e',timeout:45000,expect:{timeout:10000},use:{baseURL:'http://127.0.0.1:3000',headless:true,trace:'retain-on-failure'},workers:1,reporter:'list'})
