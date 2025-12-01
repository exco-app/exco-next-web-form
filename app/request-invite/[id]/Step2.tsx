'use client';

import React, { useEffect } from "react";
import InputField from "../../../src/components/input";
import CustomSelect from "../../../src/components/select";
import { trackStepCompleted } from "../../../src/utils/mixpanel-helpers";
import {
    genderOptions,
    professionalCategoryOptions,
    howDidYouHearOptions,
    whatAreYouLookingForOptions,
    oneThingRuinsTripOptions,
    occasionOptions,
    budgetRangeOptions,
    whenWouldYouBookOptions,
} from "../../../src/config/data";
import { EditionData } from "./formUtils";
import styles from './Step2.module.css';

interface Step2FormData {
    gender: string;
    dateOfBirth: string;
    professionalCategory: string;
    designation: string;
    howDidYouHear: string;
    whatAreYouLookingFor: any[];
    oneThingRuinsTrip: string;
    occasion: string;
    instagramProfile: string;
    estimatedBudget: string;
    whenWouldYouBook: string;
}

interface Step2Validation {
    errors: {
        gender?: string;
        dateOfBirth?: string;
        professionalCategory?: string;
        designation?: string;
        whatAreYouLookingFor?: string;
        oneThingRuinsTrip?: string;
        instagramProfile?: string;
    };
}

interface Step2Props {
    editionData: EditionData | null;
    formData: Step2FormData;
    validation: Step2Validation;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSelectChange: (name: string) => (value: string) => void;
    updateField: (fieldName: string, values: any) => void;
    clearFieldError?: (fieldName: string) => void;
    isMobile: boolean;
    isSubmitting: boolean;
    onSubmit: () => void;
}

const getSelectStyles = () => ({
    control: (provided: any) => ({
        ...provided,
        border: 'none',
        boxShadow: 'none',
        minHeight: '48px',
        fontFamily: '"Hind", sans-serif',
        fontWeight: 500,
        fontSize: '16px',
        color: 'red',
    }),
    placeholder: (provided: any) => ({
        ...provided,
        color: '#c4c4c4',
        fontFamily: '"Hind", sans-serif',
        fontWeight: 500,
        fontSize: '16px',
    }),
    singleValue: (provided: any) => ({
        ...provided,
        color: '#464646',
        fontFamily: '"Hind", sans-serif',
        fontWeight: 500,
        fontSize: '16px',
    }),
    option: (provided: any, state: any) => ({
        ...provided,
        backgroundColor: state.isSelected ? '#fe664e' : state.isFocused ? '#FFE9E6' : 'white',
        color: state.isSelected ? 'white' : '#464646',
        fontFamily: '"Hind", sans-serif',
        fontSize: '16px',
        padding: '12px 16px',
        cursor: 'pointer',
    }),
    menu: (provided: any) => ({
        ...provided,
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        zIndex: 1000,
    }),
    indicatorSeparator: () => ({
        display: 'none',
    }),
    dropdownIndicator: (provided: any) => ({
        ...provided,
        color: '#464646',
        padding: '0 12px',
    }),
});

