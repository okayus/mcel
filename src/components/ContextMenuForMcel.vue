<script setup lang="ts">
import ContextMenu from '@imengyu/vue3-context-menu'

const onContextMenu = (e: MouseEvent) => {
    e.preventDefault();
  //show your menu
  ContextMenu.showContextMenu({
    x: e.x,
    y: e.y,
    items: [
      { 
        label: "A menu item", 
        onClick: () => {
          alert("You click a menu item");
        }
      },
      { 
        label: "A submenu", 
        children: [
          { label: "Item1" },
          { label: "Item2" },
          { label: "Item3" },
        ]
      },
    ]
  });
}
</script>
```
<template>
  <div class="box" @contextmenu="onContextMenu($event)">
  </div>
</template>
