import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  RiCloseLine,
  RiRefreshLine,
  RiSettings3Line,
  RiInformationLine,
  RiArrowDownSLine,
  RiSearchLine,
} from "react-icons/ri";
import { updateAgent, fetchAgents } from "../../store/agents/agentThunk";
import { getAllCountries, getDescriptionForCountry } from "../../utils/countryAccentData";

const EditAgentModal = ({ isOpen, onClose, agent }) => {
  const dispatch = useDispatch();

  // Form states for editing
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    accent: "",
    personality: "",
    behavior_prompt: "",
    tone: "professional",
    status: "active",
    instructions_text: "",
    country: "",
    store: "",
    first_message: "",
  });

  // Country dropdown states
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  // Get all countries for dropdown
  const allCountries = getAllCountries();
  const topCountries = allCountries.slice(0, 5);

  const filteredCountries = allCountries.filter((country) =>
    country.toLowerCase().includes(countrySearch.toLowerCase())
  );
  // Available response tones
  const toneOptions = [
    { value: "professional", label: "Professional" },
    { value: "friendly", label: "Friendly" },
    { value: "casual", label: "Casual" },
    { value: "formal", label: "Formal" },
    { value: "enthusiastic", label: "Enthusiastic" },
    { value: "calm", label: "Calm" },
    { value: "energetic", label: "Energetic" },
    { value: "warm", label: "Warm" },
    { value: "confident", label: "Confident" },
    { value: "helpful", label: "Helpful" },
  ];

  // Available gender options
  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" },
  ];

  // Available accent options
  const accentOptions = [
    { value: "American", label: "American" },
    { value: "British", label: "British" },
    { value: "Australian", label: "Australian" },
    { value: "Canadian", label: "Canadian" },
    { value: "Indian", label: "Indian" },
    { value: "None", label: "None" },
  ];

  // Status options
  const statusOptions = [
    { value: "active", label: "Active", color: "bg-green-100 text-green-800" },
    { value: "inactive", label: "Inactive", color: "bg-red-100 text-red-800" },
    { value: "draft", label: "Draft", color: "bg-yellow-100 text-yellow-800" },
  ];

  // Loading state for the update operation
  const [isUpdating, setIsUpdating] = useState(false);

  // Initialize form data when agent changes
  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name || "",
        age: agent.age || "",
        gender: agent.gender || "",
        accent: agent.accent || "",
        personality: agent.personality || "",
        behavior_prompt: agent.behavior_prompt || "",
        tone: agent.tone || "professional",
        status: agent.status || "active",
        instructions_text: agent.instructions_text || "",
        country: agent.country || "",
        store: agent.store || "",
        first_message: agent.first_message || "",
      });
    }
  }, [agent]);

  console.log("agent", agent);
  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCountryDropdown && !event.target.closest(".country-dropdown-container")) {
        setShowCountryDropdown(false);
        setCountrySearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCountryDropdown]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: "",
      age: "",
      gender: "",
      accent: "",
      personality: "",
      behavior_prompt: "",
      tone: "professional",
      status: "active",
      instructions_text: "",
      country: "",
      store: "",
      first_message: "",
    });
  };

  // Handle edit agent
  const handleEditAgent = async (e) => {
    e.preventDefault();
    if (!agent) return;

    setIsUpdating(true);
    try {
      await dispatch(
        updateAgent({
          agentId: agent.id,
          updateData: formData,
        })
      ).unwrap();

      onClose();
      resetForm();
      dispatch(fetchAgents()); // Refresh list
    } catch (error) {
      // Error handling is done in the slice
      console.error("error in edit agent:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle country selection
  const handleCountrySelect = (country) => {
    handleInputChange({ target: { name: "country", value: country } });
    setShowCountryDropdown(false);
    setCountrySearch("");
  };

  // Get description for selected country
  const countryDescription = formData.country ? getDescriptionForCountry(formData.country) : "";

  // Handle modal close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen || !agent) {
    return null;
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-medium text-gray-900 dark:text-white'>Edit Agent</h3>
          <button
            onClick={handleClose}
            className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          >
            <RiCloseLine className='w-5 h-5' />
          </button>
        </div>

        <form onSubmit={handleEditAgent}>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Name *
              </label>
              <input
                type='text'
                name='name'
                value={formData.name}
                onChange={handleInputChange}
                required
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                placeholder='Enter agent name'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                First Message
              </label>
              <textarea
                name='first_message'
                value={formData.first_message}
                onChange={handleInputChange}
                rows={3}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none'
                placeholder='Enter the first message your salesperson should send'
              />
              <div className='mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
                <p className='text-sm text-blue-800 dark:text-blue-300'>
                  <span className='font-medium'>💡 Pro Tip:</span> Create a friendly, engaging opening message that reflects your brand voice and invites conversation.
                </p>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Age
                </label>
                <input
                  type='number'
                  name='age'
                  value={formData.age}
                  onChange={handleInputChange}
                  min='0'
                  max='150'
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                  placeholder='Enter age'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Gender
                </label>
                <select
                  name='gender'
                  value={formData.gender}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                >
                  <option value=''>Select gender</option>
                  {genderOptions.map((gender) => (
                    <option key={gender.value} value={gender.value}>
                      {gender.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Accent
                </label>
                <select
                  name='accent'
                  value={formData.accent}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                >
                  <option value=''>Select accent</option>
                  {accentOptions.map((accent) => (
                    <option key={accent.value} value={accent.value}>
                      {accent.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Response Tone *
                </label>
                <select
                  name='tone'
                  value={formData.tone}
                  onChange={handleInputChange}
                  required
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                >
                  {toneOptions.map((tone) => (
                    <option key={tone.value} value={tone.value}>
                      {tone.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* Country Selection */}
            <div>
              <div className='flex items-center gap-2 mb-2'>
                <label
                  htmlFor='salesperson-country'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                  What country does your salesperson belong to?
                </label>
                <div className='group relative'>
                  <RiInformationLine className='w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help' />
                  <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-200 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none'>
                    This determines the cultural context and available accents for your salesperson
                  </div>
                </div>
              </div>
              <div className='relative country-dropdown-container'>
                <button
                  type='button'
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowCountryDropdown(!showCountryDropdown);
                  }}
                  className='w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left bg-white dark:bg-gray-700 flex items-center justify-between'
                >
                  <span
                    className={
                      formData.country
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-500 dark:text-gray-400"
                    }
                  >
                    {formData.country || "Select country"}
                  </span>
                  <RiArrowDownSLine
                    className={`w-4 h-4 text-gray-400 dark:text-gray-500 transform transition-transform ${
                      showCountryDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showCountryDropdown && (
                  <div className='absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto'>
                    {/* Search Bar */}
                    <div className='p-3 border-b border-gray-200 dark:border-gray-600'>
                      <div className='relative'>
                        <RiSearchLine className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500' />
                        <input
                          type='text'
                          placeholder='Search countries...'
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          className='w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400'
                        />
                      </div>
                    </div>

                    {/* Options */}
                    <div className='py-1'>
                      {countrySearch ? (
                        // Show filtered results
                        filteredCountries.map((country) => (
                          <button
                            key={country}
                            type='button'
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleCountrySelect(country);
                            }}
                            className='w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-white'
                          >
                            {country}
                          </button>
                        ))
                      ) : (
                        // Show top 5 + search results
                        <>
                          {topCountries.map((country) => (
                            <button
                              key={country}
                              type='button'
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleCountrySelect(country);
                              }}
                              className='w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-white'
                            >
                              {country}
                            </button>
                          ))}
                          <div className='border-t border-gray-200 dark:border-gray-600 my-1'></div>
                          <div className='px-4 py-2 text-xs text-gray-500 dark:text-gray-400'>
                            Type to search more countries...
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Country Description */}
              {countryDescription && (
                <div className='mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg'>
                  <p className='text-sm text-green-800 dark:text-green-300'>
                    <span className='font-medium'>ℹ️ About this country:</span> {countryDescription}
                  </p>
                </div>
              )}

              <div className='mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
                <p className='text-sm text-blue-800 dark:text-blue-300'>
                  <span className='font-medium'>💡 Pro Tip:</span> Choose a country that matches
                  your target audience or brand voice for better connection and relatability. For
                  instance, if your brand focuses on Japanese items, you might want to select Japan.
                </p>
              </div>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Personality
              </label>
              <textarea
                name='personality'
                value={formData.personality}
                onChange={handleInputChange}
                rows={3}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none'
                placeholder="Describe the agent's personality"
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Behavior Prompt *
              </label>
              <textarea
                name='behavior_prompt'
                value={formData.behavior_prompt}
                onChange={handleInputChange}
                rows={4}
                required
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none'
                placeholder='Describe how the agent should behave'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Instructions Text
              </label>
              <textarea
                name='instructions_text'
                value={formData.instructions_text}
                onChange={handleInputChange}
                rows={3}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none'
                placeholder='Additional instructions for the agent'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Status
              </label>
              <select
                name='status'
                value={formData.status}
                onChange={handleInputChange}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
              >
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className='flex items-center justify-end space-x-3 mt-6'>
            <button
              type='button'
              onClick={handleClose}
              className='px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isUpdating}
              className='flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50'
            >
              {isUpdating ? (
                <RiRefreshLine className='w-4 h-4 animate-spin' />
              ) : (
                <RiSettings3Line className='w-4 h-4' />
              )}
              <span>{isUpdating ? "Updating..." : "Update Agent"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAgentModal;
