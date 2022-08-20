import { defineStore } from 'pinia';

export const useDirectoryStore = defineStore({
  id: 'directory',
  state: () => ({
    origin: '',
    target: '',
  }),
});
