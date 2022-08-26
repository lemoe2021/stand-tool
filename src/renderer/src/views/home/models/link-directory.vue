<script setup>
import { Message } from '@arco-design/web-vue';
import { computed, ref, watch } from 'vue';

import fs from '@/utils/fs';

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  originNodeDatas: {
    type: Array,
    required: true,
  },
  targetNodeData: {
    type: Object,
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
  const found1 = props.targetNodeData.pathname.match(
    /^([/\\].+)+[/\\](?<showName>.+)[/\\]Season \d+$/i
  );
  const showName = found1 ? found1.groups.showName : '';
  const found2 = props.targetNodeData.filename.match(
    /Season (?<seasonNo>\d+)/i
  );
  const seasonNo = found2
    ? found2.groups.seasonNo.toString().padStart(2, '0')
    : '';
  form.value = {
    showName,
    seasonNo,
    files: [],
  };
  constructName();
};

// form
const form = ref({});

watch([() => form.value.showName, () => form.value.seasonNo], () => {
  constructName();
});

const constructName = () => {
  form.value.files = props.originNodeDatas.map((item) => {
    let filename = '';
    const found = item.filename.match(
      /^.*?[e[](?<episodeNo>\d+).*\.(?<extension>\w+)$/i
    );
    if (found) {
      const episodeNo = found.groups.episodeNo.toString().padStart(2, '0');
      const extension = found.groups.extension;
      filename = `${form.value.showName}.s${form.value.seasonNo}e${episodeNo}.${extension}`;
    }

    return {
      originFilename: item.filename,
      originPathname: item.pathname,
      targetFilename: filename,
    };
  });
};

const handleSubmit = async (data) => {
  if (data.errors) {
    return;
  }

  for (const file of data.values.files.filter((item) => item.targetFilename)) {
    await fs.linkFile(
      file.originPathname,
      `${props.targetNodeData.pathname}/${file.targetFilename}`
    );
  }

  Message.success('创建成功');
  newVisible.value = false;
  emits('success');
};
</script>

<template>
  <a-modal
    v-model:visible="newVisible"
    width="auto"
    title="创建硬链接"
    :unmount-on-close="true"
    :footer="false"
    body-style="width: 640px; height: 320px"
    @before-open="handleBeforeOpen"
  >
    <a-form :model="form" layout="vertical" @submit="handleSubmit">
      <a-form-item
        field="showName"
        label="名称"
        :rules="[{ required: true, message: '请输入名称' }]"
      >
        <a-input v-model="form.showName" placeholder="名称" />
      </a-form-item>
      <a-form-item
        field="seasonNo"
        label="季数"
        :rules="[{ required: true, message: '请输入季数' }]"
      >
        <a-input v-model="form.seasonNo" placeholder="季数" />
      </a-form-item>
      <a-form-item
        v-for="(filename, index) of form.files"
        :key="index"
        :field="`files.${index}.targetFilename`"
        hide-label
      >
        <a-input
          v-model="form.files[index].targetFilename"
          placeholder="文件名"
        >
          <template #prepend>
            <span
              :title="`${targetNodeData.pathname}/`"
              class="truncate max-w-300px"
            >
              {{ targetNodeData.pathname }}/
            </span>
          </template>
        </a-input>
        <template #extra>
          {{ form.files[index].originFilename }}
        </template>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">确定</a-button>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
