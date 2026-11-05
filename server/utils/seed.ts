import type { Category, Collection, Product, DemoState } from '../../shared/types'
export const categories: Category[] = [
  { id:'clothing',slug:'clothing',name:'Одежда',icon:'shirt',description:'Любимые вещи на каждый день' },
  { id:'keychains',slug:'keychains',name:'Брелки',icon:'key',description:'Маленькие символы большой семьи' },
  { id:'figurines',slug:'figurines',name:'Фигурки',icon:'figurine',description:'Герои, которые остаются рядом' },
  { id:'souvenirs',slug:'souvenirs',name:'Сувениры',icon:'sparkles',description:'Находки из секретного архива' }
]
export function createSeed(): DemoState {
  const now = Date.now()
  const collections: Collection[] = [
    { id:'essentials',slug:'essentials',name:'Символы семьи',description:'Знакомый знак. Свои люди. Вещи, которые объединяют.',cover:'/assets/collection-essentials.webp',isFeatured:true },
    { id:'archive',slug:'archive',name:'Из архива',description:'Истории города, запечатлённые в деталях.',cover:'/assets/collection-archive.webp',isFeatured:true },
    { id:'collectors',slug:'collectors',name:'Особые находки',description:'Для тех, кто замечает больше остальных.',cover:'/assets/collection-collectors.webp',isFeatured:true }
  ]
  const rows = [
    ['archive-hoodie','Худи «Архив»','clothing',590000,'hoodie','essentials','Плотный хлопок, свободный силуэт и вышитый знак DF.'],
    ['skyline-tee','Футболка «Город»','clothing',290000,'tee','archive','Силуэт города, который не спит. Мягкий хлопок и авторский принт.'],
    ['df-keychain','Брелок «Символ семьи»','keychains',89000,'keychain','essentials','Тяжёлая латунь, знакомые инициалы. Маленький артефакт на каждый день.'],
    ['spire-poster','Постер «Шпиль»','souvenirs',149000,'poster','archive','Тихое свечение над городом. Иллюстрация на плотной матовой бумаге.'],
    ['archivist','Фигурка «Хранитель архива»','figurines',690000,'archivist','collectors','Хранитель городских историй с фонарём. Коллекционная фигурка, 18 см.'],
    ['compass-keychain','Брелок «Компас»','keychains',119000,'compass','collectors','Чтобы всегда находить дорогу к своим. Латунь с тёмной патиной.'],
    ['archive-notebook','Блокнот «Тайные записи»','souvenirs',179000,'notebook','archive','Для планов, зарисовок и теорий. Тиснение на обложке и кремовая бумага.'],
    ['family-hoodie','Худи «После полуночи»','clothing',620000,'hoodie','collectors','Тёмный хлопок и мягкий начёс. Специальная архивная серия.'],
    ['family-tee','Футболка «Свои люди»','clothing',270000,'tee','essentials','Базовая футболка цвета пергамента с принтом города.'],
    ['guardian','Фигурка «Ночной дозор»','figurines',750000,'archivist','collectors','Детальная миниатюра из смолы с бронзовой отделкой.'],
    ['archive-print','Принт «Зелёный свет»','souvenirs',99000,'poster','archive','Небольшой фрагмент большого мира. Формат А4, без рамы.'],
    ['secret-token','Брелок «Тайный знак»','keychains',79000,'keychain','essentials','Лимитированный жетон с рельефным знаком сообщества.']
  ]
  const products: Product[] = rows.map((row,i) => {
    const [slug,name,category,price,asset,collection,shortDescription] = row as [string,string,string,number,string,string,string]
    const publishedAt = new Date(now-i*4*86400000).toISOString()
    return { id:`p${i+1}`,slug,name,shortDescription,description:`${shortDescription}\n\nСоздано для Deadlock Family — сообщества, в котором каждая деталь рассказывает свою историю. Тёплые фактуры, сдержанные цвета и внимание к мелочам.\n\nДемонстрационный товар. Фотографии и характеристики используются для проверки интерфейса; реальная продажа не производится.`,category,collectionIds:[collection],tags:['Deadlock','DF',name,category==='clothing'?'хлопок одежда':'коллекционный артефакт'],images:[{url:`/assets/${asset}.webp`,alt:name}],price,currency:'RUB',
      variants:(category==='clothing'?['S','M','L','XL']:['']).map((size,j)=>({id:`v${i+1}-${j}`,sku:`DF-${i+1}-${size||'STD'}`,size,color:category==='clothing'?(asset==='tee'?'Пергамент':'Угольный'):undefined,stock:i===11?0:j===3?0:8+j,available:i!==11&&j!==3})),status:'published',isFeatured:i<7,publishedAt,createdAt:publishedAt,updatedAt:publishedAt }
  })
  return {products,collections,orders:[]}
}
