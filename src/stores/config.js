import { defineStore } from 'pinia';

export const useConfigStore = defineStore({
  id: 'config',
  state: () => ({
    data: null,
  }),
});
