<script setup>
import { Message } from '@arco-design/web-vue';
import { reactive } from 'vue';

import { useWhitelistStore } from '@/stores/whitelist';

const whitelistStore = useWhitelistStore();

const form = reactive({
  extensions: whitelistStore.extensions,
});

const handleSubmit = (data) => {
  if (data.errors) {
    return;
  }
  data.values.extensions = data.values.extensions.trim();
  whitelistStore.$patch(data.values);
  Message.success('保存成功');
};
</script>

<template>
  <a-form :model="form" layout="vertical" @submit="handleSubmit">
    <a-form-item field="extensions" label="扩展名">
      <a-textarea
        v-model="form.extensions"
        placeholder=".mp4&#10;.mkv&#10;.srt&#10;.ass"
        :auto-size="{
          minRows: 5,
        }"
      />
      <template #extra>
        <div>每行一个</div>
      </template>
    </a-form-item>
    <a-form-item>
      <a-button type="primary" html-type="submit">保存</a-button>
    </a-form-item>
  </a-form>
</template>
