import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import apiClient from '@/lib/axiosInterceptor';

interface LocationSuggestion {
  place_id: string;
  description: string;
}

interface LocationData {
  address: string;
  place_id: string;
  lat: number;
  lng: number;
  address_components: any[];
}

interface LocationInputProps {
  id: string;
  placeholder: string;
  value: string;
  onChange: (locationData: LocationData) => void;
  className?: string;
  selectedCityName?: string;
}

export const LocationInput: React.FC<LocationInputProps> = ({
  id,
  placeholder,
  value,
  onChange,
  className = '',
  selectedCityName
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();
  const dropdownRef = useRef<HTMLDivElement>(null);



  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (input: string) => {
    if (!input.trim() || input.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const searchInput = selectedCityName ? `${input} ${selectedCityName}` : input;
      
      const response = await apiClient.get(
        `https://adminbackend.hire4drive.com/api/places/autocomplete?input=${encodeURIComponent(searchInput)}&sessiontoken=${Date.now()}`
      );
      
      if (response.data.status === 'OK' && response.data.predictions) {
        const filteredPredictions = selectedCityName 
          ? response.data.predictions.filter(p => 
              p.description.toLowerCase().includes(selectedCityName.toLowerCase())
            )
          : response.data.predictions;
          

          
        setSuggestions(filteredPredictions.map(p => ({
          place_id: p.place_id,
          description: p.description
        })));
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaceDetails = async (placeId: string) => {
    try {
      const response = await apiClient.get(
        `https://adminbackend.hire4drive.com/api/places/details?place_id=${placeId}&sessiontoken=${Date.now()}`
      );
      
      if (response.data.status === 'OK' && response.data.result) {
        const place = response.data.result;
        const locationData: LocationData = {
          address: place.formatted_address || '',
          place_id: placeId,
          lat: place.geometry?.location?.lat || 0,
          lng: place.geometry?.location?.lng || 0,
          address_components: place.address_components || []
        };
        onChange(locationData);
      }
    } catch (error) {
      console.error('Failed to fetch place details:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowSuggestions(true);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 300);
  };

  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    setInputValue(suggestion.description);
    setShowSuggestions(false);
    fetchPlaceDetails(suggestion.place_id);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Input
        id={id}
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(true)}
        className={className}
      />
      
      {showSuggestions && (suggestions.length > 0 || loading) && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading && (
            <div className="p-3 text-center text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          )}
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.place_id}
              onClick={() => handleSuggestionClick(suggestion)}
              className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="text-sm text-gray-900">{suggestion.description}</div>
            </div>
          ))}
          {!loading && suggestions.length === 0 && selectedCityName && (
            <div className="p-3 text-gray-500 text-center">
              No locations found in {selectedCityName}
            </div>
          )}
        </div>
      )}
    </div>
  );
};