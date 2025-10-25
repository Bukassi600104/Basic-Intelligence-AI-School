import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';

// Common countries with their codes
const COUNTRIES = [
  { code: '+234', name: 'Nigeria', flag: '🇳🇬', format: 'XXX XXX XXXX' },
  { code: '+1', name: 'United States', flag: '🇺🇸', format: 'XXX XXX XXXX' },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧', format: 'XXXX XXX XXX' },
  { code: '+91', name: 'India', flag: '🇮🇳', format: 'XXXXX XXXXX' },
  { code: '+86', name: 'China', flag: '🇨🇳', format: 'XXX XXXX XXXX' },
  { code: '+81', name: 'Japan', flag: '🇯🇵', format: 'XX XXXX XXXX' },
  { code: '+49', name: 'Germany', flag: '🇩🇪', format: 'XXX XXXXXXX' },
  { code: '+33', name: 'France', flag: '🇫🇷', format: 'X XX XX XX XX' },
  { code: '+39', name: 'Italy', flag: '🇮🇹', format: 'XXX XXX XXXX' },
  { code: '+34', name: 'Spain', flag: '🇪🇸', format: 'XXX XXX XXX' },
  { code: '+27', name: 'South Africa', flag: '🇿🇦', format: 'XX XXX XXXX' },
  { code: '+254', name: 'Kenya', flag: '🇰🇪', format: 'XXX XXXXXX' },
  { code: '+233', name: 'Ghana', flag: '🇬🇭', format: 'XX XXX XXXX' },
  { code: '+20', name: 'Egypt', flag: '🇪🇬', format: 'XX XXXX XXXX' },
  { code: '+971', name: 'UAE', flag: '🇦🇪', format: 'XX XXX XXXX' },
  { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦', format: 'XX XXX XXXX' },
  { code: '+60', name: 'Malaysia', flag: '🇲🇾', format: 'XX XXXX XXXX' },
  { code: '+65', name: 'Singapore', flag: '🇸🇬', format: 'XXXX XXXX' },
  { code: '+61', name: 'Australia', flag: '🇦🇺', format: 'XXX XXX XXX' },
  { code: '+64', name: 'New Zealand', flag: '🇳🇿', format: 'XX XXX XXXX' },
  { code: '+55', name: 'Brazil', flag: '🇧🇷', format: 'XX XXXXX XXXX' },
  { code: '+52', name: 'Mexico', flag: '🇲🇽', format: 'XX XXXX XXXX' },
  { code: '+54', name: 'Argentina', flag: '🇦🇷', format: 'XX XXXX XXXX' },
  { code: '+7', name: 'Russia', flag: '🇷🇺', format: 'XXX XXX XX XX' },
];

const PhoneInput = ({ 
  label = "Phone Number", 
  name = "phone",
  value = "",
  onChange,
  onBlur,
  required = false,
  disabled = false,
  error = "",
  placeholder = "Enter phone number",
  defaultCountryCode = "+234", // Nigeria as default
  className = ""
}) => {
  // Parse existing value if it contains country code
  const parsePhoneValue = (val) => {
    if (!val) return { countryCode: defaultCountryCode, number: '' };
    
    // Check if value starts with a country code
    const matchedCountry = COUNTRIES.find(country => val.startsWith(country.code));
    if (matchedCountry) {
      return {
        countryCode: matchedCountry.code,
        number: val.substring(matchedCountry.code.length).trim()
      };
    }
    
    return { countryCode: defaultCountryCode, number: val };
  };

  const [countryCode, setCountryCode] = useState(defaultCountryCode);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize from value prop
  useEffect(() => {
    const parsed = parsePhoneValue(value);
    setCountryCode(parsed.countryCode);
    setPhoneNumber(parsed.number);
  }, [value]);

  // Filter countries based on search
  const filteredCountries = COUNTRIES.filter(country => 
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.code.includes(searchQuery)
  );

  const selectedCountry = COUNTRIES.find(c => c.code === countryCode) || COUNTRIES[0];

  const handleCountrySelect = (country) => {
    setCountryCode(country.code);
    setShowDropdown(false);
    setSearchQuery('');
    // Notify parent of change
    const fullNumber = phoneNumber ? `${country.code} ${phoneNumber}` : '';
    onChange?.({ target: { name, value: fullNumber } });
  };

  const handlePhoneNumberChange = (e) => {
    let val = e.target.value;
    
    // Remove any non-digit characters except spaces
    val = val.replace(/[^\d\s]/g, '');
    
    setPhoneNumber(val);
    
    // Combine country code and phone number
    const fullNumber = val ? `${countryCode} ${val}` : '';
    onChange?.({ target: { name, value: fullNumber } });
  };

  const handleInputBlur = (e) => {
    const fullNumber = phoneNumber ? `${countryCode} ${phoneNumber}` : '';
    onBlur?.({ target: { name, value: fullNumber } });
  };

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative flex items-center gap-2">
        {/* Country Code Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={disabled}
            className={`flex items-center gap-2 px-3 py-2.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
            style={{ minWidth: '110px' }}
          >
            <span className="text-xl">{selectedCountry.flag}</span>
            <span className="font-medium text-sm">{selectedCountry.code}</span>
            <Icon name={showDropdown ? "ChevronUp" : "ChevronDown"} size={16} className="text-gray-400" />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowDropdown(false)}
              />
              
              {/* Dropdown */}
              <div className="absolute left-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-20 max-h-96 overflow-hidden flex flex-col">
                {/* Search */}
                <div className="p-3 border-b border-gray-200">
                  <div className="relative">
                    <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search country..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>

                {/* Country List */}
                <div className="overflow-y-auto">
                  {filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors text-left ${
                        country.code === countryCode ? 'bg-orange-50 border-l-4 border-orange-500' : ''
                      }`}
                    >
                      <span className="text-2xl">{country.flag}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {country.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {country.code} • {country.format}
                        </div>
                      </div>
                      {country.code === countryCode && (
                        <Icon name="Check" size={16} className="text-orange-500 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                  
                  {filteredCountries.length === 0 && (
                    <div className="px-4 py-8 text-center text-gray-500 text-sm">
                      No countries found
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Phone Number Input */}
        <div className="flex-1 relative">
          <input
            type="tel"
            name={name}
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            onBlur={handleInputBlur}
            placeholder={placeholder || selectedCountry.format}
            disabled={disabled}
            required={required}
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
              error ? 'border-red-500' : 'border-gray-300'
            } ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
          />
        </div>
      </div>

      {/* Format Hint */}
      {!error && (
        <p className="mt-1 text-xs text-gray-500">
          Format: {selectedCountry.code} {selectedCountry.format}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <Icon name="AlertCircle" size={12} />
          {error}
        </p>
      )}
    </div>
  );
};

export default PhoneInput;
