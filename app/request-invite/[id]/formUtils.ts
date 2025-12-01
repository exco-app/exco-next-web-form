import { formatDateToReadable } from "../../../src/utils/formHelpers";
import { phoneCode } from "../../../src/config/data";

export interface EditionData {
  id: string;
  name: string;
  start_date?: string;
  end_date?: string;
  project_name?: string;
  hero_image?: string;
  profile_images?: string[];
}

export const formatDate = (dateString?: string): string => {
  if (!dateString) return "";
  return formatDateToReadable(dateString);
};

const formatDateWithoutYear = (dateString?: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  return `${day} ${month}`;
};

export const getDateRange = (editionData?: EditionData): string => {
  if (!editionData?.start_date || !editionData?.end_date) return "";
  const start = formatDateWithoutYear(editionData.start_date);
  const end = formatDateWithoutYear(editionData.end_date);
  return `${start} - ${end}`;
};

export const getDaysCount = (editionData?: EditionData): number => {
  if (!editionData?.start_date || !editionData?.end_date) return 0;
  const start = new Date(editionData.start_date);
  const end = new Date(editionData.end_date);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

export const getCountryCodeOptions = () => {
  return phoneCode.map(code => ({
    value: code.code,
    label: `${code.flag} ${code.code}`,
  }));
};

export const formatCountryCodeLabel = (code: string): string => {
  const country = phoneCode.find(c => c.code === code);
  return country ? `${country.flag} ${country.code}` : code;
};




