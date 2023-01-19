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
    filename: '',
  };
};

// form
const form = ref({});

const handleFormat = () => {
  form.value.filename = form.value.filename.replaceAll(/\s+/g, '.');
};

const handleSubmit = async (data) => {
  if (data.errors) {
    return;
  }

  const pathname = `${props.pathname}/${data.values.filename.trim()}`;
  await fs.makeDirectory(pathname);

  Message.success('创建成功');
  newVisible.value = false;
  emits('success', pathname);
};
</script>

<template>
  <a-modal
    v-model:visible="newVisible"
    width="auto"
    title="创建目录"
    :unmount-on-close="true"
    :footer="false"
    body-style="width: 640px; height: 320px"
    @before-open="handleBeforeOpen"
  >
    <a-form :model="form" layout="vertical" @submit="handleSubmit">
      <a-form-item
        field="filename"
        label="目录名"
        :rules="[{ required: true, message: '请输入目录名' }]"
      >
        <a-input v-model="form.filename" placeholder="目录名">
          <template #prepend>
            <span :title="`${pathname}/`" class="truncate max-w-300px">
              {{ pathname }}/
            </span>
          </template>
          <template #append>
            <span class="arco-icon-hover" @click="handleFormat">
              <icon-translate />
            </span>
          </template>
        </a-input>
        <template #extra>
          <a-space wrap>
            <a-button
              v-for="i in 12"
              :key="i"
              size="mini"
              @click="
                () =>
                  (form.filename = `Season ${i.toString().padStart(2, '0')}`)
              "
            >
              Season {{ i.toString().padStart(2, '0') }}
            </a-button>
          </a-space>
        </template>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">确定</a-button>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
