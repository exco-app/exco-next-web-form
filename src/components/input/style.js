import styled from "styled-components";

export const Wrapper = styled.div`
  .input-field-container {
    margin-bottom: 20px;
    position: relative;
  }

  .input-label {
    display: block;
    font-size: 16px;
    color: #6c4f7d;
    margin-bottom: 8px;
    text-align: start;
  }

  .input-field {
    width: 100%;
    padding: 10px;
    font-size: 14px;
    border: none;
    border-bottom: 1px solid #d1b0cb;
    color: #4c3d56;
  }

  .input-field:focus {
    outline: none;
    border-color: #6c4f7d;
  }

  input[type="date"]:focus,
  input[type="text"]:focus,
  input[type="number"]:focus {
    background-color: #ffffff;
  }

  .input-field::placeholder {
    color: #b0a3b3;
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
