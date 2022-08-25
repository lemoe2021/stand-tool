<script setup>
import { Message } from '@arco-design/web-vue';
import { IconFile, IconFolder } from '@arco-design/web-vue/es/icon';

import { nextTick, onMounted, reactive, watch } from 'vue';

import { useMenuStore } from '@/stores/menu';
import { useDirectoryStore } from '@/stores/directory';
import { useWhitelistStore } from '@/stores/whitelist';
import fs from '@/utils/fs';
import makeDirectoryModel from './models/make-directory.vue';
import renameFileModel from './models/rename-file.vue';

const menuStore = useMenuStore();
const directoryStore = useDirectoryStore();
const whitelistStore = useWhitelistStore();

// directory
const directoryCheck = () => {
  if (!directoryStore.origin || !directoryStore.target) {
    menuStore.selectedKeys = ['directory'];
    menuStore.visible = true;
  }
};
directoryCheck();

watch(
  () => menuStore.visible,
  (newValue) => {
    if (newValue === false) {
      directoryCheck();
    }
  }
);

watch(
  () => directoryStore.origin,
  () => {
    initTree('origin');
  }
);

watch(
  () => directoryStore.target,
  () => {
    initTree('target');
  }
);

// whitelist
let extensions = whitelistStore.extensions.split('\n');
watch(
  () => whitelistStore.extensions,
  () => {
    extensions = whitelistStore.extensions.split('\n');
  }
);

onMounted(() => {
  initTree('origin');
  initTree('target');
});

// tree
const treeRef = reactive({
  origin: null,
  target: null,
});
const treeData = reactive({
  origin: [],
  target: [],
});

const initTree = (name) => {
  treeData[name] = [
    {
      pathname: directoryStore[name],
      filename: directoryStore[name],
      isFile: false,
      inodeNo: null,
      children: [],
    },
  ];
  nextTick(() => {
    treeRef[name].selectNode(treeData[name][0].pathname);
  });
};

const handleTreeRefresh = async (name) => {
  listData[name] = [];
  treeRef[name].expandAll(false);

  await initTree(name);
};

const handleNodeLoad = async (name, nodeData) => {
  const data = await fs.walkDirectory(nodeData);
  data.forEach((item) => {
    item.parent = nodeData;
  });

  nodeData.children = data.filter((item) => !item.isFile);

  if (nodeData.children.length === 0) {
    nodeData.isLeaf = true;
  } else {
    nodeData.isLeaf = false;
    nextTick(() => {
      treeRef[name].expandNode(nodeData.pathname);
      treeRef[name].getExpandedNodes().forEach((expandedNodeData) => {
        if (
          nodeData.children.some(
            (childNodeData) =>
              childNodeData.pathname === expandedNodeData.pathname
          )
        ) {
          treeRef[name].expandNode(expandedNodeData.pathname, false);
        }
      });
    });
  }

  return data;
};

