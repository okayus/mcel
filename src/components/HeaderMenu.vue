<template>
    <div class="header-menu">
        <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">About</a></li>
            <li><a href="#">Services</a></li>
            <li><a href="#">Contact</a></li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { ref, onUpdated } from 'vue';
import { marked } from 'marked';
</script>

<style scoped>
.header-menu {
    background-color: #f2f2f2;
    max-height: 100vh;
}

ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
}

li {
    display: inline;
    margin-right: 10px;
}

a {
    text-decoration: none;
    color: #333;
}
</style>
