import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { validateEmail, ENDPOINT } from '../config';

export const useFormValidation = (formData, editionData) => {
  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [bookingError, setBookingError] = useState(false);

  // Real-time validation for email/phone interdependency
  const validateEmailPhone = useCallback(async (email, phone, countryCode) => {
    if (!email || !phone || !validateEmail(email) || phone.length < 8 || phone.length > 12) {
      return;
    }

    setIsValidating(true);
    try {
      const response = await axios.post(
        `${ENDPOINT}/customer/api/booking/web/check-booking/`,
        {
          edition: editionData?.id,
          email,
          phone: `${countryCode}${phone}`,
        }
      );

      if (response?.data?.is_show_message) {
        setErrors(prev => ({
          ...prev,
          email: "You have already submitted a booking request for this edition",
          phoneNumber: "You have already submitted a booking request for this edition",
        }));
        setBookingError(true);
      } else {
        setErrors(prev => ({ ...prev, email: "", phoneNumber: "" }));
        setBookingError(false);
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, email: "", phoneNumber: "" }));
      setBookingError(false);
    } finally {
      setIsValidating(false);
    }
  }, [editionData?.id]);

  // Field-specific validation (without setting state)
  const validateFieldValue = useCallback((fieldName, value) => {
    let error = null;

    switch (fieldName) {
      case 'firstName':
        if (!value?.trim()) error = "Please enter your first name.";
        break;

      case 'lastName':
        if (!value?.trim()) error = "Please enter your last name.";
        break;

      case 'gender':
        // Handle both object (from react-select) and primitive values
        const genderValue = typeof value === 'object' && value !== null ? value.value : value;
        // Gender value can be a number (1, 2, etc.) or string, so check for null/undefined/empty
        if (genderValue === null || genderValue === undefined || genderValue === '') {
          error = "Please select your gender.";
        }
        break;

      case 'city':
        // Handle both object (from react-select) and string values
        const cityValue = typeof value === 'object' && value !== null ? (value.label || value.value) : value;
        if (!cityValue || (typeof cityValue === 'string' && !cityValue.trim())) {
          error = "Please select your city.";
        }
        break;

      case 'dateOfBirth':
        if (!value || !value.trim()) {
          error = "Please enter your date of birth.";
        } else if (value.replace(/\D/g, '').length !== 8) {
          error = "Please enter a complete date (DD-MM-YYYY).";
        }
        break;

      case 'story':
        if (!value?.trim()) {
          error = "Please tell us about yourself.";
        } else if (value.trim().length < 60) {
          error = `Please write at least 60 characters about yourself. (${value.trim().length}/60)`;
        } else {
          error = null;
        }
        break;

      case 'instagramProfile':
        if (!value || (typeof value === 'string' && !value.trim())) {
          error = "Please enter your Instagram handle or LinkedIn profile URL.";
        }
        break;

      case 'professionalCategory':
        const categoryValue = typeof value === 'object' && value !== null ? value.value : value;
        if (!categoryValue || categoryValue === '') {
          error = "Please select your professional category.";
        }
        break;

      case 'designation':
        if (!value || (typeof value === 'string' && !value.trim())) {
          error = "Please enter your designation.";
        }
        break;

      case 'whatAreYouLookingFor':
        if (!value || !Array.isArray(value) || value.length === 0) {
          error = "Please select at least one option for what you're looking for.";
        }
        break;

      case 'oneThingRuinsTrip':
        const ruinsTripValue = typeof value === 'object' && value !== null ? value.value : value;
        if (!ruinsTripValue || ruinsTripValue === '') {
          error = "Please select one thing that ruins a trip for you.";
        }
        break;

      case 'phoneNumber':
        if (!value) {
          error = "Please enter your phone number.";
        } else if (value.length < 8) {
          error = "Phone number should be a minimum of 8 digits.";
        } else if (value.length > 12) {
          error = "Phone number should be a maximum of 12 digits.";
        }
        break;

      case 'email':
        if (!value) {
          error = "Please enter your email address.";
        } else if (!validateEmail(value)) {
          error = "Please enter a valid email address.";
        }
        break;

      default:
        break;
    }

    return error;
  }, []);

  const validateField = useCallback((fieldName, value) => {
    const error = validateFieldValue(fieldName, value);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
    return !error;
  }, [validateFieldValue]);

  // Single form validation for all required fields
  // skipFields: array of field names to skip validation for
  const validateForm = useCallback((skipFields = []) => {
    const requiredFields = [
      'firstName', 'gender', 'dateOfBirth',
      'phoneNumber', 'email'
    ];

    const formErrors = {};
    let isValid = true;

    requiredFields.forEach(field => {
      // Skip validation for fields in skipFields array
      if (skipFields.includes(field)) {
        console.log(`Skipping validation for ${field}`);
        return;
      }

      const fieldValue = formData[field];

      // Debug: log the field and its value
      console.log(`Validating ${field}:`, fieldValue, typeof fieldValue);

      const error = validateFieldValue(field, fieldValue);
      if (error) {
        isValid = false;
        formErrors[field] = error;
        console.log(`Error in ${field}:`, error);
      }
    });

    if (!isValid) {
      setErrors(prev => ({ ...prev, ...formErrors }));
      console.log('Form validation failed. Errors:', formErrors);

      // Show detailed error message
      const errorFields = Object.keys(formErrors);
      const fieldNames = {
        firstName: 'First Name',
        gender: 'Gender',
        dateOfBirth: 'Date of Birth',
        phoneNumber: 'Phone',
        email: 'Email'
      };

      const missingFieldsText = errorFields.map(f => fieldNames[f] || f).join(', ');
      // toast.error(`Please fill all required fields correctly: ${missingFieldsText}`);

      // Scroll to first error field
      const firstErrorField = errorFields[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
    }

    return isValid;
  }, [formData, validateFieldValue]);

  // Clear specific field error
  const clearFieldError = useCallback((fieldName) => {
    setErrors(prev => ({ ...prev, [fieldName]: "" }));
  }, []);

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);


  return {
    errors,
    isValidating,
    bookingError,
    validateEmailPhone,
    validateField,
    validateForm,
    clearFieldError,
    clearAllErrors,
    setErrors,
  };
}; 