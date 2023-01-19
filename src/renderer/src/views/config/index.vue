<script setup>
import { computed, ref, toRaw } from 'vue';

import { useMenuStore } from '@/stores/menu';
import BlacklistForm from './forms/blacklist.vue';
import DirectoryForm from './forms/directory.vue';
import WhitelistForm from './forms/whitelist.vue';

const menuStore = useMenuStore();

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
});
const emits = defineEmits(['update:visible']);

const newVisible = computed({
  get() {
    return props.visible;
  },
  set(value) {
    emits('update:visible', value);
  },
});

// menu
const handleMenuItemClick = (key) => {
  switch (key) {
    case 'directory':
      component.value = DirectoryForm;
      break;
    case 'whitelist':
      component.value = WhitelistForm;
      break;
    case 'blacklist':
      component.value = BlacklistForm;
      break;
  }
};

// form
const component = ref(DirectoryForm);
</script>

<template>
  <a-modal
    v-model:visible="newVisible"
    width="auto"
    title="设置"
    :unmount-on-close="true"
    :footer="false"
    body-style="width: 640px; height: 320px; padding: 0"
  >
    <a-layout class="h-full">
      <a-layout-sider class="h-full">
        <a-menu
          v-model:selected-keys="menuStore.selectedKeys"
          class="h-full"
          @menu-item-click="handleMenuItemClick"
        >
          <a-menu-item key="directory">
            <template #icon><icon-folder size="20" /></template>
            路径
          </a-menu-item>
          <a-menu-item key="whitelist">
            <template #icon><icon-robot size="20" /></template>
            扩展名白名单
          </a-menu-item>
          <a-menu-item key="blacklist">
            <template #icon><icon-robot size="20" /></template>
            正则表达式黑名单
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      <a-layout-content>
        <div class="p-4">
          <component :is="toRaw(component)" />
        </div>
      </a-layout-content>
    </a-layout>
  </a-modal>
</template>
