import { createSlice } from "@reduxjs/toolkit";
import {
  fetchAgents,
  createAgent,
  updateAgent,
  deleteAgent,
  fetchAgentById,
  completeAgentCreation
} from "./agentThunk";
import { toast } from "react-toastify";

const initialState = {
  agents: [],
  currentAgent: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isCompleting: false,
  error: null,
  totalCount: 0,
  // Cache for multi-step creation
  creationCache: null,
  currentStep: 1,
  maxStep: 4
};

export const agentSlice = createSlice({
  name: "agents",
  initialState,
  reducers: {
    clearAgentError: (state) => {
      state.error = null;
    },
    setCurrentAgent: (state, action) => {
      state.currentAgent = action.payload;
    },
    clearCurrentAgent: (state) => {
      state.currentAgent = null;
    },
    // Multi-step creation cache management
    initializeCreationCache: (state) => {
      state.creationCache = {
        step1: {
          name: '',
          behavior_prompt: '',
          age: null,
          gender: '',
          accent: '',
          personality: '',
          tone: 'friendly' // Changed from response_tone to tone
        },
        step2: { instructions_text: '', instructions_file: null, store: null },
        step3: { store: null },
        step4: { external_websites: [] }
      };
      state.currentStep = 1;
    },
    updateCreationCache: (state, action) => {
      const { step, data } = action.payload;
      if (state.creationCache) {
        state.creationCache[`step${step}`] = { ...state.creationCache[`step${step}`], ...data };
      }
    },
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
    clearCreationCache: (state) => {
      state.creationCache = null;
      state.currentStep = 1;
    },
    // Save cache to localStorage
    saveCacheToLocalStorage: (state) => {
      if (state.creationCache) {
        localStorage.setItem('agent_creation_cache', JSON.stringify({
          cache: state.creationCache,
          currentStep: state.currentStep,
          timestamp: Date.now()
        }));
      }
    },
    // Load cache from localStorage
    loadCacheFromLocalStorage: (state) => {
      try {
        const cached = localStorage.getItem('agent_creation_cache');
        if (cached) {
          const { cache, currentStep, timestamp } = JSON.parse(cached);
          // Check if cache is less than 24 hours old
          if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
            state.creationCache = cache;
            state.currentStep = currentStep;
          } else {
            localStorage.removeItem('agent_creation_cache');
          }
        }
      } catch (error) {
        console.error('Error loading creation cache:', error);
        localStorage.removeItem('agent_creation_cache');
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch agents cases
      .addCase(fetchAgents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAgents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.agents = action.payload.agents || [];
        state.totalCount = action.payload.count || 0;
        state.error = null;
      })
      .addCase(fetchAgents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to fetch agents";
      })

      // Fetch single agent cases
      .addCase(fetchAgentById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAgentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentAgent = action.payload;
        state.error = null;
      })
      .addCase(fetchAgentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to fetch agent";
      })

      // Create agent cases (not used in multi-step flow)
      .addCase(createAgent.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createAgent.fulfilled, (state, action) => {
        state.isCreating = false;
        state.agents.push(action.payload);
        state.totalCount += 1;
        state.error = null;
        toast.success("Agent created successfully!");
      })
      .addCase(createAgent.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload?.message || "Failed to create agent";
        toast.error(state.error);
      })

      // Complete agent creation (multi-step)
      .addCase(completeAgentCreation.pending, (state) => {
        state.isCompleting = true;
        state.error = null;
      })
      .addCase(completeAgentCreation.fulfilled, (state, action) => {
        state.isCompleting = false;
        state.agents.push(action.payload);
        state.totalCount += 1;
        state.error = null;
        // Clear cache after successful creation
        state.creationCache = null;
        state.currentStep = 1;
        localStorage.removeItem('agent_creation_cache');
        toast.success("Agent created and activated successfully!");
      })
      .addCase(completeAgentCreation.rejected, (state, action) => {
        state.isCompleting = false;
        state.error = action.payload?.message || "Failed to complete agent creation";
        toast.error(state.error);
      })

      // Update agent cases
      .addCase(updateAgent.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateAgent.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.agents.findIndex(agent => agent.id === action.payload.id);
        if (index !== -1) {
          state.agents[index] = action.payload;
        }
        if (state.currentAgent?.id === action.payload.id) {
          state.currentAgent = action.payload;
        }
        state.error = null;
        toast.success("Agent updated successfully!");
      })
      .addCase(updateAgent.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload?.message || "Failed to update agent";
        toast.error(state.error);
      })

      // Delete agent cases
      .addCase(deleteAgent.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteAgent.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.agents = state.agents.filter(agent => agent.id !== action.payload.id);
        state.totalCount -= 1;
        if (state.currentAgent?.id === action.payload.id) {
          state.currentAgent = null;
        }
        state.error = null;
        toast.success("Agent deleted successfully!");
      })
      .addCase(deleteAgent.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload?.message || "Failed to delete agent";
        toast.error(state.error);
      });
  },
});

export const {
  clearAgentError,
  setCurrentAgent,
  clearCurrentAgent,
  initializeCreationCache,
  updateCreationCache,
  setCurrentStep,
  clearCreationCache,
  saveCacheToLocalStorage,
  loadCacheFromLocalStorage
} = agentSlice.actions;

export default agentSlice.reducer; 