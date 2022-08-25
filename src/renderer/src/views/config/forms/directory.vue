<script setup>
import { Message } from '@arco-design/web-vue';
import { reactive } from 'vue';

import { useDirectoryStore } from '@/stores/directory';
import fs from '@/utils/fs';

const directoryStore = useDirectoryStore();

// form
const form = reactive({
  origin: directoryStore.origin,
  target: directoryStore.target,
});

const handleChooseDirectory = async (name) => {
  const res = await fs.chooseDirectory();

  if (res) {
    form[name] = res;
  }
};

const handleSubmit = (data) => {
  if (data.errors) {
    return;
  }

  directoryStore.$patch(data.values);
  Message.success('保存成功');
};
</script>

<template>
  <a-form :model="form" layout="vertical" @submit="handleSubmit">
    <a-form-item
      field="origin"
      label="源路径"
      :rules="[{ required: true, message: '请输入源路径' }]"
    >
      <a-input-search
        v-model="form.origin"
        readonly
        search-button
        @search="handleChooseDirectory('origin')"
      >
        <template #button-icon>
          <icon-folder />
        </template>
      </a-input-search>
    </a-form-item>
    <a-form-item
      field="target"
      label="目标路径"
      :rules="[{ required: true, message: '请输入目标路径' }]"
    >
      <a-input-search
        v-model="form.target"
        readonly
        search-button
        @search="handleChooseDirectory('target')"
      >
        <template #button-icon>
          <icon-folder />
        </template>
      </a-input-search>
    </a-form-item>
    <a-form-item>
      <a-button type="primary" html-type="submit">保存</a-button>
    </a-form-item>
  </a-form>
</template>
