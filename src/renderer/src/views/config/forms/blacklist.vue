<script setup>
import { Message } from '@arco-design/web-vue';
import { reactive } from 'vue';

import { useBlacklistStore } from '@/stores/blacklist';

const blacklistStore = useBlacklistStore();

const form = reactive({
  expressions: blacklistStore.expressions,
});

const handleSubmit = (data) => {
  if (data.errors) {
    return;
  }

  data.values.expressions = data.values.expressions
    .trim()
    .split('\n')
    .map((item) => item.trim())
    .join('\n');
  blacklistStore.$patch(data.values);
  Message.success('保存成功');
};
</script>

<template>
  <a-form :model="form" layout="vertical" @submit="handleSubmit">
    <a-form-item field="expressions" label="正则表达式">
      <a-textarea
        v-model="form.expressions"
        placeholder="tc.srt&#10;tc.ass"
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
