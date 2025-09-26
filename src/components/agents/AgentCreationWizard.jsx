import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiCloseLine,
  RiSaveLine,
  RiCheckLine,
} from "react-icons/ri";
import {
  initializeCreationCache,
  updateCreationCache,
  setCurrentStep,
  saveCacheToLocalStorage,
  loadCacheFromLocalStorage,
} from "../../store/agents/agentSlice";
import { completeAgentCreation } from "../../store/agents/agentThunk";

// Import step components
import AgentStep1 from "./wizard/AgentStep1";
import AgentStep2 from "./wizard/AgentStep2";
import AgentStep3 from "./wizard/AgentStep3";
import AgentStep4 from "./wizard/AgentStep4";
import AgentStep5 from "./wizard/AgentStep5"; // Added AgentStep5
import AgentReview from "./wizard/AgentReview";
import TestAndSuggestPanel from "../chat/TestAndSuggestPanel";

const AgentCreationWizard = ({ onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { creationCache, currentStep, isCompleting, error } = useSelector((state) => state.agents);
  const { stores: storesList } = useSelector((state) => state.stores);

  const [isClosing, setIsClosing] = useState(false);
  const [showTestSuggest, setShowTestSuggest] = useState(false);
  const [activatedAgent, setActivatedAgent] = useState(null);
  const [activatedStore, setActivatedStore] = useState(null);

  // Step configuration
  const steps = [
    { id: 1, title: "Salesperson Personality", component: AgentStep1 },
    { id: 2, title: "Store Connection", component: AgentStep2 },
    { id: 3, title: "Rules", component: AgentStep3 },
    // { id: 4, title: 'Shopify Frontend', component: AgentStep4 },
    { id: 4, title: "External Resources", component: AgentStep5 },
    { id: 5, title: "Review & Complete", component: AgentReview },
  ];

  const currentStepConfig = steps.find((step) => step.id === currentStep);

  // Initialize or load cache on mount
  useEffect(() => {
    if (!creationCache) {
      dispatch(loadCacheFromLocalStorage());

      // If still no cache after loading, initialize new
      setTimeout(() => {
        if (!creationCache) {
          dispatch(initializeCreationCache());
        }
      }, 100);
    }
  }, [dispatch, creationCache]);

  // Save cache to localStorage whenever it changes
  useEffect(() => {
    if (creationCache) {
      dispatch(saveCacheToLocalStorage());
    }
  }, [creationCache, dispatch]);

  // Handle step data update
  const handleStepUpdate = (stepNumber, data) => {
    dispatch(updateCreationCache({ step: stepNumber, data }));
  };

  // Check if current step is valid
  const isCurrentStepValid = () => {
    if (!creationCache) return false;

    switch (currentStep) {
      case 1: {
        console.log("creationCache", creationCache);
        const step1 = creationCache.step1;
        // Name and behavior prompt are required
        const isAccentValid = !step1.accent || step1.accent.length > 0;
        const isAgeValid = !step1.age || (step1.age >= 0 && step1.age <= 150);
        const isBehaviorPromptValid =
          step1.behavior_prompt?.length > 0 && step1.behavior_prompt.length <= 2000;
        const isCommunicationStyleValid = step1.communication_style?.length > 0;
        const isNameValid = step1.name?.length >= 2;
        const isPersonalityValid = step1.personality?.length > 0;
        const isSelectedTraitsValid = step1.selectedTraits?.length > 0;
        const isToneValid = step1.tone?.length > 0;
        const isGenderValid = step1.gender?.length > 0;

        const isCountryValid = !step1.country || step1.country.length > 0;

        return (
          isNameValid &&
          isAgeValid &&
          isBehaviorPromptValid &&
          isCountryValid &&
          isCommunicationStyleValid &&
          //  &&
          // isPersonalityValid
          isSelectedTraitsValid &&
          isToneValid &&
          isGenderValid &&
          isAccentValid
        );
      }
      case 2:
        {
          console.log("step2", creationCache);
          const step2 = creationCache.step2;
          const isStoreValid = step2.store;

          return isStoreValid;
          // const
        }
        // Store connection is optional
        return true;
      case 3:
        // Rules are optional
        return true;
      case 4: {
        // External resources validation
        const step5 = creationCache.step5;
        if (!step5?.external_websites || step5.external_websites.length === 0) {
          return true; // Step is optional if no websites added
        }

        // Validate each website that has been added
        return step5.external_websites.every((website) => {
          if (!website.url.trim()) return true; // Empty URLs are allowed (they will be filtered out)
          // Validate URL format
          try {
            const url = new URL(website.url);
            return url.protocol === "http:" || url.protocol === "https:";
          } catch {
            return false;
          }
        });
      }
      case 5: {
        // Review step - check overall validity
        const overallStep1 = creationCache.step1;
        return overallStep1.name?.length >= 2;
      }
      default:
        return false;
    }
  };

  // Handle next step
  const handleNext = () => {
    if (isCurrentStepValid() && currentStep < 6) {
      dispatch(setCurrentStep(currentStep + 1));
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 1) {
      dispatch(setCurrentStep(currentStep - 1));
    }
  };

  // Handle wizard close
  const handleClose = () => {
    setIsClosing(true);

    // Show confirmation if there's unsaved data
    if (creationCache && (creationCache.step1.name || creationCache.step2.instructions_text)) {
      const shouldClose = window.confirm(
        "You have unsaved changes. Are you sure you want to close the wizard? Your progress will be saved locally."
      );

      if (!shouldClose) {
        setIsClosing(false);
        return;
      }
    }

    // Clear cache and close
    if (onClose) {
      onClose();
    } else {
      navigate("/dashboard");
    }
    setIsClosing(false);
  };

  // Handle complete agent creation
  const handleComplete = async (activateAgent = true) => {
    if (!creationCache) return;

    try {
      // Add activation status to the cache
      const completeData = {
        ...creationCache,
        status: activateAgent ? "active" : "draft",
      };

      console.log("completeData", completeData);

      const created = await dispatch(completeAgentCreation(completeData)).unwrap();

      if (activateAgent) {
        setActivatedAgent(created);
        const storeId = creationCache.step2?.store;
        const storeObj = Array.isArray(storesList)
          ? storesList.find((s) => s.id === storeId)
          : null;
        setActivatedStore(storeObj || (storeId ? { id: storeId } : null));
        setShowTestSuggest(true);
      } else {
        // Success - close wizard and redirect
        if (onClose) {
          onClose();
        } else {
          navigate("/dashboard?tab=agents");
        }
      }
    } catch (error) {
      // Error is handled in the slice
      console.error("Failed to complete agent creation:", error);
    }
  };

  // Don't render until cache is loaded
  if (!creationCache) {
    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
        <div className='bg-white rounded-lg p-6'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
          <p className='text-center mt-2 text-gray-600'>Loading wizard...</p>
        </div>
      </div>
    );
  }

  const StepComponent = currentStepConfig?.component;

  return (
    <>
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
        <div className='bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col'>
          {/* Header */}
          <div className='flex items-center justify-between p-6 border-b border-gray-200'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900'>Create New AI Salesperson</h2>
              <p className='text-gray-500 mt-1'>
                Step {currentStep} of {steps.length}: {currentStepConfig?.title}
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isClosing || isCompleting}
              className='text-gray-400 hover:text-gray-600 disabled:opacity-50'
            >
              <RiCloseLine className='w-6 h-6' />
            </button>
          </div>

          {/* Progress Indicator */}
          <div className='px-6 py-4  flex justify-center'>
            <div className='flex items-center justify-center w-full'>
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center w-full ${
                    index >= steps.length - 1 ? "max-w-fit" : ""
                  }`}
                >
                  <div
                    className={`
                    w-8 h-8 aspect-square rounded-full flex items-center justify-center text-sm font-medium
                    ${
                      currentStep === step.id
                        ? "bg-blue-600 text-white"
                        : currentStep > step.id
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }
                  `}
                  >
                    {currentStep > step.id ? <RiCheckLine className='w-4 h-4' /> : step.id}
                  </div>

                  {index < steps.length - 1 && (
                    <div
                      className={`
                      h-1 w-full mx-2
                      ${currentStep > step.id ? "bg-green-500" : "bg-gray-200"}
                    `}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className='flex-1 p-6 overflow-y-auto'>
            {StepComponent && (
              <StepComponent
                data={creationCache}
                onUpdate={handleStepUpdate}
                onComplete={currentStep === 5 ? handleComplete : undefined}
              />
            )}
          </div>

          {/* Footer Navigation */}
          <div className='flex items-center justify-between p-6 border-t border-gray-200'>
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1 || isCompleting}
              className='flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <RiArrowLeftLine className='w-4 h-4' />
              <span>Previous</span>
            </button>

            <div className='flex items-center space-x-3'>
              {/* Save Draft Button */}
              {currentStep < 5 && (
                <button
                  onClick={handleClose}
                  disabled={isCompleting}
                  className='px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50'
                >
                  Save & Close
                </button>
              )}

              {/* Next/Complete Button */}
              {currentStep < 5 ? ( // Updated to 6
                <div className='flex flex-col items-end'>
                  {!isCurrentStepValid() &&
                    currentStep === 4 &&
                    creationCache?.step5?.external_websites?.some((w) => w.url.trim()) && (
                      <p className='text-red-600 text-sm mb-2'>
                        Please ensure all URLs are valid and start with http:// or https://
                      </p>
                    )}
                  <button
                    onClick={handleNext}
                    disabled={!isCurrentStepValid() || isCompleting}
                    className='flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    <span>Next</span>
                    <RiArrowRightLine className='w-4 h-4' />
                  </button>
                </div>
              ) : (
                <div className='flex items-center space-x-3'>
                  {/* <button
                    onClick={() => handleComplete(false)}
                    disabled={isCompleting}
                    className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    <RiSaveLine className="w-4 h-4" />
                    <span>Save as Draft</span>
                  </button> */}
                  <button
                    onClick={() => handleComplete(true)}
                    disabled={isCompleting}
                    className='flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50'
                  >
                    {isCompleting ? (
                      <>
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <RiCheckLine className='w-4 h-4' />
                        <span>Create & Activate</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {showTestSuggest && activatedAgent && (
        <TestAndSuggestPanel
          agent={activatedAgent}
          store={activatedStore}
          onClose={() => {
            setShowTestSuggest(false);
            if (onClose) {
              onClose();
            } else {
              navigate("/dashboard?tab=agents");
            }
          }}
        />
      )}
    </>
  );
};

export default AgentCreationWizard;
