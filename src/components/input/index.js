import React from "react";
import "./style.css";

const InputField = ({
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
}) => {
  const handleFocus = (e) => {
    const val = e.target.value;
    e.target.value = "";
    e.target.value = val;
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
              onChange={onChange}
              placeholder={placeholder}
              rows={rows}
              length={length}
              style={{
                resize: "none",
                overflow: "hidden",
              }}
              onFocus={handleFocus}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onBlur={onBlur}
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
            onChange={onChange}
            placeholder={placeholder}
            onFocus={handleFocus}
            onBlur={onBlur}
          />
        )}
      </div>
    </div>
  );
};

export default InputField;
