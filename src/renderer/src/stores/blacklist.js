import { defineStore } from 'pinia';

export const useBlacklistStore = defineStore({
  id: 'blacklist',
  state: () => ({
    expressions: '',
  }),
  persist: {
    enabled: true,
    strategies: [{ storage: localStorage }],
  },
});
