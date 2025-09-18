import { create } from 'zustand';
import { apiService, handleApiError, extractApiData } from '../../services/api';

export const useInstructionsStore = create((set, get) => ({
  byAgentId: {},
  loading: false,
  error: null,

  fetch: async (agentId) => {
    set({ loading: true, error: null });
    try {
      const res = await apiService.instructions.getByAgent(agentId);
      const data = extractApiData(res);
      set((state) => ({ byAgentId: { ...state.byAgentId, [agentId]: data }, loading: false }));
      return data;
    } catch (e) {
      set({ error: handleApiError(e), loading: false });
      throw e;
    }
  },

  suggest: async (agentId, items) => {
    set({ error: null });
    try {
      const res = await apiService.instructions.suggest(agentId, items);
      const data = extractApiData(res);
      set((state) => ({ byAgentId: { ...state.byAgentId, [agentId]: data } }));
      return data;
    } catch (e) {
      set({ error: handleApiError(e) });
      throw e;
    }
  }
}));


