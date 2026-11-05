export type ProductStatus = 'draft' | 'published' | 'archived'
export type OrderStatus = 'demo_created' | 'demo_processing' | 'demo_completed' | 'demo_cancelled'
export interface Category { id: string; slug: string; name: string; icon: string; description: string }
export interface ProductImage { url: string; alt: string }
export interface ProductVariant { id: string; sku: string; size?: string; color?: string; stock: number; available: boolean; price?: number }
export interface Product {
  id: string; slug: string; name: string; shortDescription: string; description: string;
  category: string; collectionIds: string[]; tags: string[]; images: ProductImage[];
  price: number; currency: 'RUB'; variants: ProductVariant[]; status: ProductStatus;
  isFeatured: boolean; publishedAt: string | null; createdAt: string; updatedAt: string;
}
export interface Collection { id: string; slug: string; name: string; description: string; cover: string; isFeatured: boolean }
export interface CartItem { productId: string; variantId: string; quantity: number; expectedPrice: number }
export interface OrderItem extends CartItem { name: string; variantLabel: string; price: number; image: string }
export interface Order { id: string; number: string; items: OrderItem[]; subtotal: number; shipping: number; total: number; status: OrderStatus; createdAt: string; delivery: string }
export interface DemoState { products: Product[]; collections: Collection[]; orders: Order[] }
export interface PageResult<T> { items: T[]; total: number; page: number; pageSize: number }
export interface ProductQuery { q?: string; category?: string; collection?: string; available?: string; sort?: string; page?: number; pageSize?: number; featured?: string; new?: string; status?: string; scenario?: string }
export interface QuoteLine extends OrderItem { stock: number; available: boolean; changed: boolean }
export interface CartQuote { items: QuoteLine[]; subtotal: number; valid: boolean; changed: boolean }
export interface OrderInput { items: CartItem[]; contact: { name: string; email: string; address: string }; delivery: string; demoConsent: boolean }
export const money = (value: number) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(value / 100)
export const variantLabel = (v: ProductVariant) => [v.size, v.color].filter(Boolean).join(' / ') || 'Стандартный'
export const isNew = (p: Product) => Boolean(p.publishedAt && Date.now() - Date.parse(p.publishedAt) < 30 * 86400000)
