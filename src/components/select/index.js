
import React, { forwardRef } from "react";
import Select from "react-select";
import { Wrapper } from "./style";

const CustomSelect = forwardRef(({
  label,
  options,
  value,
  onChange,
  placeholder = "Select...",
  loading,
  multiple = false,
  customLable = false,
  formatOptionLabel: customFormatOptionLabel,
  required = false,
  wantLabel = false,
  placeholderStyle = {},
  searchable = false,
  onInputChange,
  onFocus,
  onBlur,
  onMenuScrollToBottom,
  noOptionsMessage,
  containerStyle = {},
  ...props
}, ref) => {
  const defaultFormatOptionLabel = ({ label, date }) => (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={customLable ? { fontWeight: "bold", fontSize: "16px", fontFamily: "Plus Jakarta Sans, sans-serif" } : {}}
      >
        {label}
      </div>
      {date && (
        <div
          style={{
            fontSize: "14px",
          }}
        >
          {date}
        </div>
      )}
    </div>
  );

  const formatOptionLabel = customFormatOptionLabel || defaultFormatOptionLabel;

  return (
    <Wrapper
      style={
        customLable
          ? {
            "--placeholder-color": "#000",
            "--placeholder-font-weight": "500",
            "--min-height": "60px",
          }
          : {}
      }
    >
      <div className="select-field-container">
        {required && <span className="required-astrix">*</span>}
        <Select
          ref={ref}
          className="select-field"
          value={
            multiple
              ? options.filter((option) => value.includes(option.value))
              : options.find((option) => option.value === value)
          }
          onChange={(selectedOption) =>
            onChange(
              multiple
                ? selectedOption.map((option) => option.value)
                : selectedOption
                  ? wantLabel
                    ? selectedOption
                    : selectedOption.value
                  : null
            )
          }
          options={options}
          placeholder={placeholder}
          noOptionsMessage={noOptionsMessage || (() =>
            options.length > 0 ? "Searching..." : "No results found"
          )}
          isMulti={multiple}
          isLoading={loading}
          isSearchable={searchable}
          formatOptionLabel={formatOptionLabel} // Use the determined format function
          onInputChange={searchable ? onInputChange : undefined}
          onFocus={onFocus}
          onBlur={onBlur}
          onMenuScrollToBottom={onMenuScrollToBottom}
          styles={{
            option: (provided, state) => ({
              ...provided,
              padding: "12px 16px",
              cursor: "pointer",
              backgroundColor: state.isSelected
                ? "#5f2c41"
                : state.isFocused
                  ? "#f9f9f9"
                  : "white",
              borderBottom: "1px solid #eaeaea",
            }),
            control: (provided) => ({
              ...provided,
              borderRadius: containerStyle.borderRadius || "8px",
              padding: containerStyle.padding || "4px",
              boxShadow: "none",
              borderColor: "#ddd",
              border: containerStyle.border,
              "&:hover": {
                borderColor: "#aaa",
              },
            }),
            menu: (provided) => ({
              ...provided,
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              padding: "4px",
              width: "100%",
              zIndex: 1000,
            }),
            multiValue: (provided) => ({
              ...provided,
              maxWidth: "calc(50% - 4px)",
              margin: "2px",
            }),
            multiValueLabel: (provided) => ({
              ...provided,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }),
            placeholder: (provided) => ({
              ...provided,
              fontFamily: "Plus Jakarta Sans, sans-serif",
              ...placeholderStyle,
            }),
            dropdownIndicator: (provided) => ({
              ...provided,
              color: "#5F2C41",
            }),
          }}
          {...props}
        />
      </div>
    </Wrapper>
  );
});

export default CustomSelect;
