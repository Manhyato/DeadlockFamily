<script setup lang="ts">
defineProps<{title:string;message:string;confirmLabel?:string}>()
const emit=defineEmits<{confirm:[];cancel:[]}>(),dialog=ref<HTMLElement|null>(null),cancel=ref<HTMLButtonElement|null>(null)
let previous:Element|null=null
function key(event:KeyboardEvent){if(event.key==='Escape')emit('cancel');if(event.key==='Tab'&&dialog.value){const buttons=Array.from(dialog.value.querySelectorAll<HTMLElement>('button'));const first=buttons[0],last=buttons[buttons.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}}}
onMounted(()=>{previous=document.activeElement;cancel.value?.focus();document.addEventListener('keydown',key)})
onBeforeUnmount(()=>{document.removeEventListener('keydown',key);(previous as HTMLElement)?.focus()})
</script>
<template><Teleport to="body"><div class="confirm-overlay" @click.self="$emit('cancel')"><section ref="dialog" class="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description"><h2 id="confirm-title">{{title}}</h2><p id="confirm-description">{{message}}</p><div><button ref="cancel" class="btn" @click="$emit('cancel')">Отмена</button><button class="btn btn-danger" @click="$emit('confirm')">{{confirmLabel||'Подтвердить'}}</button></div></section></div></Teleport></template>
