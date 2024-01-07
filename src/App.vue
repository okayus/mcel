<template>
    <HeaderMenu />
    <div>
      <table-component @receiveCellValues="testFn"/>
    </div>
</template>

<script lang="ts" setup>
import HeaderMenu from './components/HeaderMenu.vue';
import TableComponent from './components/TableComponent.vue';

const testFn = (e: any) => {
  console.log(e);
}
</script>

<style scoped>
/* コンポーネント専用のスタイルはここに記述 */
</style>
