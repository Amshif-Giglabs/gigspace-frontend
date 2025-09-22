import React from 'react';
import Select, { components, StylesConfig, OptionProps, SingleValueProps, type SingleValue } from 'react-select';
import ReactCountryFlag from 'react-country-flag';
import countries from 'world-countries';

// Country interface
interface Country {
  value: string;
  label: string;
  code: string;
  dialCode: string;
  flag: string;
}

// Prepare country data with dial codes
const countryOptions: Country[] = countries
  .map((country) => ({
    value: country.cca2,
    label: country.name.common,
    code: country.cca2,
    dialCode: country.idd.root + (country.idd.suffixes?.[0] || ''),
    flag: country.flag,
  }))
  .filter((country) => country.dialCode && country.dialCode !== '+')
  .sort((a, b) => a.label.localeCompare(b.label));

// Add some popular countries at the top
const popularCountries = ['IN', 'US', 'GB', 'AU', 'CA'];
const sortedCountryOptions = [
  ...countryOptions.filter(country => popularCountries.includes(country.code)),
  ...countryOptions.filter(country => !popularCountries.includes(country.code))
];

// Custom option component with flag
const OptionComponent = (props: OptionProps<Country>) => (
  <components.Option {...props}>
    <div className="flex items-center gap-2">
      <ReactCountryFlag
        countryCode={props.data.code}
        svg
        style={{
          width: '20px',
          height: '15px',
        }}
      />
      <span className="text-sm font-medium">{props.data.label}</span>
      <span className="text-sm text-gray-500 ml-auto">{props.data.dialCode}</span>
    </div>
  </components.Option>
);

// Custom single value component with flag
const SingleValueComponent = (props: SingleValueProps<Country>) => (
  <components.SingleValue {...props}>
    <div className="flex items-center gap-2">
      <ReactCountryFlag
        countryCode={props.data.code}
        svg
        style={{
          width: '16px',
          height: '12px',
        }}
      />
      <span className="text-sm font-medium">{props.data.dialCode}</span>
    </div>
  </components.SingleValue>
);

// Custom styles for the select component
const customStyles: StylesConfig<Country, false> = {
  control: (provided, state) => ({
    ...provided,
    minHeight: '44px',
    border: state.isFocused ? '2px solid hsl(var(--ring))' : '1px solid hsl(var(--border))',
    borderRadius: '6px',
    backgroundColor: 'hsl(var(--background))',
    boxShadow: state.isFocused ? '0 0 0 1px hsl(var(--ring))' : 'none',
    '&:hover': {
      border: '1px solid hsl(var(--border))',
    },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected 
      ? 'hsl(var(--primary))' 
      : state.isFocused 
      ? 'hsl(var(--accent))' 
      : 'hsl(var(--background))',
    color: state.isSelected ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
    padding: '10px 14px',
    cursor: 'pointer',
    minWidth: '260px',
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: 'hsl(var(--background))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '6px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    zIndex: 50,
    minWidth: '280px',
    width: 'max-content',
  }),
  menuList: (provided) => ({
    ...provided,
    maxHeight: '220px',
    padding: '4px',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'hsl(var(--foreground))',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: 'hsl(var(--muted-foreground))',
  }),
  input: (provided) => ({
    ...provided,
    color: 'hsl(var(--foreground))',
  }),
};

interface CountryCodeSelectorProps {
  value?: Country;
  onChange: (country: Country | null) => void;
  className?: string;
}

const CountryCodeSelector: React.FC<CountryCodeSelectorProps> = ({ 
  value, 
  onChange, 
  className = "" 
}) => {
  const handleChange = (selectedOption: SingleValue<Country>) => {
    onChange(selectedOption);
  };

  return (
    <div className={`min-w-[120px] ${className}`}>
      <Select<Country>
        value={value}
        onChange={handleChange}
        options={sortedCountryOptions}
        components={{ Option: OptionComponent, SingleValue: SingleValueComponent }}
        styles={customStyles}
        placeholder="Select..."
        isSearchable
        className="react-select-container"
        classNamePrefix="react-select"
        menuPlacement="auto"
        menuPosition="fixed"
      />
    </div>
  );
};

export default CountryCodeSelector;
export type { Country };
