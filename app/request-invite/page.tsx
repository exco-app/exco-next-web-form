'use client'; // Required for Next.js App Router if using hooks

// Extend Window interface to include fbEventId
declare global {
    interface Window {
        fbEventId?: string;
    }
}

import React, { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import {
    BHX_ACCESS_TOKEN,
    BUCKETLIST_ACCESS_TOKEN,
    ENDPOINT,
    hashData,
} from "../../src/config/index"; // Adjust path based on your Next.js structure
import CustomSelect from "../../src/components/select"; // Adjust path
import { formatDate, formatDateToReadable } from "../../src/utils/formHelpers"; // Adjust path
import { initializePixel, trackMetaEvent, fbqReady } from "../../src/utils/pixelManager"; // Adjust path
import { v4 as uuidv4 } from 'uuid';
import styles from '../HomePage.module.css'; // CSS Module

// Simple pixel hook for home page
function useHomePagePixel() {
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const project = searchParams.get("project");
        if (project && project.toLowerCase() === "bhx") {
            initializePixel("630019181040627", "bhx").catch(err =>
                console.error('[Pixel] Failed to initialize:', err)
            );
        } else if (project && project.toLowerCase() === "bucketlist") {
            initializePixel("751008092884896", "bucketlist").catch(err =>
                console.error('[Pixel] Failed to initialize:', err)
            );
        }
    }, []);

    return {};
}

const formatDateRange = (start: string | Date, end: string | Date) => {
    const options: Intl.DateTimeFormatOptions = {
        month: "long",
        day: "numeric",
        year: "numeric"
    };
    const startDate = new Date(start).toLocaleDateString("en-US", options);
    const endDate = new Date(end).toLocaleDateString("en-US", options);

    const startYear = new Date(start).getFullYear();
    const endYear = new Date(end).getFullYear();

    return startYear === endYear
        ? `${startDate.split(", ")[0]} - ${endDate}`
        : `${startDate} - ${endDate}`;
};

