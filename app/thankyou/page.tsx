'use client';

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ENDPOINT } from "../../src/config/index";
import styles from '../ThankyouPage.module.css';

interface EditionData {
    id?: string;
    name?: string;
    start_date?: string;
    end_date?: string;
    duration?: number;
}

const ThankYouPage = () => {
    const searchParams = useSearchParams();
    const [editionData, setEditionData] = useState<EditionData | null>(null);
    const [selectedCallOption, setSelectedCallOption] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
    const [callResponseLoading, setCallResponseLoading] = useState(false);
    const [callResponse, setCallResponse] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        window.history.scrollRestoration = "manual";
        window.scrollTo(0, 0);

        // Get edition data from sessionStorage
        try {
            const editionDataStr = sessionStorage.getItem("editionData");
            if (editionDataStr) {
                const data = JSON.parse(editionDataStr);
                setEditionData(data);
            }
        } catch (e) {
            console.error("Error parsing edition data:", e);
        }
    }, []);

    // Countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    // Get user name from session storage or form data
    const getUserName = () => {
        if (typeof window === 'undefined') return "Jay";

        try {
            const formDataStr = sessionStorage.getItem("formData");
            if (formDataStr) {
                const formData = JSON.parse(formDataStr);
                return formData.firstName || "Jay";
            }
        } catch (e) {
            console.error("Error parsing form data:", e);
        }
        return "Jay";
    };

    // Get trip dates from edition data
    const getTripDates = () => {
        if (editionData?.start_date && editionData?.end_date) {
            const start = new Date(editionData.start_date);
            const end = new Date(editionData.end_date);
            const startDay = start.getDate();
            const endDay = end.getDate();
            const month = start.toLocaleDateString("en-US", { month: "short" });
            const year = start.getFullYear();
            const days = editionData.duration || Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            return `${startDay}-${endDay} ${month} ${year} • ${days} Days • ${editionData.name || ""}`;
        }
        return "12-18 Nov 2025 • 8 Days • Srishti Tehri";
    };

    const handleCallOptionClick = (option: string) => {
        if (typeof window === 'undefined') return;

        setSelectedCallOption(option);
        const token = sessionStorage.getItem("token");
        setCallResponseLoading(true);

        fetch(`${ENDPOINT}/api/call/setup-call/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `token ${token}`,
            },
            body: JSON.stringify({
                call_option: option,
                edition: editionData?.name,
            }),
        })
            .then(response => response.json())
            .then(data => {
                console.log("Call response:", data);
                setCallResponse(data.message);
                setCallResponseLoading(false);
            })
            .catch(error => {
                console.error("Error setting up call:", error);
                setCallResponseLoading(false);
                setCallResponse(null);
            });
    };

    const userName = getUserName();
    const tripDates = getTripDates();
    const tripParts = tripDates.split(" • ");

    return (
        <div className={styles.wrapper}>
            <div className={styles['thank-you-container']}>
                {/* Header */}
                <div className={styles['header-section']}>
                    <div className={styles['header-content']}>
                        <p className={styles['header-title']}>Request submitted</p>
                        <p className={styles['header-subtitle']}>
                            <span>{tripParts[0]} • {tripParts[1]} </span>• {tripParts[2]}
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className={styles['main-content']}>
                    {/* Image and Message Section */}
                    <div className={styles['message-section']}>
                        <div className={styles['message-inner']}>
                            <a className={styles['main-image-link']} href="#">
                                <img
                                    src="/media/thank_you.png"
                                    alt="Experience"
                                    className={styles['main-image']}
                                />
                            </a>
                            <div className={styles['message-content']}>
                                <h1 className={styles['main-heading']}>
                                    🙌 {userName}, your invite is being curated...
                                </h1>
                                <p className={styles['main-description']}>
                                    ...and we get a vibe an adventure is about to begin! Your invite
                                    will be ready in the app within 12 hours
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className={styles.divider} />

                    {/* Wallet Credit Section */}
                    <div className={styles['wallet-section']}>
                        <p className={styles['wallet-text']}>
                            <span className={styles['wallet-text-normal']}>Get</span>
                            <span className={styles['wallet-amount']}> ₹2000</span>
                            <span className={styles['wallet-text-normal']}> in your wallet as soon as your download the app, use it on any experience you want </span>
                            <span className={styles.asterisk}>*</span>
                        </p>

                        <div className={styles['social-proof-box']}>
                            <div className={styles['avatar-group-wrapper']}>
                                <div className={styles['avatar-group']}>
                                    <img src="/media/users.png" alt="Users" style={{ width: '100%', height: '100%' }} />
                                </div>
                            </div>
                            <p className={styles['social-proof-text']}>
                                <span>12 creators, freethinkers & doers </span>
                                <span className={styles['social-proof-bold']}>confirmed their invites</span>
                                <span> on the app in the last 24 hours. Join them.</span>
                            </p>
                        </div>

                        <div className={styles['app-buttons']}>
                            <a
                                href="https://apps.apple.com/in/app/exco-travel-community/id6739699261"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles['app-store-button']}
                            >
                                <img src="/media/Group.png" alt="App Store" />
                            </a>
                            <a
                                href="https://play.google.com/store/apps/details?id=com.bhx.app"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles['google-play-button']}
                            >
                                <img src="/media/googleplay.png" alt="Google Play" />
                            </a>
                        </div>

                        <p className={styles['wallet-disclaimer']}>
                            * wallet credit only if you download the app in next 15 mins.
                        </p>
                    </div>

                    {/* Divider */}
                    <div className={styles.divider} />
                </div>

                {/* Call Scheduling Section */}
                <div className={styles['call-section-wrapper']}>
                    <div className={styles['call-section']}>
                        <div className={styles['call-section-inner']}>
                            <div className={styles['curator-section']}>
                                <div>
                                    <img src="/media/curators.png" alt="Curator" />
                                </div>
                                <div className={styles['call-heading-wrapper']}>
                                    <h2 className={styles['call-heading']}>👋 Got questions? Speak to our curators</h2>
                                </div>
                            </div>

                            <div className={styles['call-options']}>
                                {callResponse ? (
                                    <p className={styles['call-options-title']}>{callResponse}</p>
                                ) : (
                                    <p className={styles['call-options-title']}>Pick an option to confirm </p>
                                )}
                                {callResponseLoading && <div className={styles.spinner} />}
                                <div className={styles['call-options-list']}>
                                    <div
                                        className={`${styles['call-option']} ${selectedCallOption === "Call me asap ⚡" ? styles.selected : ""}`}
                                        onClick={() => handleCallOptionClick("Call me asap ⚡")}
                                    >
                                        <p>Call me asap ⚡</p>
                                    </div>
                                    <div
                                        className={`${styles['call-option']} ${selectedCallOption === "Call me tomorrow in the first half" ? styles.selected : ""}`}
                                        onClick={() => handleCallOptionClick("Call me tomorrow in the first half")}
                                    >
                                        <p>Call me tomorrow in the first half</p>
                                    </div>
                                    <div
                                        className={`${styles['call-option']} ${selectedCallOption === "Call me tomorrow in the second half" ? styles.selected : ""}`}
                                        onClick={() => handleCallOptionClick("Call me tomorrow in the second half")}
                                    >
                                        <p>Call me tomorrow in the second half</p>
                                    </div>
                                    <div
                                        className={`${styles['call-option']} ${selectedCallOption === "This Saturday (10 AM-1 PM)" ? styles.selected : ""}`}
                                        onClick={() => handleCallOptionClick("This Saturday (10 AM-1 PM)")}
                                    >
                                        <p>This Saturday (10 AM-1 PM)</p>
                                    </div>
                                    <div
                                        className={`${styles['call-option']} ${selectedCallOption === "Next week (we'll coordinate)" ? styles.selected : ""}`}
                                        onClick={() => handleCallOptionClick("Next week (we'll coordinate)")}
                                    >
                                        <p>Next week (we'll coordinate)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className={styles.divider} />
                </div>

                {/* Quote and App Download Section */}
                <div className={styles['quote-app-section']}>
                    <div className={styles['quote-section']}>
                        <p className={styles['quote-text']}>
                            Travel is amazing, but traveling with people you vibe with is
                            life-changing!
                        </p>
                        <div className={styles['quote-author']}>
                            <div className={styles['quote-author-inner']}>
                                <div className={styles['quote-avatar']}>
                                    <img src="/media/shelvi.png" alt="Author" />
                                </div>
                                <p className={styles['quote-author-name']}>Shelvi, Author & Entrpreneur, BHX Bali</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles['app-download-section']}>
                        <div className={styles['app-buttons']}>
                            <a
                                href="https://apps.apple.com/in/app/exco-travel-community/id6739699261"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles['app-store-button']}
                            >
                                <img src="/media/Group.png" alt="App Store" />
                            </a>
                            <a
                                href="https://play.google.com/store/apps/details?id=com.bhx.app"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles['google-play-button']}
                            >
                                <img src="/media/googleplay.png" alt="Google Play" />
                            </a>
                        </div>
                        <p className={styles['countdown-text']}>
                            <span>Get ₹2000 wallet credit for the next </span>
                            <span className={styles['countdown-time']}>{formatTime(timeLeft)}</span>
                        </p>
                    </div>

                    {/* Phone Mockup Section */}
                    <div className={styles['phone-mockup-section']}>
                        <div className={styles['phone-screen-wrapper']}>
                            <img
                                src="/media/app_screen.png"
                                alt="App Preview"
                                className={styles['phone-screen']}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ThankYouPageWithSuspense = () => {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>}>
            <ThankYouPage />
        </Suspense>
    );
};

export default ThankYouPageWithSuspense;
