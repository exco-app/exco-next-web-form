import { useState, useCallback } from 'react';

// Initial form data structure
const initialFormData = {
  // Personal Details
  firstName: "",
  lastName: "",
  gender: "",
  city: "",
  dateOfBirth: "",
  professionalCategory: "",
  designation: "",
  howDidYouHear: "",

  // Contact Details
  countryCode: "+91",
  phoneNumber: "",
  email: "",

  // Social Media
  instagramProfile: "",
  linkedinProfile: "",

  // Vibe Check
  whatAreYouLookingFor: [],
  oneThingRuinsTrip: "",
  occasion: "",

  // Timing & Readiness
  estimatedBudget: "",
  whenWouldYouBook: "",

  // Story
  story: "",
};

export const useFormData = () => {
  const [formData, setFormData] = useState(initialFormData);

  // Update single field
  const updateField = useCallback((name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // Handle form input changes
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      if (name === "contactMethod" || name === "recent_wins") {
        setFormData((prevFormData) => {
          if (checked) {
            return {
              ...prevFormData,
              [name]: [...prevFormData[name], value],
            };
          } else {
            return {
              ...prevFormData,
              [name]: prevFormData[name].filter(
                (item) => item !== value
              ),
            };
          }
        });
      } else {
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: checked,
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  }, []);

  // Handle select dropdown changes
  const handleSelectChange = useCallback((value, name) => {
    // Extract the actual value from react-select option object
    const actualValue = typeof value === 'object' && value !== null 
      ? (value.value || value.label || value) 
      : value;
    
    
    setFormData(prev => ({
      ...prev,
      [name]: actualValue,
    }));
  }, []);

  // Handle date of birth formatting (DD-MM-YYYY)
  const handleDateOfBirthChange = useCallback((e) => {
    const { selectionStart, value: currentValue } = e.target;
    let value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters

    if (value.length > 8) value = value.slice(0, 8); // Limit to 8 characters

    let formattedValue = "";
    if (value.length > 4) {
      formattedValue = `${value.slice(0, 2)}-${value.slice(2, 4)}-${value.slice(4)}`;
    } else if (value.length > 2) {
      formattedValue = `${value.slice(0, 2)}-${value.slice(2)}`;
    } else {
      formattedValue = value;
    }

    setFormData(prev => ({
      ...prev,
      dateOfBirth: formattedValue,
    }));

    // Calculate new cursor position
    let newCursorPos = selectionStart;
    const addedChars = formattedValue.length - currentValue.length;
    if (addedChars > 0 && selectionStart) {
      newCursorPos += addedChars;
    } else if (addedChars < 0 && selectionStart) {
      newCursorPos = Math.max(0, newCursorPos + addedChars);
    }

    // Set cursor position after state update
    setTimeout(() => {
      e.target.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, []);

  // Handle phone number changes
  const handlePhoneChange = useCallback((e) => {
    const numericValue = e.target.value.replace(/\D/g, "");
    setFormData(prev => ({
      ...prev,
      phoneNumber: numericValue,
    }));
  }, []);

  // Handle Instagram profile changes (remove @ symbol)
  const handleInstagramChange = useCallback((e) => {
    const filteredValue = e.target.value.replace(/@/g, "");
    setFormData(prev => ({
      ...prev,
      instagramProfile: filteredValue,
    }));
  }, []);

  // Handle story changes
  const handleStoryChange = useCallback((e) => {
    setFormData(prev => ({
      ...prev,
      story: e.target.value,
    }));
  }, []);

  // Handle city selection
  const handleCityChange = useCallback((cityOption) => {
    // If cityOption is the full option object, extract the label (city name)
    // If it's just the value, we need to find the corresponding city name
    const cityName = cityOption.label || cityOption;

    setFormData(prev => ({
      ...prev,
      city: cityName,
    }));
  }, []);

  // Reset form data
  const resetFormData = useCallback(() => {
    setFormData(initialFormData);
  }, []);

  // Update multiple fields at once
  const updateMultipleFields = useCallback((updates) => {
    setFormData(prev => ({
      ...prev,
      ...updates,
    }));
  }, []);

  // Get specific field value
  const getFieldValue = useCallback((fieldName) => {
    return formData[fieldName];
  }, [formData]);

  // Check if field is empty
  const isFieldEmpty = useCallback((fieldName) => {
    const value = formData[fieldName];
    if (Array.isArray(value)) {
      return value.length === 0;
    }
    return !value || value.toString().trim() === "";
  }, [formData]);

  return {
    formData,
    updateField,
    handleChange,
    handleSelectChange,
    handleDateOfBirthChange,
    handlePhoneChange,
    handleInstagramChange,
    handleStoryChange,
    handleCityChange,
    resetFormData,
    updateMultipleFields,
    getFieldValue,
    isFieldEmpty,
  };
}; 