<template>
    <HeaderMenu :cellValues="cellValues"/>
    <div>
      <table-component @receiveCellValues="receiveCellValues"/>
    </div>
</template>

<script lang="ts" setup>
import HeaderMenu from './components/HeaderMenu.vue';
import TableComponent from './components/TableComponent.vue';
import { reactive } from 'vue';

const cellValues = reactive({
  value: ''
});
const receiveCellValues = (e: any) => {
  return cellValues.value = e;
}
</script>

<style scoped>
/* コンポーネント専用のスタイルはここに記述 */
</style>
