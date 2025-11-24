export const formatDate = (dateString) => {
  if (!dateString) return "-";

  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

export const formatDateToReadable = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
};

export const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return { days: 0, nights: 0 };

  const start = new Date(startDate);
  const end = new Date(endDate);

  const durationInMilliseconds = end - start;
  const days = Math.ceil(durationInMilliseconds / (1000 * 60 * 60 * 24)) + 1;
  const nights = days - 1;

  return { days, nights };
};

export const validateUrl = (url) => {
  if (!url) return true; // Optional field
  const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z]{2,6})([/\w .-]*)*\/?$/;
  return urlPattern.test(url);
};

export const formatPhoneNumber = (phone) => {
  if (!phone) return "";
  return phone.replace(/\D/g, "");
};

export const formatInstagramHandle = (handle) => {
  if (!handle) return "";
  return handle.replace(/@/g, "");
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const getStoreLink = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  if (/iPad|iPhone|iPod/.test(userAgent)) {
    return appStoreLink; // iOS (iPhone, iPad)
  } else if (/Macintosh/.test(userAgent) && navigator.maxTouchPoints > 0) {
    return appStoreLink; // macOS with touch (MacBook, iPad Pro)
  } else if (/android/i.test(userAgent)) {
    return playStoreLink; // Android
  } else if (/Win/.test(userAgent)) {
    return playStoreLink; // Windows
  } else if (/Macintosh/.test(userAgent)) {
    return appStoreLink; // Other macOS devices (MacBook, iMac)
  }

  return playStoreLink;
};

const playStoreLink =
  "https://play.google.com/store/apps/details?id=com.bhx.app";
const appStoreLink =
  "https://apps.apple.com/in/app/exco-travel-community/id6739699261";