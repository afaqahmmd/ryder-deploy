import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  RiRobot2Fill,
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiEyeLine,
  RiCloseLine,
  RiRefreshLine,
  RiPlayLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiCodeSSlashFill,
} from "react-icons/ri";
import { fetchAgents, updateAgent, deleteAgent } from "../../store/agents/agentThunk";
import { clearAgentError } from "../../store/agents/agentSlice";
import AgentCreationWizard from "../agents/AgentCreationWizard";
import ComprehensiveChatModal from "../chat/ComprehensiveChatModal";
import EditAgentModal from "./EditAgentModal";
import { getEmbedCode } from "../../utils/embedcode";

const AgentsTab = ({ setShowOnboarding }) => {
  const dispatch = useDispatch();
  const { agents, isLoading, isUpdating, isDeleting, error } = useSelector((state) => state.agents);

  const { stores } = useSelector((state) => state.stores);

  // Debug log
  // console.log('AgentsTab render state:', { agents, isLoading, error })

  // Modal states
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageModalContent, setMessageModalContent] = useState({
    title: "",
    message: "",
  });
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [showScrapeInstructions, setShowScrapeInstructions] = useState(false);

  // Status options for display
  const statusOptions = [
    { value: "active", label: "Active", color: "bg-green-100 text-green-800" },
    { value: "inactive", label: "Inactive", color: "bg-red-100 text-red-800" },
    { value: "draft", label: "Draft", color: "bg-yellow-100 text-yellow-800" },
  ];

  const getAgentEmbedCode = async (agent) => {
    try {
      const embedCode = getEmbedCode(agent);
      console.log("agent", agent);
      // console.log("embed code", embedCode);

      // Copy to clipboard
      await navigator.clipboard.writeText(embedCode);

      // Show success toast
      toast.success("Copied!");
    } catch (error) {
      console.error("Failed to copy embed code:", error);
      toast.error("Failed to copy embed code");
    }
  };

  // Load agents on mount
  useEffect(() => {
    console.log("AgentsTab: Loading agents..."); // Debug log
    dispatch(fetchAgents());
  }, [dispatch]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearAgentError());
    };
  }, [dispatch]);

  // Handle delete agent
  const handleDeleteAgent = async () => {
    if (!selectedAgent) return;

    try {
      await dispatch(deleteAgent(selectedAgent.id)).unwrap();
      setShowDeleteModal(false);
      setSelectedAgent(null);
    } catch (error) {
      // Error handling is done in the slice
      console.error("error in delete agent:", error);
    }
  };

  // Handle toggle agent status
  const handleToggleAgentStatus = async (agent) => {
    console.log("all agents:", agents);
    try {
      const newStatus = agent.status === "active" ? "inactive" : "active";
      console.log("newStatus", newStatus);

      // If activating an agent, deactivate other agents for the same store
      if (newStatus === "active") {
        const otherAgentsForStore = agents.filter(
          (a) => a.id !== agent.id && a.store === agent.store && a.status === "active"
        );
        console.log("other agents for store:", otherAgentsForStore, agents);
        // Deactivate other agents for the same store
        for (const otherAgent of otherAgentsForStore) {
          console.log("updating other agent:", otherAgent);
          await dispatch(
            updateAgent({
              agentId: otherAgent.id,
              updateData: { ...otherAgent, status: "inactive" },
            })
          ).unwrap();
        }
      }

      // Update the current agent
      await dispatch(
        updateAgent({
          agentId: agent.id,
          updateData: { ...agent, status: newStatus },
        })
      ).unwrap();

      // Refresh the agents list
      dispatch(fetchAgents());

      // Show success message
      setMessageModalContent({
        title: "Success",
        message: `Agent ${agent.name} has been ${
          newStatus === "active" ? "activated" : "deactivated"
        } successfully.`,
      });
      setShowMessageModal(true);
    } catch (error) {
      // Show error message
      console.error("error in toggle agent status", error);
      setMessageModalContent({
        title: "Error",
        message: `Failed to ${
          agent.status === "active" ? "deactivate" : "activate"
        } agent. Please try again.`,
      });
      setShowMessageModal(true);
    }
  };

  // Open edit modal
  const openEditModal = (agent) => {
    setSelectedAgent(agent);
    setShowEditModal(true);
  };

  // Open view modal
  const openViewModal = (agent) => {
    setSelectedAgent(agent);
    setShowViewModal(true);
  };

  // Open delete modal
  const openDeleteModal = (agent) => {
    setSelectedAgent(agent);
    setShowDeleteModal(true);
  };

  // Open chat modal with comprehensive chat
  const openChatModal = (agent) => {
    // Check if agent is active
    if (agent.status !== "active") {
      setMessageModalContent({
        title: "Error testing agent",
        message: "Agent is inactive, kindly activate it first",
      });
      setShowMessageModal(true);
      return;
    }

    setSelectedAgent(agent);

    // Find the store for this agent
    const agentStore = stores.find((store) => store.id === agent.store) || stores[0];
    setSelectedStore(agentStore);

    setShowChatModal(true);
  };

  // Close chat modal
  const closeChatModal = () => {
    setShowChatModal(false);
    setSelectedAgent(null);
    setSelectedStore(null);
  };

  // Get status badge color
  const getStatusColor = (status) => {
    const statusOption = statusOptions.find((option) => option.value === status);
    return statusOption ? statusOption.color : "bg-gray-100 text-gray-800";
  };

  // Add error boundary
  if (error) {
    console.error("AgentsTab error:", error);
  }

  return (
    <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0'>
        <div className='flex items-center space-x-3'>
          <RiRobot2Fill className='w-6 h-6 text-blue-600' />
          <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
            AI Salespeople Management
          </h2>
        </div>
        <div className='flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3'>
          <button
            onClick={() => setShowOnboarding(true)}
            className='bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-colors flex items-center justify-center text-sm sm:text-base'
          >
            <svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
              />
            </svg>
            Show Tutorial
          </button>
          <button
            onClick={() => setShowCreateWizard(true)}
            className='flex items-center justify-center space-x-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base'
          >
            <RiAddLine className='w-4 h-4' />
            <span>Create Salesperson</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className='mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4'>
          <div className='flex items-center'>
            <div className='text-red-600 dark:text-red-400 text-sm'>{error}</div>
            <button
              onClick={() => dispatch(clearAgentError())}
              className='ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300'
            >
              <RiCloseLine className='w-4 h-4' />
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && agents.length === 0 ? (
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <RiRefreshLine className='w-8 h-8 text-gray-400 animate-spin mx-auto mb-4' />
            <p className='text-gray-500 dark:text-gray-400'>Loading agents...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Agents List */}
          {agents.length === 0 ? (
            <div className='text-center py-12'>
              <RiRobot2Fill className='w-16 h-16 text-gray-300 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                No AI salespeople yet
              </h3>
              <p className='text-gray-500 dark:text-gray-400 mb-6'>
                Create your first AI-powered salesperson to get started.
              </p>
              <button
                onClick={() => setShowCreateWizard(true)}
                className='inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
              >
                <RiAddLine className='w-4 h-4' />
                <span>Create Your First Salesperson</span>
              </button>
            </div>
          ) : (
            <div className='grid sm:grid-cols-2 grid-cols-1 gap-5'>
              {agents.map((agent) => {
                try {
                  return (
                    <div
                      key={agent.id}
                      className='bg-gray-50 dark:bg-gray-700 w-fit rounded-lg border border-gray-200 dark:border-gray-600 p-4'
                    >
                      {/* Agent Header */}
                      <div className='flex items-start justify-between mb-3'>
                        <div className='flex items-center space-x-3'>
                          <div className='w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center'>
                            <RiRobot2Fill className='w-5 h-5 text-white' />
                          </div>
                          <div>
                            <h3 className='font-medium text-gray-900 dark:text-white truncate'>
                              {agent.name || "Unnamed Salesperson"}
                            </h3>
                          </div>
                        </div>

                        {/* Toggle Switch */}
                        <div className='flex gap-2 items-center'>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              agent.status
                            )}`}
                          >
                            {agent.status || "draft"}
                          </span>
                          <button
                            onClick={() => handleToggleAgentStatus(agent)}
                            disabled={isUpdating}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                              agent.status === "active"
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500"
                            }`}
                            title={
                              agent.status === "active" ? "Deactivate Agent" : "Activate Agent"
                            }
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                agent.status === "active" ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Agent Info */}
                      <div className='mb-4'>
                        <div className='flex items-center justify-between mb-2'>
                          <p className='text-sm text-gray-600 dark:text-gray-300'>
                            <strong>Tone:</strong> {agent.tone || "Not set"}
                          </p>
                          {agent.age && (
                            <p className='text-xs text-gray-500 dark:text-gray-400'>
                              Age: {agent.age}
                            </p>
                          )}
                        </div>

                        {agent.country && agent.country !== "None" && (
                          <p className='text-xs text-gray-500 dark:text-gray-400 mb-2'>
                            <strong>Country:</strong> {agent.country}
                          </p>
                        )}
                        {agent.accent && agent.accent !== "None" && (
                          <p className='text-xs text-gray-500 dark:text-gray-400 mb-2'>
                            <strong>Accent:</strong> {agent.accent}
                          </p>
                        )}
                        {agent.gender && (
                          <p className='text-xs text-gray-500 dark:text-gray-400 mb-2'>
                            <strong>Gender:</strong> {agent.gender}
                          </p>
                        )}

                        <p className='text-xs text-gray-500 dark:text-gray-400 line-clamp-2'>
                          {agent.behavior_prompt || "No behavior prompt set"}
                        </p>
                      </div>

                      {/* Store Info */}
                      {agent.store_name && (
                        <div className='mb-4 text-xs text-gray-500 dark:text-gray-400'>
                          <strong>Store:</strong> {agent.store_name}
                          {/* {agent.status === 'active' && (
                             <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                               Active
                             </span>
                           )} */}
                        </div>
                      )}

                      {/* Actions */}
                      <div className='flex items-center justify-center pt-3 border-t border-gray-200 dark:border-gray-600'>
                        <div className='flex items-center space-x-2'>
                          <button
                            onClick={() => openChatModal(agent)}
                            className='p-2 text-green-400 hover:text-green-600 rounded hover:bg-green-50 dark:hover:bg-green-900/20'
                            title={
                              agent.status === "active"
                                ? "Test Agent"
                                : "Agent is inactive, activate first"
                            }
                          >
                            <RiPlayLine className='w-5 h-5' />
                          </button>
                          <button
                            onClick={() => openViewModal(agent)}
                            className='p-2 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700'
                            title='View Details'
                          >
                            <RiEyeLine className='w-5 h-5' />
                          </button>
                          <button
                            onClick={() => openEditModal(agent)}
                            className='p-2 text-blue-400 hover:text-blue-600 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20'
                            title='Edit'
                          >
                            <RiEditLine className='w-5 h-5' />
                          </button>
                          <button
                            onClick={() => openDeleteModal(agent)}
                            className='p-2 text-red-400 hover:text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/20'
                            title='Delete'
                          >
                            <RiDeleteBinLine className='w-5 h-5' />
                          </button>
                          {agent.status === "active" && (
                            <button
                              onClick={() => getAgentEmbedCode(agent)}
                              className='p-2 text-green-400 hover:text-green-600 rounded hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center space-x-2'
                              // title='Test Agent'
                            >
                              <RiCodeSSlashFill className='w-5 h-5' />
                              <span className='text-sm'>Get Embed Code</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                } catch (error) {
                  console.error("Error rendering agent:", agent, error);
                  return (
                    <div
                      key={agent.id || "error"}
                      className='bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-4'
                    >
                      <p className='text-red-600 dark:text-red-400 text-sm'>
                        Error rendering agent
                      </p>
                    </div>
                  );
                }
              })}
            </div>
          )}
        </>
      )}

      {/* AI Salesperson Creation Wizard */}
      {showCreateWizard && <AgentCreationWizard onClose={() => setShowCreateWizard(false)} />}

      {/* Edit Agent Modal */}
      <EditAgentModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedAgent(null);
        }}
        agent={selectedAgent}
      />

      {/* View Modal */}
      {showViewModal && selectedAgent && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-medium text-gray-900 dark:text-white'>Agent Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              >
                <RiCloseLine className='w-5 h-5' />
              </button>
            </div>

            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-lg font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Name
                  </label>
                  <p className='text-gray-900 dark:text-white font-medium'>{selectedAgent.name}</p>
                </div>

                <div>
                  <label className='block text-lg font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Status
                  </label>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      selectedAgent.status
                    )}`}
                  >
                    {selectedAgent.status}
                  </span>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-lg font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Age
                  </label>
                  <p className='text-gray-900 dark:text-white'>
                    {selectedAgent.age || "Not specified"}
                  </p>
                </div>

                <div>
                  <label className='block text-lg font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Gender
                  </label>
                  <p className='text-gray-900 dark:text-white'>
                    {selectedAgent.gender || "Not specified"}
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-lg font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Accent
                  </label>
                  <p className='text-gray-900 dark:text-white'>
                    {selectedAgent.accent || "Not specified"}
                  </p>
                </div>

                <div>
                  <label className='block text-lg font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Response Tone
                  </label>
                  <p className='text-gray-900 dark:text-white capitalize'>
                    {selectedAgent.tone || "Not specified"}
                  </p>
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-lg font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Country
                  </label>
                  <p className='text-gray-900 dark:text-white'>
                    {selectedAgent.country || "Not specified"}
                  </p>
                </div>

                <div>
                  <label className='block text-lg font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    First Message
                  </label>
                  <div className='rounded-md max-h-24 overflow-y-auto'>
                    <p className='text-gray-900 dark:text-white whitespace-pre-wrap'>
                      {selectedAgent.first_message || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              {selectedAgent.personality && (
                <div>
                  <label className='block text-lg font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Personality
                  </label>
                  <div className='bg-gray-50 dark:bg-gray-700 rounded-md p-3'>
                    <p className='text-gray-900 dark:text-white text-sm whitespace-pre-wrap'>
                      {selectedAgent.personality}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className='block text-lg font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Behavior Prompt
                </label>
                <div className='bg-gray-50 dark:bg-gray-700 rounded-md p-3 max-h-32 overflow-y-auto'>
                  <p className='text-gray-900 dark:text-white text-sm whitespace-pre-wrap'>
                    {selectedAgent.behavior_prompt}
                  </p>
                </div>
              </div>

              {selectedAgent.instructions_text && (
                <div>
                  <label className='block text-lg font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Instructions
                  </label>
                  <div className='bg-gray-50 dark:bg-gray-700 rounded-md p-3 max-h-32 overflow-y-auto'>
                    <p className='text-gray-900 dark:text-white text-sm whitespace-pre-wrap'>
                      {selectedAgent.instructions_text}
                    </p>
                  </div>
                </div>
              )}

              {selectedAgent.store_name && (
                <div>
                  <label className='block text-lg font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Connected Store
                  </label>
                  <p className='text-gray-900 dark:text-white'>{selectedAgent.store_name}</p>
                </div>
              )}
              {selectedAgent.scrape_instructions && (
                <div>
                  <div className='flex items-center justify-between mb-1'>
                    <label className='block text-lg font-medium text-gray-700 dark:text-gray-300'>
                      Website Information
                    </label>
                    <button
                      onClick={() => setShowScrapeInstructions(!showScrapeInstructions)}
                      className='flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-lg transition-colors'
                    >
                      {showScrapeInstructions ? (
                        <>
                          <RiArrowUpSLine className='w-4 h-4' />
                          Hide
                        </>
                      ) : (
                        <>
                          <RiArrowDownSLine className='w-4 h-4' />
                          View
                        </>
                      )}
                    </button>
                  </div>
                  {showScrapeInstructions && (
                    <div className='mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border'>
                      <p className='text-gray-900 dark:text-white whitespace-pre-wrap text-sm leading-relaxed'>
                        {selectedAgent.scrape_instructions}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {selectedAgent.external_websites_count > 0 && (
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    External Websites
                  </label>
                  <p className='text-gray-900 dark:text-white'>
                    {selectedAgent.external_websites_count} website(s) configured
                  </p>
                </div>
              )}

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Created
                  </label>
                  <p className='text-gray-600 dark:text-gray-400 text-sm'>
                    {selectedAgent.created_at}
                  </p>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Last Updated
                  </label>
                  <p className='text-gray-600 dark:text-gray-400 text-sm'>
                    {selectedAgent.updated_at}
                  </p>
                </div>
              </div>
            </div>

            <div className='flex items-center justify-end mt-6'>
              <button
                onClick={() => setShowViewModal(false)}
                className='px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedAgent && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-medium text-gray-900 dark:text-white'>Delete Agent</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              >
                <RiCloseLine className='w-5 h-5' />
              </button>
            </div>

            <div className='mb-6'>
              <p className='text-gray-700 dark:text-gray-300'>
                Are you sure you want to delete <strong>{selectedAgent.name}</strong>? This action
                cannot be undone.
              </p>
            </div>

            <div className='flex items-center justify-end space-x-3'>
              <button
                onClick={() => setShowDeleteModal(false)}
                className='px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700'
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAgent}
                disabled={isDeleting}
                className='flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50'
              >
                {isDeleting ? (
                  <RiRefreshLine className='w-4 h-4 animate-spin' />
                ) : (
                  <RiDeleteBinLine className='w-4 h-4' />
                )}
                <span>{isDeleting ? "Deleting..." : "Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Chat Modal */}
      {showChatModal && selectedAgent && selectedStore && (
        <ComprehensiveChatModal
          isOpen={showChatModal}
          onClose={closeChatModal}
          agent={selectedAgent}
          store={selectedStore}
        />
      )}

      {/* Message Modal */}
      {showMessageModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
                {messageModalContent.title}
              </h3>
              <button
                onClick={() => setShowMessageModal(false)}
                className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              >
                <RiCloseLine className='w-5 h-5' />
              </button>
            </div>

            <div className='mb-6'>
              <p className='text-gray-700 dark:text-gray-300'>{messageModalContent.message}</p>
            </div>

            <div className='flex items-center justify-end'>
              <button
                onClick={() => setShowMessageModal(false)}
                className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentsTab;
