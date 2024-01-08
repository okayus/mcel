<template>
    <HeaderMenu 
    :cellValues="cellValues"
    @receive-markdown-type="receiveMarkdownType"
    />
    <div>
      <table-component @receiveCellValues="receiveCellValues"/>
    </div>
</template>

<script lang="ts" setup>
import HeaderMenu from './components/HeaderMenu.vue';
import TableComponent from './components/TableComponent.vue';
import { ref, reactive } from 'vue';

const cellValues = reactive({
  value: ''
});

const selectedOption = ref<string>('');

const receiveCellValues = (e: any) => {
  return cellValues.value = e;
}

const receiveMarkdownType = (e: any) => {
  console.log(e);
  return selectedOption.value = e;
}
</script>

<style scoped>
/* コンポーネント専用のスタイルはここに記述 */
</style>
