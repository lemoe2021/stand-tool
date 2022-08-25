<script setup>
import { Message } from '@arco-design/web-vue';
import { computed, ref } from 'vue';

import fs from '@/utils/fs';

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  pathname: {
    type: String,
    required: true,
  },
});
const emits = defineEmits(['update:visible', 'success']);

const newVisible = computed({
  get() {
    return props.visible;
  },
  set(value) {
    emits('update:visible', value);
  },
});

const handleBeforeOpen = () => {
  form.value = {
    pathname: props.pathname,
  };
};

// form
const form = ref({});

const handleSubmit = async (data) => {
  if (data.errors) {
    return;
  }

  await fs.renameFile(props.pathname, data.values.pathname);

  Message.success('修改成功');
  newVisible.value = false;
  emits('success');
};
</script>

<template>
  <a-modal
    v-model:visible="newVisible"
    width="auto"
    title="修改名称"
    :unmount-on-close="true"
    :footer="false"
    body-style="width: 640px; height: 320px"
    @before-open="handleBeforeOpen"
  >
    <a-form :model="form" layout="vertical" @submit="handleSubmit">
      <a-form-item
        field="pathname"
        label="名称"
        :rules="[{ required: true, message: '请输入名称' }]"
      >
        <a-input v-model="form.pathname" placeholder="名称" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">确定</a-button>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
