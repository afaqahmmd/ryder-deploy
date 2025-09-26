import { useState, useEffect } from "react";
import {
  RiInformationLine,
  RiUserSmileLine,
  RiArrowDownSLine,
  RiSearchLine,
  RiCloseLine,
} from "react-icons/ri";
import {
  getAllCountries,
  getAccentsForCountry,
  getGeneralAccentForCountry,
  getDescriptionForCountry,
} from "../../../utils/countryAccentData";
import "./AgentStep1.css";

const AgentStep1 = ({ data, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: "",
    age: null,
    gender: "",
    country: "",
    communication_style: "friendly",
    behavior_prompt: "",
  });

  const [errors, setErrors] = useState({});
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [selectedTraits, setSelectedTraits] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);

  // Field suggestions based on hiring a real person
  const genderOptions = ["Male", "Female", "Non-binary", "Prefer not to say", "Other"];

  // Get all countries for dropdown
  const allCountries = getAllCountries();

  const communicationStyles = [
    {
      value: "friendly",
      label: "Friendly",
      description: "Warm and approachable, great for building relationships",
    },
    {
      value: "professional",
      label: "Professional",
      description: "Formal and business-like, perfect for B2B sales",
    },
    {
      value: "casual",
      label: "Casual",
      description: "Relaxed and informal, ideal for younger customers",
    },
    {
      value: "formal",
      label: "Formal",
      description: "Polite and structured, suitable for luxury products",
    },
    {
      value: "enthusiastic",
      label: "Enthusiastic",
      description: "Energetic and positive, great for exciting products",
    },
    {
      value: "calm",
      label: "Calm",
      description: "Peaceful and reassuring, perfect for sensitive purchases",
    },
    {
      value: "authoritative",
      label: "Authoritative",
      description: "Confident and knowledgeable, ideal for expert advice",
    },
    {
      value: "empathetic",
      label: "Empathetic",
      description: "Understanding and compassionate, great for personal products",
    },
    {
      value: "playful",
      label: "Playful",
      description: "Fun and engaging, perfect for creative brands",
    },
    {
      value: "serious",
      label: "Serious",
      description: "Focused and straightforward, suitable for important decisions",
    },
  ];

  const ageSuggestions = [
    { label: "Young Professional (18-25)", value: 22 },
    { label: "Experienced Salesperson (26-35)", value: 30 },
    { label: "Senior Sales Expert (36-45)", value: 40 },
    { label: "Veteran Sales Manager (46-60)", value: 50 },
  ];

  const personalityTraits = [
    "Analytical - Logical and detail-oriented problem solver",
    "Creative - Innovative thinker with fresh perspectives",
    "Empathetic - Understanding and compassionate listener",
    "Diplomatic - Tactful communicator who resolves conflicts",
    "Direct - Straightforward and honest in communication",
    "Humorous - Light-hearted with appropriate wit",
    "Patient - Calm and understanding with customers",
    "Proactive - Takes initiative to help customers",
    "Detail-oriented - Thorough and accurate in responses",
    "Problem-solver - Focuses on finding solutions",
    "Collaborative - Works well with team and customers",
    "Innovative - Brings new ideas and approaches",
    "Reliable - Consistent and dependable service",
    "Adaptable - Flexible to different situations",
    "Supportive - Encouraging and helpful attitude",
  ];

  // Behavior prompt templates
  const behaviorPromptTemplates = [
    {
      title: "Customer-Focused Salesperson",
      description:
        "Always puts customer needs first, asks clarifying questions, and provides personalized recommendations",
      template:
        "You are a customer-focused salesperson who prioritizes customer satisfaction above all else. Always start by understanding the customer's needs through thoughtful questions. Ask clarifying questions like 'What specific problem are you trying to solve?' or 'What's most important to you in this purchase?' Provide personalized recommendations based on their responses. Be patient and understanding, never pushy or aggressive. Focus on building long-term relationships rather than just making a sale. If a customer seems unsure, offer to help them think through their decision rather than rushing them.",
    },
    {
      title: "Product Expert",
      description:
        "Deep knowledge of products, technical specifications, and competitive advantages",
      template:
        "You are a product expert with deep knowledge of all products and their technical specifications. When discussing products, always explain complex features in simple, understandable terms. Highlight competitive advantages and unique selling points naturally in conversation. Provide detailed comparisons when asked, focusing on benefits rather than just features. Stay updated on product updates and industry trends. If a customer asks technical questions, provide thorough but accessible explanations. Always mention relevant specifications that matter to the customer's use case.",
    },
    {
      title: "Problem Solver",
      description: "Focuses on solving customer problems and finding the best solutions",
      template:
        "You are a problem-solving salesperson who focuses on understanding and solving customer problems rather than just selling products. Start by asking diagnostic questions to identify root causes: 'What's the main challenge you're facing?' or 'What have you tried so far?' Offer multiple solutions and explain the pros and cons of each option. Be creative in finding solutions that fit the customer's budget and timeline. If a product doesn't solve their problem, be honest about it. Always think about the customer's broader needs and suggest complementary solutions when appropriate.",
    },
    {
      title: "Relationship Builder",
      description: "Builds trust and long-term relationships with customers",
      template:
        "You are a relationship-focused salesperson who builds trust and long-term relationships with customers. Remember details from previous interactions and reference them naturally. Be consistent in your approach and always follow through on promises. Show genuine interest in the customer's success and satisfaction. Provide ongoing support and follow-up after sales. Ask about their experience and how the product is working for them. If they have issues, take ownership and help resolve them. Focus on becoming a trusted advisor rather than just a salesperson.",
    },
    {
      title: "Consultative Salesperson",
      description: "Acts as a consultant, providing expert advice and guidance",
      template:
        "You are a consultative salesperson who acts as a trusted advisor rather than just a salesperson. Provide expert advice and guidance based on your knowledge and experience. Ask thought-provoking questions that help customers think differently about their needs: 'Have you considered how this might impact your workflow?' or 'What would success look like for you?' Offer insights and recommendations that add value beyond the immediate sale. Share industry best practices and trends when relevant. Help customers understand the long-term implications of their decisions. Always put the customer's best interests first, even if it means recommending a different solution.",
    },
    {
      title: "Solution-Oriented",
      description: "Focuses on complete solutions rather than individual products",
      template:
        "You are a solution-oriented salesperson who focuses on providing complete solutions rather than just individual products. Consider the customer's entire ecosystem and how different products work together. Suggest complementary items that enhance the main purchase. Think about long-term value and ROI for the customer. Ask questions like 'What other systems do you use?' or 'How does this fit into your overall workflow?' Provide comprehensive solutions that address multiple aspects of their needs. Always explain how different components work together to create a better overall experience.",
    },
    {
      title: "Empathetic Listener",
      description: "Shows genuine empathy and understanding of customer emotions",
      template:
        "You are an empathetic salesperson who shows genuine understanding of customer emotions and concerns. Listen actively and acknowledge their feelings: 'I understand this is a big decision' or 'That sounds frustrating.' Show compassion when customers express concerns or frustrations. Validate their feelings before offering solutions. Be patient with customers who need time to process information. Offer emotional support when appropriate, especially for high-value or personal purchases. Always respond with kindness and understanding, even in difficult situations.",
    },
    {
      title: "Educational Salesperson",
      description: "Educates customers about products and industry knowledge",
      template:
        "You are an educational salesperson who focuses on teaching customers about products and industry knowledge. Take time to explain how products work and why certain features matter. Share industry insights and trends that help customers make informed decisions. Provide educational content like 'Did you know?' facts or 'Here's why this matters' explanations. Help customers understand the technology or concepts behind products. Always explain the 'why' behind recommendations, not just the 'what.' Be patient with customers who need more education to make confident decisions.",
    },
    {
      title: "Results-Driven",
      description: "Focuses on measurable outcomes and customer success",
      template:
        "You are a results-driven salesperson who focuses on measurable outcomes and customer success. Always discuss what success looks like for the customer: 'What would make this purchase successful for you?' or 'How will you measure the impact?' Provide specific examples of how products have helped other customers achieve their goals. Focus on ROI and value rather than just features. Help customers set realistic expectations and create success metrics. Follow up to ensure customers are achieving their desired outcomes. Always connect product benefits to concrete results the customer can expect.",
    },
  ];

  // Load data from cache
  useEffect(() => {
    if (data?.step1) {
      setFormData({
        name: data.step1.name || "",
        age: data.step1.age || null,
        gender: data.step1.gender || "",
        country: data.step1.country || "",
        communication_style: data.step1.communication_style || data.step1.tone || "friendly",
        behavior_prompt: data.step1.behavior_prompt || "",
      });

      // Load selected traits from cache
      if (data.step1.selectedTraits) {
        setSelectedTraits(data.step1.selectedTraits);
      }
    }
  }, [data]);

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

  // Handle input changes
  const handleChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }

    // Update parent component with both form data and selected traits
    onUpdate(1, { ...newFormData, selectedTraits });
  };

  // Validate fields according to API requirements
  const validateField = (field, value) => {
    const newErrors = { ...errors };

    switch (field) {
      case "name":
        if (!value || value.length < 2) {
          newErrors.name = "Salesperson name must be at least 2 characters long";
        } else if (value.length > 100) {
          newErrors.name = "Salesperson name must be less than 100 characters";
        } else {
          delete newErrors.name;
        }
        break;
      case "age":
        if (value !== null && value !== "" && (value < 0 || value > 150)) {
          newErrors.age = "Age must be between 0 and 150";
        } else {
          delete newErrors.age;
        }
        break;
      case "behavior_prompt":
        if (!value || value.trim().length === 0) {
          newErrors.behavior_prompt = "Sales Behavior Guidelines are required";
        } else if (value.length > 2000) {
          newErrors.behavior_prompt = "Behavior prompt must be less than 2000 characters";
        } else {
          delete newErrors.behavior_prompt;
        }
        break;
      case "communication_style":
        delete newErrors.communication_style;
        break;
      case "gender":
      case "country":
        delete newErrors[field];
        break;
    }

    setErrors(newErrors);
  };

  // Handle blur events for validation
  const handleBlur = (field) => {
    validateField(field, formData[field]);
  };

  // Apply an age suggestion
  const applyAgeSuggestion = (age) => {
    handleChange("age", age);
  };

  // Handle personality trait selection
  const handleTraitSelection = (trait) => {
    const traitName = trait.split(" - ")[0];
    const newSelectedTraits = selectedTraits.includes(traitName)
      ? selectedTraits.filter((t) => t !== traitName)
      : selectedTraits.length < 3
      ? [...selectedTraits, traitName]
      : selectedTraits;

    setSelectedTraits(newSelectedTraits);

    // Update parent component with new traits
    onUpdate(1, { ...formData, selectedTraits: newSelectedTraits });
  };

  // Apply behavior prompt template
  const applyTemplate = (template) => {
    handleChange("behavior_prompt", template);
    setShowTemplates(false);
  };

  // Filter countries based on search
  const filteredCountries = allCountries.filter((country) =>
    country.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const topCountries = allCountries.slice(0, 5);

  // Handle country selection
  const handleCountrySelect = (country) => {
    handleChange("country", country);
    setShowCountryDropdown(false);
    setCountrySearch("");
  };

  // Get description for selected country
  const countryDescription = formData.country ? getDescriptionForCountry(formData.country) : "";

  return (
    <div className='max-w-4xl mx-auto'>
      <div className='text-center mb-8'>
        <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
          <RiUserSmileLine className='w-8 h-8 text-blue-600' />
        </div>
        <h3 className='text-xl font-semibold text-gray-900 mb-2'>Hire Your Perfect Salesperson</h3>
        <p className='text-gray-600'>
          Let's create your ideal salesperson by defining their personality, communication style,
          and characteristics.
        </p>
      </div>

      <form className='space-y-8'>
        {/* Basic Info Section */}
        <div className='bg-gray-50 p-6 rounded-lg'>
          <h4 className='text-lg font-medium text-gray-900 mb-4'>Personal Information</h4>

          <div className='grid gap-6 md:grid-cols-2'>
            {/* Salesperson Name */}
            <div className='md:col-span-2'>
              <div className='flex items-center gap-2 mb-2'>
                <label
                  htmlFor='salesperson-name'
                  className='block text-sm font-medium text-gray-700'
                >
                  What's your salesperson's name? *
                </label>
                <div className='group relative'>
                  <RiInformationLine className='w-4 h-4 text-gray-400 cursor-help' />
                  <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none'>
                    Choose a name that builds trust and feels approachable to your customers
                  </div>
                </div>
              </div>
              <input
                id='salesperson-name'
                type='text'
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                onBlur={() => handleBlur("name")}
                placeholder='e.g., Sarah, Alex, Michael, Emma'
                className={`
                  w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${errors.name ? "border-red-300 bg-red-50" : "border-gray-300"}
                `}
              />
              {errors.name && <p className='mt-1 text-sm text-red-600'>{errors.name}</p>}
              <div className='mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                <p className='text-sm text-blue-800'>
                  <span className='font-medium'>💡 Pro Tip:</span> Choose a friendly, memorable name
                  that your customers will feel comfortable talking to. Think of it like naming a
                  new team member!
                </p>
              </div>
            </div>

            {/* Age */}
            <div>
              <div className='flex items-center gap-2 mb-2'>
                <label
                  htmlFor='salesperson-age'
                  className='block text-sm font-medium text-gray-700'
                >
                  How old is your salesperson?
                </label>
                <div className='group relative'>
                  <RiInformationLine className='w-4 h-4 text-gray-400 cursor-help' />
                  <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none'>
                    Age helps determine communication style and relatability to your customers
                  </div>
                </div>
              </div>
              <input
                id='salesperson-age'
                type='number'
                min='18'
                max='150'
                value={formData.age || ""}
                onChange={(e) =>
                  handleChange("age", e.target.value ? parseInt(e.target.value) : null)
                }
                onBlur={() => handleBlur("age")}
                placeholder='e.g., 30'
                className={`
                  w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${errors.age ? "border-red-300 bg-red-50" : "border-gray-300"}
                `}
              />
              {errors.age && <p className='mt-1 text-sm text-red-600'>{errors.age}</p>}

              {/* Age Suggestions */}
              {/* <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs text-gray-500">Quick picks:</span>
                {ageSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.value}
                    type="button"
                    onClick={() => applyAgeSuggestion(suggestion.value)}
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    {suggestion.label}
                  </button>
                ))}
              </div> */}
              <div className='mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                <p className='text-sm text-blue-800'>
                  <span className='font-medium'>💡 Pro Tip:</span> Consider your target audience - a
                  younger salesperson might relate better to younger customers, while an experienced
                  one might build more trust with older customers.
                </p>
              </div>
            </div>

            {/* Gender */}
            <div>
              <div className='flex items-center gap-2 mb-2'>
                <label
                  htmlFor='salesperson-gender'
                  className='block text-sm font-medium text-gray-700'
                >
                  What's their gender identity?
                </label>
                <div className='group relative'>
                  <RiInformationLine className='w-4 h-4 text-gray-400 cursor-help' />
                  <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none'>
                    Helps create a more relatable and personalized customer experience
                  </div>
                </div>
              </div>
              <select
                id='salesperson-gender'
                value={formData.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value=''>Select gender identity</option>
                {genderOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <div className='mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                <p className='text-sm text-blue-800'>
                  <span className='font-medium'>💡 Pro Tip:</span> This helps your salesperson
                  communicate in a way that feels natural and relatable to your customers.
                </p>
              </div>
            </div>

            {/* Country Selection */}
            <div>
              <div className='flex items-center gap-2 mb-2'>
                <label
                  htmlFor='salesperson-country'
                  className='block text-sm font-medium text-gray-700'
                >
                  What country does your salesperson belong to?
                </label>
                <div className='group relative'>
                  <RiInformationLine className='w-4 h-4 text-gray-400 cursor-help' />
                  <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none'>
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
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left bg-white flex items-center justify-between'
                >
                  <span className={formData.country ? "text-gray-900" : "text-gray-500"}>
                    {formData.country || "Select country"}
                  </span>
                  <RiArrowDownSLine
                    className={`w-4 h-4 text-gray-400 transform transition-transform ${
                      showCountryDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showCountryDropdown && (
                  <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto'>
                    {/* Search Bar */}
                    <div className='p-3 border-b border-gray-200'>
                      <div className='relative'>
                        <RiSearchLine className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                        <input
                          type='text'
                          placeholder='Search countries...'
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
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
                            className='w-full px-4 py-2 text-left hover:bg-gray-100 text-sm'
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
                              className='w-full px-4 py-2 text-left hover:bg-gray-100 text-sm'
                            >
                              {country}
                            </button>
                          ))}
                          <div className='border-t border-gray-200 my-1'></div>
                          <div className='px-4 py-2 text-xs text-gray-500'>
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
                <div className='mt-2 p-3 bg-green-50 border border-green-200 rounded-lg'>
                  <p className='text-sm text-green-800'>
                    <span className='font-medium'>ℹ️ About this country:</span> {countryDescription}
                  </p>
                </div>
              )}

              <div className='mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                <p className='text-sm text-blue-800'>
                  <span className='font-medium'>💡 Pro Tip:</span> Choose a country that matches
                  your target audience or brand voice for better connection and relatability. For
                  instance, if your brand focuses on Japanese items, you might want to select Japan.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Personality Section */}
        <div className='bg-gray-50 p-6 rounded-lg'>
          <h4 className='text-lg font-medium text-gray-900 mb-4'>
            Personality & Communication Style
          </h4>

          {/* Personality Traits */}
          <div className='mb-6'>
            <div className='flex items-center gap-2 mb-2'>
              <label className='block text-sm font-medium text-gray-700'>
                What are their key personality traits?
              </label>
              <div className='group relative'>
                <RiInformationLine className='w-4 h-4 text-gray-400 cursor-help' />
                <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none'>
                  Select up to 3 personality traits that define your salesperson's character.
                </div>
              </div>
            </div>

            {/* Personality Trait Suggestions */}
            <div className='mt-4'>
              <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
                {personalityTraits.map((trait) => {
                  const traitName = trait.split(" - ")[0];
                  const isSelected = selectedTraits.includes(traitName);
                  return (
                    <button
                      key={trait}
                      type='button'
                      onClick={() => handleTraitSelection(trait)}
                      className={`
                        text-left text-xs px-3 py-2 rounded transition-colors
                        ${
                          isSelected
                            ? "bg-blue-100 text-blue-800 border border-blue-300"
                            : selectedTraits.length >= 3
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                        }
                      `}
                      disabled={selectedTraits.length >= 3 && !isSelected}
                      title={trait}
                    >
                      {traitName}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className='mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
              <p className='text-sm text-blue-800'>
                <span className='font-medium'>💡 Pro Tip:</span> Choose top 3 traits that will help
                your salesperson connect with your customers and represent your brand effectively.
                Think about what makes a great salesperson in your industry!
              </p>
            </div>
          </div>

          {/* Communication Style */}
          <div>
            <div className='flex items-center gap-2 mb-2'>
              <label
                htmlFor='communication-style'
                className='block text-sm font-medium text-gray-700'
              >
                How should they communicate with customers?
              </label>
              <div className='group relative'>
                <RiInformationLine className='w-4 h-4 text-gray-400 cursor-help' />
                <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none'>
                  Define the overall tone and style of communication with customers
                </div>
              </div>
            </div>

            <input
              id='communication-style'
              type='text'
              value={formData.communication_style}
              onChange={(e) => handleChange("communication_style", e.target.value)}
              onBlur={() => handleBlur("communication_style")}
              placeholder='friendly'
              className={`
                w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                ${errors.communication_style ? "border-red-300 bg-red-50" : "border-gray-300"}
              `}
            />
            {errors.communication_style && (
              <p className='mt-1 text-sm text-red-600'>{errors.communication_style}</p>
            )}

            {/* Communication Style Suggestions */}
            <div className='mt-3'>
              <p className='text-sm font-medium text-gray-700 mb-2'>
                Popular communication styles:
              </p>
              <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
                {communicationStyles.map((style) => (
                  <button
                    key={style.value}
                    type='button'
                    onClick={() => handleChange("communication_style", style.value)}
                    className={`
                      text-left text-xs px-3 py-2 rounded transition-colors
                      ${
                        formData.communication_style === style.value
                          ? "bg-blue-100 text-blue-800 border border-blue-300"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                      }
                    `}
                    title={style.description}
                  >
                    <div className='font-medium'>{style.label}</div>
                    <div className='text-gray-500 truncate'>{style.description}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className='mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
              <p className='text-sm text-blue-800'>
                <span className='font-medium'>💡 Pro Tip:</span> Choose a communication style that
                matches your brand personality and target audience for consistent customer
                experience.
              </p>
            </div>
          </div>
        </div>

        {/* Behavior Prompt Section */}
        <div className='bg-gray-50 p-6 rounded-lg'>
          <h4 className='text-lg font-medium text-gray-900 mb-4'>Sales Behavior Guidelines</h4>

          <div>
            <div className='flex items-center justify-between mb-2'>
              <div className='flex items-center gap-2'>
                <label
                  htmlFor='behavior-prompt'
                  className='block text-sm font-medium text-gray-700'
                >
                  How should your salesperson behave during sales interactions?
                </label>
                <div className='group relative'>
                  <RiInformationLine className='w-4 h-4 text-gray-400 cursor-help' />
                  <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none'>
                    Define specific behaviors and approaches for sales situations
                  </div>
                </div>
              </div>
              <button
                type='button'
                onClick={() => setShowTemplates(!showTemplates)}
                className='text-sm text-blue-600 hover:text-blue-800 font-medium'
              >
                {showTemplates ? "Hide Templates" : "Show Templates"}
              </button>
            </div>

            {/* Behavior Prompt Templates */}
            {showTemplates && (
              <div className='mb-4 p-4 bg-white border border-gray-200 rounded-lg'>
                <h5 className='text-sm font-medium text-gray-900 mb-3'>
                  Choose a behavior template:
                </h5>
                <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                  {behaviorPromptTemplates.map((template, index) => (
                    <div key={index} className='behavior-template-container'>
                      <button
                        type='button'
                        onClick={() => applyTemplate(template.template)}
                        className='w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors'
                      >
                        <div className='font-medium text-sm text-gray-900 mb-1'>
                          {template.title}
                        </div>
                        <div className='text-xs text-gray-600'>{template.description}</div>
                      </button>

                      {/* Preview Tooltip */}
                      <div className='behavior-template-tooltip'>
                        <div className='font-medium mb-2'>Preview:</div>
                        <div className='leading-relaxed'>{template.template}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <textarea
              id='behavior-prompt'
              required
              value={formData.behavior_prompt}
              onChange={(e) => handleChange("behavior_prompt", e.target.value)}
              onBlur={() => handleBlur("behavior_prompt")}
              rows={6}
              maxLength={2000}
              placeholder="Describe how your salesperson should behave during sales interactions. For example: 'Always prioritize customer satisfaction and needs. Ask clarifying questions to understand their requirements better. Provide personalized recommendations based on their specific situation. Be patient and understanding, never pushy or aggressive.'"
              className={`
                w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none
                ${errors.behavior_prompt ? "border-red-300 bg-red-50" : "border-gray-300"}
              `}
            />
            {errors.behavior_prompt && (
              <p className='mt-1 text-sm text-red-600'>{errors.behavior_prompt}</p>
            )}
            <div className='flex items-center justify-between mt-1'>
              <span className='text-sm text-gray-400'>{formData.behavior_prompt.length}/2000</span>
              {formData.behavior_prompt.length >= 2000 && (
                <span className='text-sm text-red-500 font-medium'>
                  Max characters limit reached
                </span>
              )}
            </div>
            <div className='mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
              <p className='text-sm text-blue-800'>
                <span className='font-medium'>💡 Pro Tip:</span> This is where you define the
                specific behaviors and approaches your salesperson should use during customer
                interactions. Think about your ideal sales process and how you want them to handle
                different scenarios!
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AgentStep1;
