import CryptoJS from "crypto-js";

export const prodMode = true;
export const localhostMode = false;

export const ENDPOINT = prodMode
  ? "https://api.theexperience.co"
  : localhostMode
    ? "http://localhost:8000"
    : "https://dev-api.theexperience.co";

export const BHX_ACCESS_TOKEN = process.env.REACT_APP_FACEBOOK_ACCESS_TOKEN_BHX;

export const MIXPANEL_TOKEN = process.env.REACT_APP_MIXPANEL_TOKEN;
export const BUCKETLIST_ACCESS_TOKEN =
  process.env.REACT_APP_FACEBOOK_ACCESS_TOKEN_BUCKETLIST;

export function suppressConsoleLogs() {
  if (process.env.NODE_ENV === "production") {
    for (let method of ["log", "warn", "info", "debug"]) {
      console[method] = () => { }; // Replace console methods with no-op
    }
  }
}

export const hashGender = (genderValue) => {
  // Map your gender codes to Meta's expected format
  let normalizedGender;

  switch (parseInt(genderValue)) {
    case 1: // Female
      normalizedGender = "f";
      break;
    case 2: // Male
      normalizedGender = "m";
      break;
    case 3: // Genderqueer / Gender Nonconforming
      normalizedGender = "m";
      break;
    case 5: // Prefer not to say
      normalizedGender = "m";
      break;
    case 6: // Trans Woman
      normalizedGender = "m";
      break;
    case 7: // Trans Man
      normalizedGender = "m";
      break;
    case 8: // Other
      normalizedGender = "m";
      break;
    case 9: // Nonbinary
      normalizedGender = "m";
      break;
    default:
      normalizedGender = "m";
  }

  // If we couldn't normalize the gender, don't include it
  if (!normalizedGender) return null;

  return CryptoJS.SHA256(normalizedGender).toString(CryptoJS.enc.Hex);
};

export const hashData = (data) => {
  if (!data) return null;

  // Normalize data before hashing (lowercase, trim whitespace)
  const normalized = data.toString().toLowerCase().trim();

  return CryptoJS.SHA256(normalized).toString(CryptoJS.enc.Hex);
};

export const hashDOB = (dateStr) => {
  if (!dateStr) return null;

  // Parse the input date string
  const date = new Date(dateStr);

  // Format to YYYYMMDD
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // +1 because months are 0-indexed
  const day = String(date.getDate()).padStart(2, "0");

  // Create normalized string in YYYYMMDD format
  const normalized = `${year}${month}${day}`;

  // Hash using SHA-256 and encode in Base64
  return CryptoJS.SHA256(normalized).toString(CryptoJS.enc.Hex);
};

export const getQueryParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const project = urlParams.get("project");
  const otherParams = {};

  // Store all params except 'project'
  urlParams.forEach((value, key) => {
    if (key !== "project") {
      otherParams[key] = value;
    }
  });

  return { project, otherParams };
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
