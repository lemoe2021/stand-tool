<script setup>
import zhCN from '@arco-design/web-vue/es/locale/lang/zh-cn';
import { computed } from 'vue';

import { useMenuStore } from '@/stores/menu';
import Config from '@/views/config/index.vue';
import Home from '@/views/home/index.vue';

const menuStore = useMenuStore();

const visible = computed({
  get() {
    return menuStore.visible;
  },
  set(value) {
    menuStore.visible = value;
  },
});
</script>

<template>
  <a-config-provider :locale="zhCN">
    <main>
      <a-layout>
        <a-layout-sider class="h-screen" style="width: 64px">
          <div class="flex flex-col items-center h-full p-4">
            <div class="w-full mt-auto">
              <div class="flex justify-center">
                <a-button type="text" @click="() => (visible = true)">
                  <template #icon>
                    <icon-settings size="32" />
                  </template>
                </a-button>
              </div>
            </div>
          </div>
        </a-layout-sider>
        <a-layout-content>
          <div class="p-4">
            <home />
          </div>
        </a-layout-content>
      </a-layout>
    </main>

    <config v-model:visible="visible" />
  </a-config-provider>
</template>

<style lang="less">
body {
  min-height: 100vh;
  color: var(--color-text-2);
  font-size: 14px;
  background-color: var(--color-bg-1);
}
</style>