// Functional Component
const HomePage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [editionLoading, setEditionLoading] = useState(false);
    const [editionsList, setEditionList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
    const [formData, setFormData] = useState({
        edition: "",
    });
    const [editionData, setEditionData] = useState([]);
    const [page, setPage] = useState(1);
    const [ip, setIp] = useState(null);

    const project = searchParams?.get("project") || null;
    const otherParams = {};

    // Build otherParams from searchParams
    if (searchParams) {
        searchParams.forEach((value: string, key: string) => {
            if (key !== "project") {
                (otherParams as Record<string, string>)[key] = value;
            }
        });
    }

    // Use the stable eventId from sessionStorage
    const eventId: string = useRef(
        typeof window !== 'undefined'
            ? (sessionStorage.getItem('fbEventId') || window.fbEventId || uuidv4())
            : uuidv4()
    ).current;

    // Initialize pixel based on URL parameters

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 700);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    useEffect(() => {
        if (project) {
            getEditions(project);
        } else {
            getEditions(null);
        }
    }, [debouncedSearchTerm, page]);

    useEffect(() => {
        getClientIp();
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const stableEventId = sessionStorage.getItem('fbEventId') || window.fbEventId;
        fbqReady
            .then(() => trackMetaEvent('PageView', {}, stableEventId))
            .catch(() => console.warn('PageView skipped—fbq never loaded'));
    }, []);

    const sendUtmData = async () => {
        try {
            const response = await fetch(`${ENDPOINT}/api/utmdata`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(otherParams),
            });
            const data = await response.json();
            const newUrl = project
                ? `${window.location.pathname}?project=${project}`
                : window.location.pathname;
            window.history.replaceState(null, "", newUrl);
        } catch (error) {
            console.error("Error sending UTM data:", error);
        }
    };

    const getClientIp = async () => {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        setIp(data.ip);
    };

    const getEditions = async (project: string | null) => {
        setEditionLoading(true);
        console.log("project", project);
        try {
            const limitNew = debouncedSearchTerm ? 0 : 100;
            const offset = debouncedSearchTerm ? 0 : (page - 1) * 100;

            let url = `${ENDPOINT}/api/editions/editions-select/?limit=${limitNew}&offset=${offset}&is_web=1&search=${debouncedSearchTerm}`;

            if (project) {
                url += `&project_name=${project.toUpperCase()}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            setEditionLoading(false);

            const newOptions = data?.data?.map((item) => ({
                value: item.id,
                label: item.name,
                date: formatDateRange(item.start_date, item.end_date),
            }));

            setEditionList((prevOptions) => {
                const combined = [
                    ...(debouncedSearchTerm ? [] : prevOptions),
                    ...newOptions,
                ];
                const uniqueOptions = Array.from(
                    new Set(combined.map((opt) => opt.value))
                ).map((id) => combined.find((opt) => opt.value === id));

                return uniqueOptions;
            });
        } catch (error) {
            toast.error(error.message);
            setEditionLoading(false);
            console.error("Error fetching data:", error);
        }
    };

    const getEditionData = async (id) => {
        try {
            const response = await fetch(
                `${ENDPOINT}/customer/api/editions/web/get-edition/?edition=${id}`
            );
            const data = await response.json();

            setEditionData(data);
        } catch (error) {
            toast.error(error.message);
            console.error("Error fetching data:", error);
        }
    };

    const handleNavigate = () => {
        if (typeof window === 'undefined') return;

        const currentParams = new URLSearchParams(window.location.search);
        currentParams.delete('eventId');

        const base = `/request-invite/${editionData?.id}`;
        const paramString = currentParams.toString();
        const url = paramString
            ? `${base}?${paramString}&eventId=${eventId}`
            : `${base}?eventId=${eventId}`;

        router.push(url);
    };

    return (
        <div>
            <div className="d-flex flex-column flex-root app-root" id="kt_app_root">
                <div
                    className="app-page flex-column flex-column-fluid"
                    id="kt_app_page"
                >
                    <div id="kt_app_header" className="app-header">
                        <div
                            className="app-container container-xxl d-flex align-items-stretch justify-content-center"
                            id="kt_app_header_container"
                        >
                            <div className="d-flex justify-content-center align-items-center flex-grow-1 flex-lg-grow-1 ">
                                <a
                                    href="https://theexperience.co"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: "#5F2C41", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: "bold", fontSize: "20px" }}
                                >
                                    the experience co.
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className={styles.wrapper}>
                        <div className={styles.contentContainer}>
                            <div className="container">
                                <div className="row justify-content-center">
                                    <div className="col-lg-10 col-md-12">
                                        <div className="text-center flex justify-content-center" style={{ marginBottom: "24px" }}>
                                            <img src="/Logo.svg" alt="Logo" width={80} height={80} />
                                        </div>

                                        <h1 className={styles.headline}>Choose Your Edition to Get Started</h1>

                                        <p className={styles.subtext}>
                                            Find your edition from the list below or start typing to
                                            search.
                                        </p>

                                        <div className="row justify-content-center">
                                            <div className="col-md-8">
                                                <div className={styles.selectionContainer}>
                                                    <CustomSelect
                                                        label="Edition"
                                                        placeholder="Find your experience..."
                                                        value={formData.edition}
                                                        onChange={(value) => {
                                                            getEditionData(value);
                                                        }}
                                                        searchable={true}
                                                        options={editionsList}
                                                        onInputChange={(e) => {
                                                            setSearchTerm(e);
                                                        }}
                                                        loading={editionLoading}
                                                        customLable={true}
                                                        onMenuScrollToBottom={(e) => {
                                                            if (!editionLoading) {
                                                                setPage((prevState) => prevState + 1);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-center mb-10">
                                            <button
                                                className={styles.actionButton}
                                                title={`${editionData?.id ? "" : "Please select edition to continue"}`}
                                                onClick={handleNavigate}
                                                disabled={!editionData?.id}
                                            >
                                                Let's Go →
                                            </button>
                                        </div>

                                        {editionData?.id && (
                                            <div className="row justify-content-center">
                                                <div className="col-lg-8 col-md-10 col-sm-12">
                                                    <div
                                                        style={{
                                                            display: editionData?.id ? "block" : "none",
                                                        }}
                                                    ></div>
                                                    <div className={`${styles.editionCard} bg-white p-0 mb-4`}>
                                                        <div className="card shadow-sm p-8 bg-light">
                                                            <h5 className="fw-bolder fs-2 mb-7 text-primary">
                                                                Your experience
                                                            </h5>
                                                            <h6 className="text-primary fw-bolder mb-4">
                                                                About your edition
                                                            </h6>
                                                            <p className="text-secondary fw-semibold mb-4">
                                                                {editionData?.description}
                                                            </p>
                                                            <div className="d-flex justify-content-start align-items-center mt-4">
                                                                <div className="text-center">
                                                                    <div className="badge bg-white p-4">
                                                                        {editionData?.start_date
                                                                            ? formatDateToReadable(editionData?.start_date)
                                                                            : "-"}
                                                                    </div>
                                                                </div>
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    width="28"
                                                                    height="28"
                                                                    viewBox="0 0 28 28"
                                                                    fill="none"
                                                                    className="mx-3"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        clipRule="evenodd"
                                                                        d="M16.2634 14.0004L9.88213 20.3817L11.1196 21.6191L18.7383 14.0004L11.1196 6.3817L9.88213 7.61914L16.2634 14.0004Z"
                                                                        fill="#856471"
                                                                    />
                                                                </svg>
                                                                <div className="text-center">
                                                                    <div className="badge bg-white p-4">
                                                                        {editionData?.end_date
                                                                            ? formatDateToReadable(editionData?.end_date)
                                                                            : "-"}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-primary fw-bold fs-8 mb-5 mt-2">
                                                                <div className="text-primary fw-bold fs-8 mb-5 mt-2">
                                                                    {(() => {
                                                                        const startDate = new Date(
                                                                            editionData?.start_date
                                                                        );
                                                                        const endDate = new Date(
                                                                            editionData?.end_date
                                                                        );

                                                                        const durationInMilliseconds =
                                                                            endDate - startDate;

                                                                        const days =
                                                                            Math.ceil(
                                                                                durationInMilliseconds /
                                                                                (1000 * 60 * 60 * 24)
                                                                            ) + 1;

                                                                        const nights = days - 1;

                                                                        return `${days} days, ${nights} nights`;
                                                                    })()}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h6 className="fw-bold">Inclusions</h6>
                                                                <ul className="list-unstyled">
                                                                    <li className="d-flex align-items-center mb-2">
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            width="18"
                                                                            height="18"
                                                                            viewBox="0 0 18 18"
                                                                            fill="none"
                                                                            className="me-3"
                                                                        >
                                                                            <path
                                                                                d="M9.72333 15.8962C9.48516 15.9199 9.24359 15.932 8.99919 15.932C4.99989 15.932 1.75781 12.6899 1.75781 8.6906C1.75781 4.69129 4.99989 1.44922 8.99919 1.44922C12.9985 1.44922 16.2406 4.69129 16.2406 8.6906C16.2406 8.93499 16.2285 9.17657 16.2048 9.41474"
                                                                                stroke="#5F2C41"
                                                                                strokeWidth="1.08621"
                                                                                strokeLinecap="round"
                                                                            />
                                                                            <path
                                                                                d="M5.73828 12.3097C6.75386 11.2461 8.28812 10.792 9.72104 11.002M10.8037 6.8787C10.8037 7.87852 9.99201 8.68905 8.99075 8.68905C7.98955 8.68905 7.17785 7.87852 7.17785 6.8787C7.17785 5.87888 7.98955 5.06836 8.99075 5.06836C9.99201 5.06836 10.8037 5.87888 10.8037 6.8787Z"
                                                                                stroke="#5F2C41"
                                                                                strokeWidth="1.08621"
                                                                                strokeLinecap="round"
                                                                            />
                                                                            <path
                                                                                d="M13.7064 15.9303C15.1061 15.9303 16.2408 14.7956 16.2408 13.3958C16.2408 11.9961 15.1061 10.8613 13.7064 10.8613C12.3066 10.8613 11.1719 11.9961 11.1719 13.3958C11.1719 14.7956 12.3066 15.9303 13.7064 15.9303Z"
                                                                                stroke="#5F2C41"
                                                                                strokeWidth="1.08621"
                                                                            />
                                                                        </svg>
                                                                        <span className="text-primary fw-semibold">
                                                                            Once-in-a-lifetime experience
                                                                        </span>
                                                                    </li>
                                                                    <li className="d-flex align-items-center mb-2">
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            width="18"
                                                                            height="19"
                                                                            viewBox="0 0 18 19"
                                                                            fill="none"
                                                                            className="me-3"
                                                                        >
                                                                            <path
                                                                                d="M16.2406 6.66602C16.2406 6.66602 13.344 11.0108 8.99919 11.0108C4.65436 11.0108 1.75781 6.66602 1.75781 6.66602"
                                                                                stroke="#5F2C41"
                                                                                strokeWidth="1.08621"
                                                                                strokeLinecap="round"
                                                                            />
                                                                            <path
                                                                                d="M11.1719 10.6484L12.2581 12.4588"
                                                                                stroke="#5F2C41"
                                                                                strokeWidth="1.08621"
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                            />
                                                                            <path
                                                                                d="M14.793 8.83789L16.2412 10.2862"
                                                                                stroke="#5F2C41"
                                                                                strokeWidth="1.08621"
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                            />
                                                                            <path
                                                                                d="M1.75781 10.2862L3.20609 8.83789"
                                                                                stroke="#5F2C41"
                                                                                strokeWidth="1.08621"
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                            />
                                                                            <path
                                                                                d="M6.82449 10.6484L5.73828 12.4588"
                                                                                stroke="#5F2C41"
                                                                                strokeWidth="1.08621"
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                            />
                                                                        </svg>
                                                                        <span className="text-primary fw-semibold">
                                                                            Facilitated by founding team
                                                                        </span>
                                                                    </li>
                                                                    <li className="d-flex align-items-center mb-2">
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            width="15"
                                                                            height="13"
                                                                            viewBox="0 0 15 13"
                                                                            fill="none"
                                                                            className="me-3"
                                                                        >
                                                                            <path
                                                                                d="M0.0673574 11.4479V5.93043C0.0673574 5.74096 0.108559 5.55704 0.190963 5.37868C0.274 5.20091 0.384611 5.04828 0.522796 4.9208L3.74034 1.95243C3.89374 1.81091 4.06489 1.7077 4.25378 1.64278C4.44331 1.57729 4.63252 1.54454 4.82141 1.54454C5.01031 1.54454 5.1992 1.57729 5.3881 1.64278C5.57699 1.70828 5.74814 1.8115 5.90154 1.95243L9.12003 4.92167C9.25758 5.04857 9.36788 5.2012 9.45091 5.37956C9.53395 5.55792 9.57515 5.74154 9.57452 5.93043V11.4479C9.57452 11.8408 9.42524 12.1753 9.12669 12.4514C8.82687 12.7274 8.46429 12.8654 8.03896 12.8654H1.60292C1.17759 12.8654 0.815329 12.7274 0.51614 12.4514C0.216318 12.1753 0.0664062 11.8408 0.0664062 11.4479M1.60292 11.9873H4.08929V10.6382C4.08929 10.457 4.15902 10.2991 4.29847 10.1646C4.43792 10.0301 4.61224 9.96281 4.82141 9.96281C5.01792 9.96281 5.18874 10.0301 5.3339 10.1646C5.47906 10.2991 5.55195 10.457 5.55259 10.6382V11.9873H8.03896C8.21011 11.9873 8.35051 11.9368 8.46017 11.8356C8.56983 11.7344 8.62466 11.6052 8.62466 11.4479V5.91288C8.62466 5.84563 8.6123 5.78101 8.58758 5.71903C8.56349 5.65704 8.52102 5.59798 8.46017 5.54184L5.24167 2.57259C5.13201 2.47143 4.99193 2.42084 4.82141 2.42084C4.65027 2.42084 4.50987 2.47143 4.4002 2.57259L1.18266 5.54184C1.12181 5.59798 1.07902 5.65704 1.0543 5.71903C1.02958 5.78101 1.01722 5.84563 1.01722 5.91288V11.4479C1.01722 11.6052 1.07236 11.7344 1.18266 11.8356C1.29169 11.9368 1.43177 11.9873 1.60292 11.9873ZM11.111 12.4435V4.97167C11.111 4.90442 11.0987 4.8398 11.0739 4.77782C11.0492 4.71583 11.0068 4.65677 10.9465 4.60063L7.80696 1.70419C7.6523 1.5615 7.61426 1.40098 7.69286 1.22262C7.77273 1.04426 7.92296 0.955078 8.14355 0.955078C8.20947 0.955078 8.27222 0.966774 8.33181 0.990165C8.39139 1.01356 8.44274 1.04455 8.48584 1.08315L11.6064 3.96292C11.7446 4.08982 11.8549 4.24245 11.9373 4.4208C12.0197 4.59916 12.0612 4.78279 12.0618 4.97167V12.4426C12.0618 12.5677 12.0165 12.6721 11.9259 12.7557C11.8352 12.8394 11.7221 12.8812 11.5864 12.8812C11.4508 12.8812 11.3376 12.8394 11.247 12.7557C11.1564 12.6721 11.111 12.5677 11.111 12.4426M13.5974 12.4426V4.01379C13.5974 3.94654 13.5854 3.88222 13.5613 3.82082C13.5372 3.75941 13.4944 3.70006 13.4329 3.64275L11.3506 1.72173C11.196 1.57904 11.1579 1.4156 11.2365 1.23139C11.3151 1.04718 11.4654 0.95537 11.6872 0.955955C11.7531 0.955955 11.8159 0.967651 11.8755 0.991043C11.9351 1.01385 11.9864 1.04484 12.0295 1.08402L14.1118 3.00504C14.2493 3.13252 14.3565 3.28545 14.4332 3.4638C14.5099 3.64216 14.5485 3.82549 14.5492 4.01379V12.4435C14.5492 12.5686 14.5035 12.673 14.4122 12.7566C14.3216 12.8402 14.2088 12.8821 14.0738 12.8821C13.9381 12.8821 13.825 12.8402 13.7343 12.7566C13.6437 12.673 13.598 12.5686 13.5974 12.4435M1.60292 11.9873H8.62466H1.01817H1.60292ZM4.82141 7.3997C4.62491 7.3997 4.45377 7.33245 4.30798 7.19795C4.16218 7.06345 4.08929 6.90556 4.08929 6.72427C4.08929 6.54299 4.16218 6.3851 4.30798 6.2506C4.45377 6.1161 4.62491 6.04885 4.82141 6.04885C5.01792 6.04885 5.18874 6.1161 5.3339 6.2506C5.47906 6.3851 5.55195 6.54299 5.55259 6.72427C5.55322 6.90556 5.48033 7.06345 5.3339 7.19795C5.18748 7.33245 5.01633 7.3997 4.82046 7.3997"
                                                                                fill="#5F2C41"
                                                                            />
                                                                        </svg>
                                                                        <span className="text-primary fw-semibold">
                                                                            Gorgeous airbnbs, Boutiques & Central Hotels
                                                                        </span>
                                                                    </li>
                                                                    <li className="d-flex align-items-center mb-2">
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            width="18"
                                                                            height="18"
                                                                            viewBox="0 0 18 18"
                                                                            fill="none"
                                                                            className="me-3"
                                                                        >
                                                                            <path
                                                                                d="M11.1705 2.07031L11.5606 3.80214C11.8916 5.27111 13.0387 6.41826 14.5076 6.74916L16.2395 7.13928L14.5076 7.52939C13.0387 7.86029 11.8916 9.00741 11.5606 10.4764L11.1705 12.2082L10.7804 10.4764C10.4495 9.00741 9.3024 7.86029 7.83341 7.52939L6.10156 7.13928L7.83341 6.74916C9.30232 6.41826 10.4495 5.27111 10.7804 3.80215L11.1705 2.07031Z"
                                                                                stroke="#5F2C41"
                                                                                strokeWidth="1.08621"
                                                                                strokeLinejoin="round"
                                                                            />
                                                                            <path
                                                                                d="M5.3785 9.31055L5.65716 10.5476C5.89352 11.5968 6.71291 12.4162 7.76215 12.6526L8.99919 12.9312L7.76215 13.2099C6.71291 13.4462 5.89352 14.2656 5.65716 15.3149L5.3785 16.5519L5.09985 15.3149C4.86349 14.2656 4.0441 13.4462 2.99484 13.2099L1.75781 12.9312L2.99484 12.6526C4.0441 12.4162 4.86349 11.5969 5.09985 10.5476L5.3785 9.31055Z"
                                                                                stroke="#5F2C41"
                                                                                strokeWidth="1.08621"
                                                                                strokeLinejoin="round"
                                                                            />
                                                                        </svg>
                                                                        <span className="text-primary fw-semibold">
                                                                            {`${editionData?.invite_count} curated invitees`}
                                                                        </span>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;

