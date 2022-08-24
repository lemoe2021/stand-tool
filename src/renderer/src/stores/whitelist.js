import { defineStore } from 'pinia';

export const useWhitelistStore = defineStore({
  id: 'whitelist',
  state: () => ({
    extensions: '.mp4\n.mkv\n.srt\n.ass',
  }),
  persist: {
    enabled: true,
    strategies: [{ storage: localStorage }],
  },
});