const handleNodeSelect = async (name, nodeData) => {
  listData[name] = [];

  listLoading[name] = true;
  listData[name] = await handleNodeLoad(name, nodeData).finally(() => {
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

const handleListClick = (name, nodeData) => {
  if (!nodeData.isFile) {
    treeRef[name].selectNode(nodeData.pathname);
  }
};

// make
const makeDirectoryModelData = reactive({
  visible: false,
  attrs: {
    pathname: '',
  },
});

const handleMakeDirectorySuccess = async (pathname) => {
  const nodeData = treeRef.target.getSelectedNodes()[0];
  nodeData.isFile = false;
  listLoading.target = true;
  listData.target = await handleNodeLoad('target', nodeData).finally(() => {
    listLoading.target = false;
  });
  treeRef.target.selectNode(pathname);
};

const handleMakeDirectoryClick = () => {
  makeDirectoryModelData.attrs = {
    pathname: treeRef.target.getSelectedNodes()[0].pathname,
  };
  makeDirectoryModelData.visible = true;
};

// remove
const handleRemoveDirectoryClick = async () => {
  const nodeData = treeRef.target.getSelectedNodes()[0];

  if (nodeData.pathname === directoryStore.target) {
    Message.error('根目录不可删除');
    return;
  }

  await fs.removeDirectory(nodeData.pathname);

  Message.success('删除成功');
  listLoading.target = true;
  listData.target = await handleNodeLoad('target', nodeData.parent).finally(
    () => {
      listLoading.target = false;
    }
  );
};

// unlink
const handleUnlinkFileClick = async (nodeData) => {
  await fs.unlinkFile(nodeData.pathname);

  Message.success('删除成功');
  listLoading.target = true;
  listData.target = await handleNodeLoad('target', nodeData.parent).finally(
    () => {
      listLoading.target = false;
    }
  );
};

// rename
const renameFileModelData = reactive({
  visible: false,
  attrs: {
    pathname: '',
  },
});

const handleRenameFileSuccess = async () => {
  listLoading.target = true;
  listData.target = await handleNodeLoad(
    'target',
    treeRef.target.getSelectedNodes()[0]
  ).finally(() => {
    listLoading.target = false;
  });
};

const handleRenameFileClick = (nodeData) => {
  renameFileModelData.attrs = {
    pathname: nodeData.pathname,
  };
  renameFileModelData.visible = true;
};
</script>

<template>
  <div class="grid grid-cols-2 gap-4">
    <a-card>
      <template #extra>
        <a-button type="text" @click="handleTreeRefresh('origin')">
          <template #icon>
            <icon-refresh size="20" />
          </template>
        </a-button>
      </template>
      <a-spin class="w-full">
        <a-tree
          :ref="(el) => (treeRef.origin = el)"
          size="mini"
          :data="treeData.origin"
          :field-names="{
            key: 'pathname',
            title: 'filename',
          }"
          :load-more="(nodeData) => handleNodeLoad('origin', nodeData)"
          :virtual-list-props="{
            height: 300,
          }"
          @select="
            (selectedKeys, data) => handleNodeSelect('origin', data.node)
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
          <a-list-item :key="index">
            <template #actions>
              <div class="flex items-center">
                <template v-if="item.isFile">
                  <a-checkbox v-model="item.selected" />
                </template>
              </div>
            </template>
            <div
              class="flex items-center"
              :class="{ 'cursor-pointer': !item.isFile }"
              @click="handleListClick('origin', item)"
            >
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
        <a-button type="text" @click="handleMakeDirectoryClick">
          <template #icon>
            <icon-folder-add size="20" />
          </template>
        </a-button>
        <a-popconfirm
          content="确认删除目录吗？"
          @ok="handleRemoveDirectoryClick"
        >
          <a-button type="text">
            <template #icon>
              <icon-folder-delete size="20" />
            </template>
          </a-button>
        </a-popconfirm>
        <a-button type="text" @click="handleTreeRefresh('target')">
          <template #icon>
            <icon-refresh size="20" />
          </template>
        </a-button>
      </template>
      <a-spin class="w-full">
        <a-tree
          :ref="(el) => (treeRef.target = el)"
          size="mini"
          :data="treeData.target"
          :field-names="{
            key: 'pathname',
            title: 'filename',
          }"
          :load-more="(nodeData) => handleNodeLoad('target', nodeData)"
          :virtual-list-props="{
            height: 300,
          }"
          @select="
            (selectedKeys, data) => handleNodeSelect('target', data.node)
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
          <a-list-item :key="index">
            <template #actions>
              <div class="flex items-center">
                <a-button type="text" @click="handleRenameFileClick(item)">
                  <template #icon>
                    <icon-edit size="20" />
                  </template>
                </a-button>
                <template v-if="item.isFile">
                  <a-popconfirm
                    content="确认删除文件吗？"
                    @ok="handleUnlinkFileClick(item)"
                  >
                    <a-button type="text">
                      <template #icon>
                        <icon-delete size="20" />
                      </template>
                    </a-button>
                  </a-popconfirm>
                </template>
              </div>
            </template>
            <div
              class="flex items-center"
              :class="{ 'cursor-pointer': !item.isFile }"
              @click="handleListClick('target', item)"
            >
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

  <make-directory-model
    v-model:visible="makeDirectoryModelData.visible"
    :="makeDirectoryModelData.attrs"
    @success="handleMakeDirectorySuccess"
  />

  <rename-file-model
    v-model:visible="renameFileModelData.visible"
    :="renameFileModelData.attrs"
    @success="handleRenameFileSuccess"
  />
</template>

<style lang="less">
.list {
  .arco-list-item-main {
    width: calc(100% - 100px);
  }
}
</style>