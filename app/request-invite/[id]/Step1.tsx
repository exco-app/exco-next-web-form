'use client';

import React, { useState, useEffect } from "react";
import InputField from "../../../src/components/input";
import CustomSelect from "../../../src/components/select";
import { trackStepCompleted } from "../../../src/utils/mixpanel-helpers";
import { getDateRange, getDaysCount, getCountryCodeOptions, EditionData } from "./formUtils";
import styles from './Step1.module.css';

interface FormData {
    countryCode: string;
    phoneNumber: string;
    firstName: string;
    email: string;
}

interface Validation {
    errors: {
        countryCode?: string;
        phoneNumber?: string;
        firstName?: string;
        email?: string;
    };
}


interface Step1Props {
    editionData: EditionData | null;
    formData: FormData;
    validation: Validation;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSelectChange: (name: string) => (value: string) => void;
    clearFieldError?: (fieldName: string) => void;
    isMobile: boolean;
    isSubmitting: boolean;
    onSubmit: () => void;
}

const Step1: React.FC<Step1Props> = ({
    editionData,
    formData,
    validation,
    handleInputChange,
    handleSelectChange,
    isMobile,
    isSubmitting,
    onSubmit,
}) => {
    const countryCodeOptions = getCountryCodeOptions();

    // Enhanced input change handler with tracking
    const handleInputChangeWithTracking = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fieldName = e.target.name;
        const fieldValue = e.target.value;

        // Call the original handler
        handleInputChange(e);

        // Track field completion if value is not empty
        if (fieldValue && fieldValue.trim() !== '' && editionData) {
            trackStepCompleted(`Step1_${fieldName}`, { [fieldName]: fieldValue }, editionData);
        }
    };

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
        <div className={styles.step1Container}>
            <div className={`${styles.step1Header} ${isMobile ? styles.step1HeaderMobile : ''}`}>
                <div className={styles.newStepHeaderContent}>
                    <h1 className={styles.newStepHeaderTitle}>Requesting Invite</h1>
                    <p className={styles.newStepHeaderSubtitle}>Step 1 of 2 • Get Access</p>
                </div>
            </div>

            <div className={styles.step1Content}>
                {isMobile ? (
                    <>
                        <div className={styles.newTripCard}>
                            <div className={styles.newTripImageWrapper}>
                                {editionData?.hero_image && (
                                    <img src={editionData.hero_image} alt={editionData.name} />
                                )}
                            </div>
                            <div className={styles.newTripInfo}>
                                <h2 className={styles.newTripTitle}>{editionData?.name || "F1 Monaco Grand Prix"}</h2>
                                <p className={styles.newTripMeta}>
                                    {getDateRange(editionData || undefined)} • {getDaysCount(editionData || undefined)} Days • {editionData?.project_name || "Srishti Tehri"}
                                </p>
                            </div>
                            <div className={styles.newAvatarGroup}>
                                {(() => {
                                    const profileImages = editionData?.profile_images || [];
                                    const maxVisible = 6;
                                    const visibleImages = profileImages.slice(0, maxVisible);
                                    const remainingCount = profileImages.length - maxVisible;
                                    const countLeftPosition = `${(visibleImages.length * 28) - 11}px`;

                                    return (
                                        <>
                                            {visibleImages.map((imageUrl, index) => (
                                                <div key={`avatar-${index}-${imageUrl}`} className={styles.newAvatar} style={{ marginLeft: index > 0 ? '-8px' : '0' }}>
                                                    <img
                                                        src={imageUrl}
                                                        alt={`Profile ${index + 1}`}
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.style.display = 'none';
                                                            if (target.parentElement) {
                                                                target.parentElement.style.backgroundColor = '#f0f0f0';
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                            {remainingCount > 0 && (
                                                <div className={styles.newAvatarCount} style={{ left: countLeftPosition }}>
                                                    +{remainingCount}
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                        <div className={styles.newDivider} />

                        <div className={styles.step1FormSection}>
                            <h3 className={styles.newSectionTitle}>👋 Tell us about yourself</h3>
                            <div className={styles.newSectionFields}>
                                <div className={styles.newFieldWrapper} data-field-wrapper>
                                    <label className={styles.newFieldLabel}>
                                        Phone <span className="required"></span>
                                    </label>
                                    <div className={styles.newPhoneInputGroup}>
                                        <div className={styles.newCountryCodeField}>
                                            <InputField
                                                type="tel"
                                                name="countryCode"
                                                value={formData.countryCode}
                                                onChange={handleInputChangeWithTracking}
                                                onFocus={handleFieldFocus}
                                                placeholder="+91"
                                                required={false}
                                                style={{ border: 'none', padding: 0, height: '100%' }}
                                            />
                                        </div>
                                        <div className={styles.newPhoneNumberField} onFocus={handleFieldFocus}>
                                            <InputField
                                                label=""
                                                type="text"
                                                name="phoneNumber"
                                                value={formData.phoneNumber}
                                                onChange={handleInputChangeWithTracking}
                                                placeholder="Your phone number"
                                                required={false}
                                                onBlur={() => { }}
                                            />
                                        </div>
                                    </div>
                                    {validation.errors.countryCode && (
                                        <div className={styles.errorMessage}>{validation.errors.countryCode}</div>
                                    )}
                                    {validation.errors.phoneNumber && (
                                        <div className={styles.errorMessage}>{validation.errors.phoneNumber}</div>
                                    )}
                                </div>

                                <div className={styles.newFieldWrapper} data-field-wrapper>
                                    <label className={styles.newFieldLabel}>
                                        Your Name <span className="required">*</span>
                                    </label>
                                    <div className={styles.newInputField} onFocus={handleFieldFocus}>
                                        <InputField
                                            label=""
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChangeWithTracking}
                                            placeholder="Enter your full name"
                                            required={false}
                                            onBlur={() => { }}
                                        />
                                    </div>
                                    {validation.errors.firstName && (
                                        <div className={styles.errorMessage}>{validation.errors.firstName}</div>
                                    )}
                                </div>

                                <div className={styles.newFieldWrapper} data-field-wrapper style={{ marginBottom: '24px' }}>
                                    <label className={styles.newFieldLabel}>
                                        Email <span className="required">*</span>
                                    </label>
                                    <div className={styles.newInputField} onFocus={handleFieldFocus}>
                                        <InputField
                                            label=""
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChangeWithTracking}
                                            placeholder="Enter your email"
                                            required={false}
                                            onBlur={() => { }}
                                        />
                                    </div>
                                    {validation.errors.email && (
                                        <div className={styles.errorMessage}>{validation.errors.email}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className={styles.step1LeftSection}>
                        <div className={styles.step1TripCardWrapper}>
                            <div className={styles.newTripCard}>
                                <div className={styles.newTripImageWrapper}>
                                    {editionData?.hero_image && (
                                        <img src={editionData.hero_image} alt={editionData.name} />
                                    )}
                                </div>
                                <div className={styles.newTripInfo}>
                                    <h2 className={styles.newTripTitle}>{editionData?.name || "F1 Monaco Grand Prix"}</h2>
                                    <p className={styles.newTripMeta}>
                                        {getDateRange(editionData || undefined)} • {getDaysCount(editionData || undefined)} Days • {editionData?.project_name || "Srishti Tehri"}
                                    </p>
                                </div>
                                <div className={styles.newAvatarGroup}>
                                    {(() => {
                                        const profileImages = editionData?.profile_images || [];
                                        const maxVisible = 6;
                                        const visibleImages = profileImages.slice(0, maxVisible);
                                        const remainingCount = profileImages.length - maxVisible;
                                        const countLeftPosition = `${(visibleImages.length * 28) - 11}px`;

                                        return (
                                            <>
                                                {visibleImages.map((imageUrl, index) => (
                                                    <div key={`avatar-${index}-${imageUrl}`} className={styles.newAvatar} style={{ marginLeft: index > 0 ? '-8px' : '0' }}>
                                                        <img
                                                            src={imageUrl}
                                                            alt={`Profile ${index + 1}`}
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.style.display = 'none';
                                                                if (target.parentElement) {
                                                                    target.parentElement.style.backgroundColor = '#f0f0f0';
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                                {remainingCount > 0 && (
                                                    <div className={styles.newAvatarCount} style={{ left: countLeftPosition }}>
                                                        +{remainingCount}
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>

                        <div className={styles.step1FormSection}>
                            <h3 className={styles.newSectionTitle}>👋 Tell us about yourself</h3>
                            <div className={styles.newSectionFields}>
                                <div className={styles.newFieldWrapper} data-field-wrapper>
                                    <label className={styles.newFieldLabel}>
                                        Phone <span className="required"></span>
                                    </label>
                                    <div className={styles.newPhoneInputGroup}>
                                        <div className={styles.newCountryCodeField}>
                                            {/* @ts-expect-error - CustomSelect is JS component without TS definitions */}
                                            <InputField
                                                type="tel"
                                                name="countryCode"
                                                value={formData.countryCode}
                                                onChange={handleInputChangeWithTracking}
                                                onFocus={handleFieldFocus}
                                                placeholder="+91"
                                                required={false}
                                                style={{ border: 'none', padding: 0, height: '100%' }}
                                            />
                                        </div>
                                        <div className={styles.newPhoneNumberField} onFocus={handleFieldFocus}>
                                            <InputField
                                                label=""
                                                type="text"
                                                name="phoneNumber"
                                                value={formData.phoneNumber}
                                                onChange={handleInputChangeWithTracking}
                                                placeholder="Your phone number"
                                                required={false}
                                                onBlur={() => { }}
                                            />
                                        </div>
                                    </div>
                                    {validation.errors.countryCode && (
                                        <div className={styles.errorMessage}>{validation.errors.countryCode}</div>
                                    )}
                                    {validation.errors.phoneNumber && (
                                        <div className={styles.errorMessage}>{validation.errors.phoneNumber}</div>
                                    )}
                                </div>

                                <div className={styles.newFieldWrapper} data-field-wrapper>
                                    <label className={styles.newFieldLabel}>
                                        Your Name <span className="required"></span>
                                    </label>
                                    <div className={styles.newInputField} onFocus={handleFieldFocus}>
                                        <InputField
                                            label=""
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChangeWithTracking}
                                            placeholder="Enter your full name"
                                            required={false}
                                            onBlur={() => { }}
                                        />
                                    </div>
                                    {validation.errors.firstName && (
                                        <div className={styles.errorMessage}>{validation.errors.firstName}</div>
                                    )}
                                </div>

                                <div className={styles.newFieldWrapper} data-field-wrapper>
                                    <label className={styles.newFieldLabel}>
                                        Email <span className="required"></span>
                                    </label>
                                    <div className={styles.newInputField} onFocus={handleFieldFocus}>
                                        <InputField
                                            label=""
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChangeWithTracking}
                                            placeholder="Enter your email"
                                            required={false}
                                            onBlur={() => { }}
                                        />
                                    </div>
                                    {validation.errors.email && (
                                        <div className={styles.errorMessage}>{validation.errors.email}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.step1ButtonSection}>
                {isMobile && <div className={styles.newDivider} style={{ marginBottom: '24px' }} />}
                {!isMobile && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', width: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', width: '100%', alignItems: 'center' }}>
                            <button
                                onClick={onSubmit}
                                disabled={isSubmitting}
                                className={styles.newContinueButton}
                                style={{ width: '346px' }}
                            >
                                {isSubmitting && <div className={styles.spinner} />}
                                Request my Invite
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
                        Continue to last step →
                    </button>
                )}
            </div>
        </div>
    );
};

export default Step1;

