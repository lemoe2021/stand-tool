<script setup>
import { Message } from '@arco-design/web-vue';
import { IconFile, IconFolder } from '@arco-design/web-vue/es/icon';

import { onMounted, reactive, watch } from 'vue';

import { useAppStore } from '@/stores/app';
import { useDirectoryStore } from '@/stores/directory';
import { useWhitelistStore } from '@/stores/whitelist';

const appStore = useAppStore();
const directoryStore = useDirectoryStore();
const whitelistStore = useWhitelistStore();

if (!directoryStore.origin || !directoryStore.target) {
  appStore.visible = true;
}

onMounted(() => {
  initOrigin();
  initTarget();
});

watch(
  () => directoryStore.origin,
  () => {
    initOrigin();
  }
);

watch(
  () => directoryStore.target,
  () => {
    initTarget();
  }
);

let extensions = whitelistStore.extensions.split('\n');
watch(
  () => whitelistStore.extensions,
  () => {
    extensions = whitelistStore.extensions.split('\n');
  }
);

const scanDirectory = async (nodeData) => {
  const res = await window.ipcRenderer.invoke(
    'scan-directory',
    nodeData.pathname
  );
  if (!('data' in res)) {
    Message.error(res.message);
    throw res.message;
  }

  return res.data;
};

// tree
const treeRef = reactive({
  origin: null,
  target: null,
});
const treeLoading = reactive({
  origin: false,
  target: false,
});
const treeData = reactive({
  origin: [],
  target: [],
});

const initOrigin = () => {
  treeData.origin = [
    {
      pathname: directoryStore.origin,
      filename: directoryStore.origin,
      isFile: false,
      inodeNo: null,
      children: [],
    },
  ];
  initTree('origin');
};

const initTarget = () => {
  treeData.target = [
    {
      pathname: directoryStore.target,
      filename: directoryStore.target,
      isFile: false,
      inodeNo: null,
      children: [],
    },
  ];
  initTree('target');
};

const initTree = async (name) => {
  const nodeData = treeData[name][0];

  treeRef[name].expandNode(nodeData.pathname, false);
  nodeData.children = [];

  treeLoading[name] = true;
  await handleTreeLoad(name, nodeData).finally(() => {
    treeLoading[name] = false;
  });

  treeRef[name].expandNode(nodeData.pathname);
};

const handleTreeLoad = async (name, nodeData) => {
  const data = await scanDirectory(nodeData);

  const format = (list) => {
    list = list.filter((item) => !item.isFile);
    for (const item of list) {
      item.children = format(item.children);
    }
    return list;
  };
  nodeData.children = format(data);

  if (nodeData.children.length === 0) {
    nodeData.isLeaf = true;
  } else {
    treeRef[name].expandNode(nodeData.pathname);
  }

  return data;
};

const handleTreeRefresh = async (name) => {
  treeRef[name].selectAll(false);
  listData[name] = [];

  await initTree(name);
};

const handleTreeSelect = async (name, nodeData) => {
  listData[name] = [];

  listLoading[name] = true;
  listData[name] = await handleTreeLoad(name, nodeData).finally(() => {
    listLoading[name] = false;
  });

  listData[name].forEach((item) => {
    item.selected = extensions.some((extension) =>
      item.filename.endsWith(extension)
    );
  });
};

// list
const listLoading = reactive({
  origin: false,
  target: false,
});
const listData = reactive({
  origin: [],
  target: [],
});

const handleListClick = async (name, nodeData) => {
  if (!nodeData.isFile) {
    treeRef[name].selectNode(nodeData.pathname);
  }
};
</script>

<template>
  <div class="grid grid-cols-2 gap-4">
    <a-card>
      <template #extra>
        <a-button type="text" @click="handleTreeRefresh('origin')">
          <template #icon>
            <icon-refresh />
          </template>
        </a-button>
      </template>
      <a-spin :loading="treeLoading.origin" class="w-full">
        <a-tree
          :ref="(el) => (treeRef.origin = el)"
          size="mini"
          :data="treeData.origin"
          :field-names="{
            key: 'pathname',
            title: 'filename',
          }"
          :load-more="(nodeData) => handleTreeLoad('origin', nodeData)"
          :virtual-list-props="{
            height: 300,
          }"
          @select="
            (selectedKeys, data) => handleTreeSelect('origin', data.node)
          "
        />
      </a-spin>

      <a-list
        :data="listData.origin"
        size="small"
        :bordered="false"
        :loading="listLoading.origin"
        :virtual-list-props="{
          height: 300,
        }"
        class="list mt-4 h-300px"
      >
        <template #empty />
        <template #item="{ item, index }">
          <a-list-item
            :key="index"
            :class="{ 'cursor-pointer': !item.isFile }"
            @click="handleListClick('origin', item)"
          >
            <template #actions>
              <div class="flex items-center">
                <template v-if="item.isFile">
                  <a-checkbox v-model="item.selected" />
                </template>
              </div>
            </template>
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <template v-if="item.isFile">
                  <icon-file v-if="item.isFile" size="20" class="mr-2" />
                </template>
                <template v-else>
                  <icon-folder size="20" class="mr-2" />
                </template>
              </div>
              <div :title="item.filename" class="truncate">
                {{ item.filename }}
              </div>
            </div>
          </a-list-item>
        </template>
      </a-list>
    </a-card>

    <a-card>
      <template #extra>
        <a-button type="text" @click="handleTreeRefresh('target')">
          <template #icon>
            <icon-refresh />
          </template>
        </a-button>
      </template>
      <a-spin :loading="treeLoading.target" class="w-full">
        <a-tree
          :ref="(el) => (treeRef.target = el)"
          size="mini"
          :data="treeData.target"
          :field-names="{
            key: 'pathname',
            title: 'filename',
          }"
          :load-more="(nodeData) => handleTreeLoad('target', nodeData)"
          :virtual-list-props="{
            height: 300,
          }"
          @select="
            (selectedKeys, data) => handleTreeSelect('target', data.node)
          "
        />
      </a-spin>

      <a-list
        :data="listData.target"
        size="small"
        :bordered="false"
        :loading="listLoading.target"
        :virtual-list-props="{
          height: 300,
        }"
        class="list mt-4 h-300px"
      >
        <template #empty />
        <template #item="{ item, index }">
          <a-list-item
            :key="index"
            :class="{ 'cursor-pointer': !item.isFile }"
            @click="handleListClick('target', item)"
          >
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <template v-if="item.isFile">
                  <icon-file v-if="item.isFile" size="20" class="mr-2" />
                </template>
                <template v-else>
                  <icon-folder size="20" class="mr-2" />
                </template>
              </div>
              <div :title="item.filename" class="truncate">
                {{ item.filename }}
              </div>
            </div>
          </a-list-item>
        </template>
      </a-list>
    </a-card>
  </div>
</template>

<style lang="less">
.list {
  .arco-list-item-main {
    width: calc(100% - 19px);
  }
}
</style>
