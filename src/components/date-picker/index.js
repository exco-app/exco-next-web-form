import React from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css"; // Default theme
import "./style.css";

const DateInputField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
}) => {
  return (
    <div className="date-picker-wrapper">
      <div className="date-picker-container">
        {required && <span className="required-astrix">*</span>}
        <Flatpickr
          value={value}
          onChange={onChange}
          options={{
            dateFormat: "F j, Y",
            allowInput: true,
            placeholder: "Enter Date of Birth",
            disableMobile: true,
            yearRange: "1900:2025",
            defaultDate: new Date(1992, 0, 1),
          }}
          className="custom-input mb-5"
          placeholder="Enter Date of Birth"
        />
      </div>
    </div>
  );
};

export default DateInputField;
