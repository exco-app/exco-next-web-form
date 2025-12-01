import React from "react";
import "./style.css";

interface InputFieldProps {
  label?: string;
  type?: React.HTMLInputTypeAttribute;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  multiline?: boolean;
  maxRows?: number;
  length?: number; // Maximum character length
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  style?: React.CSSProperties;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type = "text",
  name,
  value = "",
  onChange,
  placeholder,
  rows = 1,
  required = false,
  multiline = false,
  maxRows = 5,
  length = 160, // Maximum character length
  onBlur,
  onFocus,
  style,
}) => {
  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    e.target.value = "";
    e.target.value = val;
    if (onFocus) {
      // Type assertion: both input and textarea focus events are compatible
      onFocus(e as unknown as React.FocusEvent<HTMLInputElement>);
    }
  };

  const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = "auto";
    target.style.height = `${target.scrollHeight}px`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      // Type assertion: textarea events are compatible with input handlers
      onChange(e as unknown as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (onBlur) {
      onBlur(e);
    }
  };

  const handleTextareaBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (onBlur) {
      // Type assertion: textarea events are compatible with input handlers
      onBlur(e as unknown as React.FocusEvent<HTMLInputElement>);
    }
  };

  return (
    <div className="input-field-wrapper">
      <div className="input-field-container">
        {required && <span className="required-astrix">*</span>}
        {multiline ? (
          <>
            <textarea
              className="input-field red-astrix"
              name={name}
              value={value}
              onChange={handleTextareaChange}
              placeholder={placeholder}
              rows={rows}
              maxLength={length}
              style={{
                resize: "none",
                overflow: "hidden",
              }}
              onFocus={handleFocus}
              onInput={handleTextareaInput}
              onBlur={handleTextareaBlur}
            />
            {length > 0 && (
              <div
                className="char-counter"
                style={{
                  position: "absolute",
                  bottom: "5px",
                  right: "10px",
                  fontSize: "12px",
                  color: "#888",
                }}
              >
                {value.length}/{length}
              </div>
            )}
          </>
        ) : (
          <input
            className="input-field"
            type={type}
            name={name}
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            onFocus={handleFocus}
            onBlur={handleInputBlur}
            style={style}
          />
        )}
      </div>
    </div>
  );
};

export default InputField;