const Step2: React.FC<Step2Props> = ({
    editionData,
    formData,
    validation,
    handleInputChange,
    handleSelectChange,
    updateField,
    clearFieldError,
    isMobile,
    isSubmitting,
    onSubmit,
}) => {
    const selectStyles = getSelectStyles();

    const handleInputChangeWithTracking = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fieldName = e.target.name;
        const fieldValue = e.target.value;

        handleInputChange(e);

        if (fieldValue && fieldValue.trim() !== '') {
            trackStepCompleted(`Step2_${fieldName}`, { [fieldName]: fieldValue }, editionData);
        }
    };

    const handleSelectChangeWithTracking = (selectedOption: any, fieldName: string) => {
        handleSelectChange(fieldName)(selectedOption?.value || '');

        if (selectedOption) {
            trackStepCompleted(`Step2_${fieldName}`, { [fieldName]: selectedOption }, editionData);
        }
    };

    const updateFieldWithTracking = (fieldName: string, values: any) => {
        updateField(fieldName, values);

        if (values && Array.isArray(values) && values.length > 0) {
            trackStepCompleted(`Step2_${fieldName}`, { [fieldName]: values.map((v: any) => v.value || v) }, editionData);
        }
    };

    useEffect(() => {
        if (formData.whatAreYouLookingFor &&
            Array.isArray(formData.whatAreYouLookingFor) &&
            formData.whatAreYouLookingFor.length > 0 &&
            validation.errors.whatAreYouLookingFor &&
            clearFieldError) {
            clearFieldError("whatAreYouLookingFor");
        }
    }, [formData.whatAreYouLookingFor, validation.errors.whatAreYouLookingFor, clearFieldError]);

    const handleFieldFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        let fieldWrapper: HTMLElement | null = null;
        const targetElement = e.target;

        if (targetElement.closest) {
            fieldWrapper = targetElement.closest('[data-field-wrapper]') as HTMLElement;

            if (!fieldWrapper) {
                const selectContainer = targetElement.closest('.select-field-container') ||
                    targetElement.closest('[class*="select"]');
                if (selectContainer) {
                    fieldWrapper = selectContainer.closest('[data-field-wrapper]') as HTMLElement;
                }
            }
        }

        if (fieldWrapper) {
            setTimeout(() => {
                fieldWrapper?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
            }, 100);
        } else if (targetElement) {
            setTimeout(() => {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
            }, 100);
        }
    };

    return (
        <div className={styles.step2Container}>
            <div className={`${styles.step2Header} ${isMobile ? styles.step2HeaderMobile : ''}`}>
                <div className={styles.newStepHeaderContent}>
                    <h1 className={styles.newStepHeaderTitle}>Requesting Invite</h1>
                    <p className={styles.newStepHeaderSubtitle}>Step 2 of 2 • Get Access</p>
                </div>
            </div>

            <div className={styles.step2Content}>
                {isMobile ? (
                    <>
                        <div className={styles.step2SectionWrapper}>
                            <div className={styles.newFormSection}>
                                <h3 className={styles.newSectionTitle}>🙌 About you</h3>
                                <div className={styles.newSectionFields}>
                                    <div className={styles.newFieldWrapper} data-field-wrapper>
                                        <label className={styles.newFieldLabel}>
                                            Gender <span className={styles.required}>*</span>
                                        </label>
                                        <div className={styles.newSelectFieldWrapper}>
                                            <CustomSelect
                                                options={genderOptions}
                                                value={formData.gender}
                                                onChange={(selectedOption: any) => {
                                                    handleSelectChangeWithTracking(selectedOption, "gender");
                                                    if (validation.errors.gender && clearFieldError) {
                                                        clearFieldError("gender");
                                                    }
                                                }}
                                                onFocus={handleFieldFocus}
                                                placeholder="Pick one"
                                                containerStyle={{
                                                    border: "none",
                                                    height: "48px",
                                                    minHeight: "48px",
                                                }}
                                                styles={selectStyles}
                                            />
                                        </div>
                                        {validation.errors.gender && (
                                            <div className={styles.errorMessage}>{validation.errors.gender}</div>
                                        )}
                                    </div>

                                    <div className={styles.newFieldWrapper} data-field-wrapper>
                                        <label className={styles.newFieldLabel}>
                                            Date of birth <span className={styles.required}>*</span>
                                        </label>
                                        <div className={styles.newInputField} onFocus={handleFieldFocus}>
                                            <InputField
                                                type="text"
                                                name="dateOfBirth"
                                                value={formData.dateOfBirth}
                                                onChange={handleInputChangeWithTracking}
                                                placeholder="DD - MM - YYYY"
                                                required={false}
                                                onBlur={() => { }}
                                            />
                                        </div>
                                        {validation.errors.dateOfBirth && (
                                            <div className={styles.errorMessage}>{validation.errors.dateOfBirth}</div>
                                        )}
                                    </div>

                                    <div className={styles.newFieldWrapper} data-field-wrapper>
                                        <label className={styles.newFieldLabel}>
                                            Professional Category <span className={styles.required}>*</span>
                                        </label>
                                        <div className={styles.newSelectFieldWrapper}>
                                            {/* @ts-expect-error - CustomSelect is JS component without TS definitions */}
                                            <CustomSelect
                                                options={professionalCategoryOptions}
                                                value={formData.professionalCategory}
                                                onChange={(selectedOption: any) => {
                                                    handleSelectChangeWithTracking(selectedOption, "professionalCategory");
                                                    if (validation.errors.professionalCategory && clearFieldError) {
                                                        clearFieldError("professionalCategory");
                                                    }
                                                }}
                                                onFocus={handleFieldFocus}
                                                placeholder="Pick a category"
                                                containerStyle={{
                                                    border: "none",
                                                    height: "48px",
                                                    minHeight: "48px",
                                                }}
                                                styles={selectStyles}
                                            />
                                        </div>
                                        {validation.errors.professionalCategory && (
                                            <div className={styles.errorMessage}>{validation.errors.professionalCategory}</div>
                                        )}
                                    </div>

                                    <div className={styles.newFieldWrapper} data-field-wrapper>
                                        <label className={styles.newFieldLabel}>
                                            Your Designation <span className={styles.required}>*</span>
                                        </label>
                                        <div className={styles.newInputField} onFocus={handleFieldFocus}>
                                            <InputField
                                                type="text"
                                                name="designation"
                                                value={formData.designation || ""}
                                                onChange={handleInputChangeWithTracking}
                                                placeholder="Ex: Designer at Apple"
                                                required={false}
                                                onBlur={() => { }}
                                            />
                                        </div>
                                        {validation.errors.designation && (
                                            <div className={styles.errorMessage}>{validation.errors.designation}</div>
                                        )}
                                    </div>

                                    <div className={styles.newFieldWrapper} data-field-wrapper>
                                        <label className={styles.newFieldLabel}>How did you hear about us?</label>
                                        <div className={styles.newSelectFieldWrapper}>
                                            {/* @ts-expect-error - CustomSelect is JS component without TS definitions */}
                                            <CustomSelect
                                                options={howDidYouHearOptions}
                                                value={formData.howDidYouHear}
                                                onChange={(selectedOption: any) => {
                                                    handleSelectChangeWithTracking(selectedOption, "howDidYouHear");
                                                }}
                                                onFocus={handleFieldFocus}
                                                placeholder="Pick one"
                                                containerStyle={{
                                                    border: "none",
                                                    height: "48px",
                                                    minHeight: "48px",
                                                }}
                                                styles={selectStyles}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.newDivider} />

                        <div className={styles.step2SectionWrapper}>
                            <div className={styles.newFormSection}>
                                <h3 className={styles.newSectionTitle}>🤩 Vibe check</h3>
                                <div className={styles.newSectionFields}>
                                    <div className={styles.newFieldWrapper} data-field-wrapper>
                                        <label className={styles.newFieldLabel}>
                                            What are you looking for? <span className={styles.required}>*</span>
                                        </label>
                                        <div className={styles.newSelectFieldWrapper}>
                                            {/* @ts-expect-error - CustomSelect is JS component without TS definitions */}
                                            <CustomSelect
                                                options={whatAreYouLookingForOptions}
                                                value={formData.whatAreYouLookingFor && Array.isArray(formData.whatAreYouLookingFor)
                                                    ? formData.whatAreYouLookingFor
                                                    : []}
                                                onChange={(selectedValues: any) => {
                                                    const values = Array.isArray(selectedValues) ? selectedValues : [];
                                                    updateFieldWithTracking("whatAreYouLookingFor", values);
                                                    if (values.length > 0 && validation.errors.whatAreYouLookingFor && clearFieldError) {
                                                        clearFieldError("whatAreYouLookingFor");
                                                    }
                                                }}
                                                onFocus={handleFieldFocus}
                                                placeholder="Pick top 3"
                                                multiple={true}
                                                containerStyle={{
                                                    border: "none",
                                                    minHeight: "48px",
                                                }}
                                                styles={{
                                                    ...selectStyles,
                                                    control: (provided: any) => ({
                                                        ...selectStyles.control(provided),
                                                        minHeight: "48px",
                                                        height: "auto",
                                                    }),
                                                    valueContainer: (provided: any) => ({
                                                        ...provided,
                                                        padding: "0 0 0 12px",
                                                        minHeight: "24px",
                                                        height: "auto",
                                                        flexWrap: "wrap",
                                                    }),
                                                    multiValue: (provided: any) => ({
                                                        ...provided,
                                                        backgroundColor: "#FFE9E6",
                                                        borderRadius: "4px",
                                                        margin: "2px",
                                                    }),
                                                    multiValueLabel: (provided: any) => ({
                                                        ...provided,
                                                        fontFamily: '"Hind", sans-serif',
                                                        fontWeight: 500,
                                                        fontSize: "14px",
                                                        color: "#FE664E",
                                                        padding: "2px 6px",
                                                    }),
                                                    multiValueRemove: (provided: any) => ({
                                                        ...provided,
                                                        color: "#FE664E",
                                                        ":hover": {
                                                            backgroundColor: "#FFBDB3",
                                                            color: "#FE664E",
                                                        },
                                                    }),
                                                }}
                                            />
                                        </div>
                                        {validation.errors.whatAreYouLookingFor && (
                                            <div className={styles.errorMessage}>{validation.errors.whatAreYouLookingFor}</div>
                                        )}
                                    </div>

                                    <div className={styles.newFieldWrapper} data-field-wrapper>
                                        <label className={styles.newFieldLabel}>
                                            One thing that ruins a trip for you? <span className={styles.required}>*</span>
                                        </label>
                                        <div className={styles.newSelectFieldWrapper}>
                                            {/* @ts-expect-error - CustomSelect is JS component without TS definitions */}
                                            <CustomSelect
                                                options={oneThingRuinsTripOptions}
                                                value={formData.oneThingRuinsTrip}
                                                onChange={(selectedOption: any) => {
                                                    handleSelectChangeWithTracking(selectedOption, "oneThingRuinsTrip");
                                                    if (validation.errors.oneThingRuinsTrip && clearFieldError) {
                                                        clearFieldError("oneThingRuinsTrip");
                                                    }
                                                }}
                                                onFocus={handleFieldFocus}
                                                placeholder="Pick one"
                                                containerStyle={{
                                                    border: "none",
                                                    height: "48px",
                                                    minHeight: "48px",
                                                }}
                                                styles={selectStyles}
                                            />
                                        </div>
                                        {validation.errors.oneThingRuinsTrip && (
                                            <div className={styles.errorMessage}>{validation.errors.oneThingRuinsTrip}</div>
                                        )}
                                    </div>

                                    <div className={styles.newFieldWrapper} data-field-wrapper>
                                        <label className={styles.newFieldLabel}>What are you celebrating?</label>
                                        <div className={styles.newSelectFieldWrapper}>
                                            {/* @ts-expect-error - CustomSelect is JS component without TS definitions */}
                                            <CustomSelect
                                                options={occasionOptions}
                                                value={formData.occasion}
                                                onChange={(selectedOption: any) => {
                                                    handleSelectChangeWithTracking(selectedOption, "occasion");
                                                }}
                                                onFocus={handleFieldFocus}
                                                placeholder="Pick one"
                                                containerStyle={{
                                                    border: "none",
                                                    height: "48px",
                                                    minHeight: "48px",
                                                }}
                                                styles={selectStyles}
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.newFieldWrapper} data-field-wrapper>
                                        <label className={styles.newFieldLabel}>
                                            Instagram handle or Linkedin profile url <span className={styles.required}>*</span>
                                        </label>
                                        <div className={styles.newInputField} onFocus={handleFieldFocus}>
                                            <InputField
                                                type="text"
                                                name="instagramProfile"
                                                value={formData.instagramProfile || ""}
                                                onChange={handleInputChangeWithTracking}
                                                placeholder="Your handle (or paste the link)"
                                                required={false}
                                                onBlur={() => { }}
                                            />
                                        </div>
                                        {validation.errors.instagramProfile && (
                                            <div className={styles.errorMessage}>{validation.errors.instagramProfile}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.newDivider} />

                        <div className={styles.step2SectionWrapper}>
                            <div className={styles.newFormSection}>
                                <h3 className={styles.newSectionTitle}>🙌 Timing & readiness</h3>
                                <div className={styles.newSectionFields}>
                                    <div className={styles.newFieldWrapper} data-field-wrapper>
                                        <label className={styles.newFieldLabel}>Your estimated budget for this trip?</label>
                                        <div className={styles.newSelectFieldWrapper}>
                                            {/* @ts-expect-error - CustomSelect is JS component without TS definitions */}
                                            <CustomSelect
                                                options={budgetRangeOptions}
                                                value={formData.estimatedBudget}
                                                onChange={(selectedOption: any) => {
                                                    handleSelectChangeWithTracking(selectedOption, "estimatedBudget");
                                                }}
                                                onFocus={handleFieldFocus}
                                                placeholder="Select a range"
                                                containerStyle={{
                                                    border: "none",
                                                    height: "48px",
                                                    minHeight: "48px",
                                                }}
                                                styles={selectStyles}
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.newFieldWrapper} data-field-wrapper style={{ marginBottom: '24px' }}>
                                        <label className={styles.newFieldLabel}>If invited, when would you book?</label>
                                        <div className={styles.newSelectFieldWrapper}>
                                            {/* @ts-expect-error - CustomSelect is JS component without TS definitions */}
                                            <CustomSelect
                                                options={whenWouldYouBookOptions}
                                                value={formData.whenWouldYouBook}
                                                onChange={(selectedOption: any) => {
                                                    handleSelectChangeWithTracking(selectedOption, "whenWouldYouBook");
                                                }}
                                                onFocus={handleFieldFocus}
                                                placeholder="Pick one"
                                                containerStyle={{
                                                    border: "none",
                                                    height: "48px",
                                                    minHeight: "48px",
                                                }}
                                                styles={selectStyles}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className={styles.step2LeftSection}>
                        <div className={styles.step2FormSectionWrapper}>
                            <div className={styles.newFormSection}>
                                <h3 className={styles.newSectionTitle}>🙌 About you</h3>
                                <div className={styles.newSectionFields}>
                                    <div className={styles.newFieldWrapper} data-field-wrapper>
                                        <label className={styles.newFieldLabel}>
                                            Gender <span className={styles.required}>*</span>
                                        </label>
                                        <div className={styles.newSelectFieldWrapper}>
                                            <CustomSelect
                                                options={genderOptions}
                                                value={formData.gender}
                                                onChange={(selectedOption: any) => {
                                                    handleSelectChangeWithTracking(selectedOption, "gender");
                                                    if (validation.errors.gender && clearFieldError) {
                                                        clearFieldError("gender");
                                                    }
                                                }}
                                                onFocus={handleFieldFocus}
                                                placeholder="Pick one"
                                                containerStyle={{
                                                    border: "none",
                                                    height: "480px",
                                                    minHeight: "48px",
                                                    // backgroundColor: "red",
                                                }}
                                                styles={selectStyles}
                                            />
                                        </div>
                                        {validation.errors.gender && (
                                            <div className={styles.errorMessage}>{validation.errors.gender}</div>
                                        )}
                                    </div>

                                    <div className={styles.newFieldWrapper} data-field-wrapper>
                                        <label className={styles.newFieldLabel}>
                                            Date of birth <span className={styles.required}>*</span>
                                        </label>
                                        <div className={styles.newInputField} onFocus={handleFieldFocus}>
                                            <InputField
                                                type="text"
                                                name="dateOfBirth"
                                                value={formData.dateOfBirth}
                                                onChange={handleInputChangeWithTracking}
                                                placeholder="DD - MM - YYYY"
                                                required={false}
                                                onBlur={() => { }}
                                            />
                                        </div>
                                        {validation.errors.dateOfBirth && (
                                            <div className={styles.errorMessage}>{validation.errors.dateOfBirth}</div>
                                        )}
                                    </div>

                                    <div className={styles.newFieldWrapper} data-field-wrapper>
                                        <label className={styles.newFieldLabel}>
                                            Professional Category <span className={styles.required}>*</span>
                                        </label>
                                        <div className={styles.newSelectFieldWrapper}>
                                            {/* @ts-expect-error - CustomSelect is JS component without TS definitions */}
                                            <CustomSelect
                                                options={professionalCategoryOptions}
                                                value={formData.professionalCategory}
                                                onChange={(selectedOption: any) => {
                                                    handleSelectChangeWithTracking(selectedOption, "professionalCategory");
                                                    if (validation.errors.professionalCategory && clearFieldError) {
                                                        clearFieldError("professionalCategory");
                                                    }
                                                }}
                                                onFocus={handleFieldFocus}
                                                placeholder="Pick a category"
                                                containerStyle={{
                                                    border: "none",
                                                    height: "48px",
                                                    minHeight: "48px",
                                                }}
                                                styles={selectStyles}
                                            />
                                        </div>
                                        {validation.errors.professionalCategory && (
                                            <div className={styles.errorMessage}>{validation.errors.professionalCategory}</div>
                                        )}
                                    </div>

                                    <div className={styles.newFieldWrapper} data-field-wrapper>
                                        <label className={styles.newFieldLabel}>
                                            Your Designation <span className={styles.required}>*</span>
                                        </label>
                                        <div className={styles.newInputField} onFocus={handleFieldFocus}>
                                            <InputField
                                                type="text"
                                                name="designation"
                                                value={formData.designation || ""}
                                                onChange={handleInputChangeWithTracking}
                                                placeholder="Ex: Designer at Apple"
                                                required={false}
                                                onBlur={() => { }}
                                            />
                                        </div>
                                        {validation.errors.designation && (
                                            <div className={styles.errorMessage}>{validation.errors.designation}</div>
                                        )}
                                    </div>

                                    <div className={styles.newFieldWrapper} data-field-wrapper>
                                        <label className={styles.newFieldLabel}>How did you hear about us?</label>
                                        <div className={styles.newSelectFieldWrapper}>
                                            <CustomSelect
                                                options={howDidYouHearOptions}
                                                value={formData.howDidYouHear}
                                                onChange={(selectedOption: any) => {
                                                    handleSelectChangeWithTracking(selectedOption, "howDidYouHear");
                                                }}
                                                onFocus={handleFieldFocus}
                                                placeholder="Pick one"
                                                containerStyle={{
                                                    border: "none",
                                                    height: "48px",
                                                    minHeight: "48px",
                                                }}
                                                styles={selectStyles}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.step2MiddleSectionWrapper}>
                            <div className={styles.newFormSection}>
                                <h3 className={styles.newSectionTitle}>🤩 Vibe check</h3>
                                <div className={styles.newSectionFields}>
                                    <div className={styles.newFieldWrapper} data-field-wrapper>
                                        <label className={styles.newFieldLabel}>
                                            What are you looking for? <span className={styles.required}>*</span>
                                        </label>
                                        <div className={styles.newSelectFieldWrapper}>
                                            {/* @ts-expect-error - CustomSelect is JS component without TS definitions */}
                                            <CustomSelect
                                                options={whatAreYouLookingForOptions}
                                                value={formData.whatAreYouLookingFor && Array.isArray(formData.whatAreYouLookingFor)
                                                    ? formData.whatAreYouLookingFor
                                                    : []}
                                                onChange={(selectedValues: any) => {
                                                    const values = Array.isArray(selectedValues) ? selectedValues : [];
                                                    updateFieldWithTracking("whatAreYouLookingFor", values);
                                                    if (values.length > 0 && validation.errors.whatAreYouLookingFor && clearFieldError) {
                                                        clearFieldError("whatAreYouLookingFor");
                                                    }
                                                }}
                                                onFocus={handleFieldFocus}
                                                placeholder="Pick top 3"
                                                multiple={true}
                                                containerStyle={{
                                                    border: "none",
                                                    minHeight: "48px",
                                                }}
                                                styles={{
                                                    ...selectStyles,
                                                    control: (provided: any) => ({
                                                        ...selectStyles.control(provided),
                                                        minHeight: "48px",
                                                        height: "auto",
                                                    }),
                                                    valueContainer: (provided: any) => ({
                                                        ...provided,
                                                        padding: "0 0 0 12px",
                                                        minHeight: "24px",
                                                        height: "auto",
                                                        flexWrap: "wrap",
                                                    }),
                                                    multiValue: (provided: any) => ({
                                                        ...provided,
                                                        backgroundColor: "#FFE9E6",
                                                        borderRadius: "4px",
                                                        margin: "2px",
                                                    }),
                                                    multiValueLabel: (provided: any) => ({
                                                        ...provided,
                                                        fontFamily: '"Hind", sans-serif',
                                                        fontWeight: 500,
                                                        fontSize: "14px",
                                                        color: "#FE664E",
                                                        padding: "2px 6px",
                                                    }),
                                                    multiValueRemove: (provided: any) => ({
                                                        ...provided,
                                                        color: "#FE664E",
                                                        ":hover": {
                                                            backgroundColor: "#FFBDB3",
                                                            color: "#FE664E",
                                                        },
                                                    }),
                                                }}
                                            />
                                        </div>
                                        {validation.errors.whatAreYouLookingFor && (
                                            <div className={styles.errorMessage}>{validation.errors.whatAreYouLookingFor}</div>
                                        )}
                                    </div>

                                    <div className={styles.newFieldWrapper} data-field-wrapper>
                                        <label className={styles.newFieldLabel}>
                                            One thing that ruins a trip for you? <span className={styles.required}>*</span>
                                        </label>
                                        <div className={styles.newSelectFieldWrapper}>
                                            {/* @ts-expect-error - CustomSelect is JS component without TS definitions */}
                                            <CustomSelect
                                                options={oneThingRuinsTripOptions}
                                                value={formData.oneThingRuinsTrip}
                                                onChange={(selectedOption: any) => {
                                                    handleSelectChangeWithTracking(selectedOption, "oneThingRuinsTrip");
                                                    if (validation.errors.oneThingRuinsTrip && clearFieldError) {
                                                        clearFieldError("oneThingRuinsTrip");
                                                    }
                                                }}
                                                onFocus={handleFieldFocus}
                                                placeholder="Pick one"
                                                containerStyle={{
                                                    border: "none",
                                                    height: "48px",
                                                    minHeight: "48px",
                                                }}
                                                styles={selectStyles}
                                            />
                                        </div>
                                        {validation.errors.oneThingRuinsTrip && (
                                            <div className={styles.errorMessage}>{validation.errors.oneThingRuinsTrip}</div>
                                        )}
                                    </div>

                                    <div className={styles.newFieldWrapper} data-field-wrapper>
                                        <label className={styles.newFieldLabel}>What are you celebrating?</label>
                                        <div className={styles.newSelectFieldWrapper}>
                                            {/* @ts-expect-error - CustomSelect is JS component without TS definitions */}
                                            <CustomSelect
                                                options={occasionOptions}
                                                value={formData.occasion}
                                                onChange={(selectedOption: any) => {
                                                    handleSelectChangeWithTracking(selectedOption, "occasion");
                                                }}
                                                onFocus={handleFieldFocus}
                                                placeholder="Pick one"
                                                containerStyle={{
                                                    border: "none",
                                                    height: "48px",
                                                    minHeight: "48px",
                                                }}
                                                styles={selectStyles}
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.newFieldWrapper} data-field-wrapper>
                                        <label className={styles.newFieldLabel}>
                                            Instagram handle or Linkedin profile url <span className={styles.required}>*</span>
                                        </label>
                                        <div className={styles.newInputField} onFocus={handleFieldFocus}>
                                            <InputField
                                                type="text"
                                                name="instagramProfile"
                                                value={formData.instagramProfile || ""}
                                                onChange={handleInputChangeWithTracking}
                                                placeholder="Your handle (or paste the link)"
                                                required={false}
                                                onBlur={() => { }}
                                            />
                                        </div>
                                        {validation.errors.instagramProfile && (
                                            <div className={styles.errorMessage}>{validation.errors.instagramProfile}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.step2BottomSectionWrapper}>
                            <div className={styles.newFormSection}>
                                <h3 className={styles.newSectionTitle}>🙌 Timing & readiness</h3>
                                <div className={styles.newSectionFields}>
                                    <div className={styles.newFieldWrapper} data-field-wrapper>
                                        <label className={styles.newFieldLabel}>Your estimated budget for this trip?</label>
                                        <div className={styles.newSelectFieldWrapper}>
                                            {/* @ts-expect-error - CustomSelect is JS component without TS definitions */}
                                            <CustomSelect
                                                options={budgetRangeOptions}
                                                value={formData.estimatedBudget}
                                                onChange={(selectedOption: any) => {
                                                    handleSelectChangeWithTracking(selectedOption, "estimatedBudget");
                                                }}
                                                onFocus={handleFieldFocus}
                                                placeholder="Select a range"
                                                containerStyle={{
                                                    border: "none",
                                                    height: "48px",
                                                    minHeight: "48px",
                                                }}
                                                styles={selectStyles}
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.newFieldWrapper} data-field-wrapper>
                                        <label className={styles.newFieldLabel}>If invited, when would you book?</label>
                                        <div className={styles.newSelectFieldWrapper}>
                                            {/* @ts-expect-error - CustomSelect is JS component without TS definitions */}
                                            <CustomSelect
                                                options={whenWouldYouBookOptions}
                                                value={formData.whenWouldYouBook}
                                                onChange={(selectedOption: any) => {
                                                    handleSelectChangeWithTracking(selectedOption, "whenWouldYouBook");
                                                }}
                                                onFocus={handleFieldFocus}
                                                placeholder="Pick one"
                                                containerStyle={{
                                                    border: "none",
                                                    height: "48px",
                                                    minHeight: "48px",
                                                }}
                                                styles={selectStyles}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.step2ButtonSection}>
                {isMobile && <div className={styles.newDivider} style={{ marginBottom: '24px' }} />}
                {!isMobile && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', width: '100%', alignItems: 'center' }}>
                            <button
                                onClick={onSubmit}
                                disabled={isSubmitting}
                                className={styles.newContinueButton}
                                style={{ width: '100%', maxWidth: '342px' }}
                            >
                                {isSubmitting && <div className={styles.spinner} />}
                                Submit application
                            </button>
                        </div>
                    </div>
                )}
                {isMobile && (
                    <button
                        onClick={onSubmit}
                        disabled={isSubmitting}
                        className={styles.newContinueButton}
                    >
                        {isSubmitting && <div className={styles.spinner} />}
                        Submit application
                    </button>
                )}
            </div>
        </div>
    );
};

export default Step2;


