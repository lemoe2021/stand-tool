<script setup>
import { useAppStore } from '@/stores/app';
import { useDirectoryStore } from '@/stores/directory';

const appStore = useAppStore();
const directoryStore = useDirectoryStore();

if (!directoryStore.origin || !directoryStore.target) {
  appStore.visible = true;
}
</script>

<template>
  <div>peko</div>
</template>
