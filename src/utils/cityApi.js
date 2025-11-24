import { ENDPOINT } from '../../../config';

// Debounce function for search
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Fetch cities from API
export const fetchCities = async (searchTerm = '', page = 1, limit = 10) => {
  try {
    const params = new URLSearchParams({
      limit: searchTerm ? 0 : limit,
      offset: searchTerm ? 0 : (page - 1) * limit,
      phone_code: "91",
      search: searchTerm || "",
    });

    const response = await fetch(
      `${ENDPOINT}/api/country/state/city/?${params}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch cities');
    }
    
    const data = await response.json();
    
    // Transform the data to match the expected format
    const cities = data?.data?.map((city) => ({
      value: city.id,
      label: city.name,
    })) || [];
    
    return {
      results: cities,
      next: cities.length === limit, // Simple pagination check
      count: cities.length
    };
  } catch (error) {
    console.error('Error fetching cities:', error);
    // Return empty results on error
    return {
      results: [],
      next: false,
      count: 0
    };
  }
};

// Transform city data to select options format
export const transformCitiesToOptions = (cities) => {
  if (!Array.isArray(cities)) {
    return [];
  }
  
  return cities.map(city => {
    // Handle different city object formats
    const cityName = city.name || city.city_name || city.label || city.value || '';
    const cityId = city.id || city.city_id || city.value || cityName;
    const country = city.country || city.country_name || '';
    const state = city.state || city.state_name || '';
    
    return {
      value: cityId,
      label: cityName,
      country: country,
      state: state
    };
  });
}; 