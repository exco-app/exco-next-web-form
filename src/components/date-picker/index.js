import React from "react";
import styled from "styled-components";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css"; // Default theme

const Wrapper = styled.div`
  .input-field-container {
    margin-bottom: 20px;
  }

  .input-label {
    display: block;
    font-size: 16px;
    color: #6c4f7d;
    margin-bottom: 8px;
    text-align: start;
  }

  .custom-input {
    width: 100%;
    padding: 10px;
    padding-left: 8px;
    font-size: 14px;
    border: none;
    border-bottom: 1px solid #d1b0cb;
    color: #4c3d56;
    cursor: pointer;
  }

  .custom-input:focus {
    outline: none;
    border-color: #6c4f7d;
  }

  .custom-input::placeholder {
    color: #b0a3b3;
  }

  /* custom-flatpickr.css */

  .date-picker-container {
    position: relative;
    width: 100%;
    max-width: 650px;
    margin: 0 auto;
  }

  .custom-date-input {
    width: 100%;
    padding: 16px 20px;
    font-size: 16px;
    border: 1px solid #e1e1e1;
    border-radius: 4px;
    background-color: #ffffff;
    color: #333333;
    box-shadow: none;
    outline: none;
    transition: border-color 0.2s ease;
  }
  .custom-input::placeholder {
    color: #b0a3b3;
  }

  .custom-date-input::placeholder {
    color: #a8a8a8 !important;
    font-weight: 300;
  }

  .custom-date-input:focus {
    border-color: #a3a3a3;
  }

  /* Calendar styling */
  .flatpickr-calendar {
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border: none;
  }

  .flatpickr-day.selected {
    background: #6c4f7d;
    border-color: #6c4f7d;
  }

  .flatpickr-day.selected:hover {
    background: #6c4f7d;
    border-color: #6c4f7d;
  }

  .flatpickr-day:hover {
    background: #f0f0f0;
  }

  .flatpickr-months .flatpickr-month {
    background: #ffffff;
    color: #333;
  }

  .flatpickr-current-month .flatpickr-monthDropdown-months {
    font-weight: 500;
  }

  .flatpickr-weekday {
    color: #555;
    font-weight: 500;
  }

  /* Make sure the calendar icon doesn't appear */
  .flatpickr-input[readonly] {
    cursor: pointer;
    background-color: #ffffff;
  }

  .flatpickr-months .flatpickr-month {
    background: #6c4f7d !important;
    color: #fff !important;
  }

  .flatpickr-day.selected,
  .flatpickr-day.startRange,
  .flatpickr-day.endRange,
  .flatpickr-day.selected.inRange,
  .flatpickr-day.startRange.inRange,
  .flatpickr-day.endRange.inRange,
  .flatpickr-day.selected:focus,
  .flatpickr-day.startRange:focus,
  .flatpickr-day.endRange:focus,
  .flatpickr-day.selected:hover,
  .flatpickr-day.startRange:hover,
  .flatpickr-day.endRange:hover,
  .flatpickr-day.selected.prevMonthDay,
  .flatpickr-day.startRange.prevMonthDay,
  .flatpickr-day.endRange.prevMonthDay,
  .flatpickr-day.selected.nextMonthDay,
  .flatpickr-day.startRange.nextMonthDay,
  .flatpickr-day.endRange.nextMonthDay {
    background: #6c4f7d !important;
    -webkit-box-shadow: none;
    box-shadow: none;
    color: #fff;
    border-color: #6c4f7d !important;
  }
  .required-astrix {
    position: absolute;
    top: 2px;
    right: 5px;
    color: red;
    font-size: 15px;
    z-index: 1;
  }
`;

const DateInputField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
}) => {
  return (
    <Wrapper>
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
    </Wrapper>
  );
};

export default DateInputField;
