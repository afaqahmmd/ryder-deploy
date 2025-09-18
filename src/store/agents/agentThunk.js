import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../utils/axios";
import { apiService } from "../../services/api";
import { toast } from "react-toastify";

// Fetch all agents
export const fetchAgents = createAsyncThunk(
  "agents/fetchAgents",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get("/api/agents/");
      
      // console.log('API Response:', response.data); // Debug log

      if (response.data && response.data.details) {
        const result = {
          agents: response.data.details.data?.agents || [],
          count: response.data.details.data?.count || 0,
          message: response.data.details.message
        };
        // console.log('Processed result:', result); // Debug log
        return result;
      } else {
        return thunkAPI.rejectWithValue({ message: "No data received" });
      }
    } catch (error) {
      console.error('Fetch agents error:', error); // Debug log
      const errorMessage = error.response?.data?.details?.message ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch agents";
      return thunkAPI.rejectWithValue({ message: errorMessage });
    }
  }
);

// Fetch agent by ID
export const fetchAgentById = createAsyncThunk(
  "agents/fetchAgentById",
  async (agentId, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/api/agents/${agentId}/`);

      if (response.data && response.data.details) {
        return response.data.details.data;
      } else {
        return thunkAPI.rejectWithValue({ message: "No data received" });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.details?.message ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch agent";
      return thunkAPI.rejectWithValue({ message: errorMessage });
    }
  }
);

// Create agent (simple creation - not used in multi-step flow)
export const createAgent = createAsyncThunk(
  "agents/createAgent",
  async (agentData, thunkAPI) => {
    try {
      if (!agentData.name || !agentData.behavior_prompt || !agentData.response_tone) {
        const errorMsg = "Please fill in all required fields (name, behavior prompt, and response tone)";
        toast.error(errorMsg);
        return thunkAPI.rejectWithValue({ message: errorMsg });
      }

      const payload = {
        name: agentData.name,
        behavior_prompt: agentData.behavior_prompt,
        response_tone: agentData.response_tone,
        status: agentData.status || "draft"
      };

      console.log("payload for create agent:", payload);

      const response = await axiosInstance.post("/api/agents/", payload);

      if (response.data) {
        if (response.data.details && response.data.details.data) {
          return response.data.details.data;
        }
        return response.data;
      } else {
        return thunkAPI.rejectWithValue({ message: "No data received" });
      }
    } catch (error) {
      let errorMessage = "Failed to create agent";

      if (error.response?.data) {
        if (error.response.data.details?.message) {
          errorMessage = error.response.data.details.message;
        } else if (error.response.data.details?.errors) {
          const errors = [];
          Object.keys(error.response.data.details.errors).forEach(field => {
            if (Array.isArray(error.response.data.details.errors[field])) {
              errors.push(`${field}: ${error.response.data.details.errors[field].join(', ')}`);
            }
          });
          if (errors.length > 0) {
            errorMessage = errors.join('; ');
          }
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      return thunkAPI.rejectWithValue({ message: errorMessage });
    }
  }
);

// Complete agent creation (multi-step flow)
export const completeAgentCreation = createAsyncThunk(
  "agents/completeAgentCreation",
  async (cacheData, thunkAPI) => {
    try {
      const { step1, step2, step3, step4, step5, status } = cacheData;

      // Validate required data
      if (!step1.name || step1.name.length < 2) {
        const errorMsg = "Agent name must be at least 2 characters long";
        return thunkAPI.rejectWithValue({ message: errorMsg });
      }

                    // Prepare agent data according to new 6-step wizard structure
        const agentData = {
          // Required fields from Step 1 (Salesperson Personality)
          name: step1.name,
          behavior_prompt: step1.behavior_prompt || '',
          
          // Optional basic info fields from Step 1
          age: step1.age || null,
          gender: step1.gender || null,
          country: step1.country || null,
          tone: step1.communication_style || null, // Map from communication_style to tone
          
          // Personality - concatenate selected traits with base personality
          personality: (() => {
            const basePersonality = "Friendly and empathetic customer service representative with excellent communication skills. Always patient and understanding when helping customers with their inquiries and concerns.";
            const selectedTraits = step1.selectedTraits || [];
            
            if (selectedTraits.length > 0) {
              const traitsText = selectedTraits.join(", ");
              return `${basePersonality} Additional traits: ${traitsText}.`;
            }
            
            return basePersonality;
          })(),
          
          // Store connection from Step 2
          store: step2?.store || null,
          
          // Rules from Step 3
          instructions_text: step3?.rules_text || null, // Map from rules_text to instructions_text
          
          // Scraped instructions from Step 4 (contains the website data)
          scrape_instructions: step4?.scrape_instructions || null,
          
                     // External resources from Step 5 - send as JSON string
           external_websites: (step5?.external_websites && step5.external_websites.length > 0) 
             ? JSON.stringify(step5.external_websites)
             : '',
          
          // Status
          status: status || 'draft'
        };

      // Use axios instance directly for agent creation


      console.log("agent data payload:",agentData)
      const response = await axiosInstance.post("/api/agents/", agentData);

      if (response.data && response.data.details) {
        return response.data.details.data;
      } else {
        return thunkAPI.rejectWithValue({ message: "No data received" });
      }
    } catch (error) {
      let errorMessage = "Failed to create agent";

      if (error.response?.data) {
        if (error.response.data.details?.message) {
          errorMessage = error.response.data.details.message;
        } else if (error.response.data.details?.errors) {
          // Handle validation errors from new API
          const errors = [];
          Object.keys(error.response.data.details.errors).forEach(field => {
            const fieldError = error.response.data.details.errors[field];
            if (typeof fieldError === 'string') {
              errors.push(`${field}: ${fieldError}`);
            } else if (Array.isArray(fieldError)) {
              errors.push(`${field}: ${fieldError.join(', ')}`);
            }
          });
          if (errors.length > 0) {
            errorMessage = errors.join('; ');
          }
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      return thunkAPI.rejectWithValue({ message: errorMessage });
    }
  }
);

// Update agent
export const updateAgent = createAsyncThunk(
  "agents/updateAgent",
  async ({ agentId, updateData }, thunkAPI) => {
    try {
      if (!agentId) {
        return thunkAPI.rejectWithValue({ message: "Agent ID is required" });
      }

      // Prepare form data if file is included
      let requestData;
      let headers = {};
      
      if (updateData.instructions_file) {
        requestData = new FormData();
        Object.keys(updateData).forEach(key => {
          if (key === 'external_websites' && Array.isArray(updateData[key])) {
            requestData.append(key, JSON.stringify(updateData[key]));
          } else {
            requestData.append(key, updateData[key]);
          }
        });
        headers['Content-Type'] = 'multipart/form-data';
      } else {
        requestData = updateData;
        headers['Content-Type'] = 'application/json';
      }

      const response = await axiosInstance.put(`/api/agents/${agentId}/`, requestData, {
        headers
      });

      if (response.data && response.data.details) {
        return response.data.details.data;
      } else {
        return thunkAPI.rejectWithValue({ message: "No data received" });
      }
    } catch (error) {
      let errorMessage = "Failed to update agent";

      if (error.response?.data) {
        if (error.response.data.details?.message) {
          errorMessage = error.response.data.details.message;
        } else if (error.response.data.details?.errors) {
          const errors = [];
          Object.keys(error.response.data.details.errors).forEach(field => {
            if (Array.isArray(error.response.data.details.errors[field])) {
              errors.push(`${field}: ${error.response.data.details.errors[field].join(', ')}`);
            }
          });
          if (errors.length > 0) {
            errorMessage = errors.join('; ');
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      return thunkAPI.rejectWithValue({ message: errorMessage });
    }
  }
);

// Delete agent
export const deleteAgent = createAsyncThunk(
  "agents/deleteAgent",
  async (agentId, thunkAPI) => {
    try {
      if (!agentId) {
        return thunkAPI.rejectWithValue({ message: "Agent ID is required" });
      }

      const response = await axiosInstance.delete(`/api/agents/${agentId}/`);

      // Return the deleted agent ID for state updates
      return { id: agentId };
    } catch (error) {
      let errorMessage = "Failed to delete agent";

      if (error.response?.data) {
        if (error.response.data.details?.message) {
          errorMessage = error.response.data.details.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      return thunkAPI.rejectWithValue({ message: errorMessage });
    }
  }
);

// Chat with agent
export const chatWithAgent = createAsyncThunk(
  "agents/chatWithAgent",
  async ({ agentId, message, conversationId }, thunkAPI) => {
    try {
      const payload = {
        message: message.trim()
      };
      
      if (conversationId) {
        payload.conversation_id = conversationId;
      }

      const response = await axiosInstance.post(`/api/agents/${agentId}/chat/`, payload);

      if (response.data && response.data.details) {
        return response.data.details.data;
      } else {
        return thunkAPI.rejectWithValue({ message: "No response received" });
      }
    } catch (error) {
      let errorMessage = "Failed to get agent response";

      if (error.response?.data) {
        if (error.response.data.details?.message) {
          errorMessage = error.response.data.details.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      return thunkAPI.rejectWithValue({ message: errorMessage });
    }
  }
);

// Start conversation with agent
export const startConversation = createAsyncThunk(
  "agents/startConversation",
  async ({ agentId, sessionId }, thunkAPI) => {
    try {
      const payload = {};
      if (sessionId) {
        payload.session_id = sessionId;
      }

      const response = await axiosInstance.post(`/api/agents/${agentId}/chat/`, payload);

      if (response.data && response.data.details) {
        return response.data.details.data;
      } else {
        return thunkAPI.rejectWithValue({ message: "No response received" });
      }
    } catch (error) {
      let errorMessage = "Failed to start conversation";

      if (error.response?.data) {
        if (error.response.data.details?.message) {
          errorMessage = error.response.data.details.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      return thunkAPI.rejectWithValue({ message: errorMessage });
    }
  }
); 