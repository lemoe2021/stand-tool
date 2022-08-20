<script setup>
import { computed, defineAsyncComponent, ref } from 'vue';

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

const name = ref('directory');

const component = computed(() =>
  defineAsyncComponent(() => import(`./forms/${name.value}.vue`))
);
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
          :default-selected-keys="['directory']"
          class="h-full"
          @menu-item-click="(key) => (name = key)"
        >
          <a-menu-item key="directory">
            <template #icon><icon-folder size="20" /></template>
            路径
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      <a-layout-content>
        <div class="p-4">
          <component :is="component" />
        </div>
      </a-layout-content>
    </a-layout>
  </a-modal>
</template>
