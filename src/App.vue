<template>
  <div class="rootbox">
    <header-menu />
    <table-component />
  </div>
</template>

<script lang="ts" setup>
import TableComponent from './components/TableComponent.vue';
import HeaderMenu from './components/HeaderMenu.vue';
</script>

<style scoped>
/* コンポーネント専用のスタイルはここに記述 */
.rootbox {
  display: flex;
  flex-direction: column;
}
</style>
