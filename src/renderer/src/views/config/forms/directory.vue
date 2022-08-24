<script setup>
import { Message } from '@arco-design/web-vue';
import { reactive } from 'vue';

import { useDirectoryStore } from '@/stores/directory';

const directoryStore = useDirectoryStore();

const form = reactive({
  origin: directoryStore.origin,
  target: directoryStore.target,
});

const handleSubmit = (data) => {
  if (data.errors) {
    return;
  }
  directoryStore.$patch(data.values);
  Message.success('保存成功');
};

const handleSelectDirectory = async (name) => {
  const res = await window.ipcRenderer.invoke('select-directory');
  if (res.data) {
    form[name] = res.data;
  }
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
        @search="handleSelectDirectory('origin')"
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
        @search="handleSelectDirectory('target')"
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
