import { useState, useCallback, useEffect } from 'react';
import { fetchCities } from '../utils/cityApi';

export const useCitySearch = () => {
  const [cities, setCities] = useState([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [activeCityPage, setActiveCityPage] = useState(1);
  const [isFocused, setIsFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Fetch cities when debounced search term changes
  useEffect(() => {
    if (debouncedSearchTerm !== undefined) {
      getCities();
    }
  }, [debouncedSearchTerm, activeCityPage]);

  // Initial load of cities
  useEffect(() => {
    getCities();
  }, []); // Only run once on mount

  // Fetch cities function
  const getCities = async () => {
    setCityLoading(true);
    try {
      const data = await fetchCities(debouncedSearchTerm, activeCityPage, 10);
      const newOptions = data.results;

      setCities((prevOptions) => {
        const combined = [
          ...(debouncedSearchTerm ? [] : prevOptions),
          ...newOptions,
        ];
        const uniqueOptions = Array.from(
          new Set(combined.map((opt) => opt.value))
        ).map((id) => combined.find((opt) => opt.value === id));

        return uniqueOptions;
      });

      setCityLoading(false);
    } catch (error) {
      console.error("Error fetching cities:", error);
      setCityLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = useCallback((newValue) => {
    setSearchTerm(newValue);
    if (newValue !== debouncedSearchTerm) {
      setActiveCityPage(1); // Reset to first page for new search
    }
  }, [debouncedSearchTerm]);

  // Load more cities (pagination)
  const loadMoreCities = useCallback(() => {
    if (!cityLoading) {
      setActiveCityPage((prevState) => prevState + 1);
    }
  }, [cityLoading]);

  // Handle focus
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setMenuOpen(true);
  }, []);

  // Handle blur
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // Don't immediately close the menu on blur to allow for option selection
  }, []);

  // Handle menu open/close
  const handleMenuOpen = useCallback(() => {
    setMenuOpen(true);
  }, []);

  const handleMenuClose = useCallback(() => {
    setMenuOpen(false);
  }, []);

  // Reset search
  const resetSearch = useCallback(() => {
    setCities([]);
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setActiveCityPage(1);
    setMenuOpen(false);
  }, []);

  return {
    cities,
    cityLoading,
    searchTerm,
    isFocused,
    menuOpen,
    handleSearchChange,
    loadMoreCities,
    handleFocus,
    handleBlur,
    handleMenuOpen,
    handleMenuClose,
    resetSearch,
    setMenuOpen,
  };
}; 