// This hook tracks visitors by generating a unique visitor ID, storing it in local storage, and sending it to the server along with the current page and referrer information. It ensures that tracking is only initiated once, even in React StrictMode, and handles any errors that may occur during the tracking process.
import { useEffect } from "react";

// Prevent duplicate requests caused by React StrictMode
let visitorTrackingStarted = false;

export function useVisitorTracking() {
    useEffect(() => {
        // Stop duplicate execution immediately
        if (visitorTrackingStarted) {
            console.log("[Visitor] Tracking already started.");
            return;
        }

        // Set this BEFORE making the API request
        visitorTrackingStarted = true;

        const trackVisitor = async () => {
            try {
                let visitorId = localStorage.getItem(
                    "fcv_visitor_id",
                );

                if (!visitorId) {
                    visitorId = crypto.randomUUID();

                    localStorage.setItem(
                        "fcv_visitor_id",
                        visitorId,
                    );
                }

                console.log(
                    "[Visitor] Visitor ID:",
                    visitorId,
                );

                const response = await fetch(
                    "/api/auth/visitor/track",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        body: JSON.stringify({
                            visitor_id: visitorId,
                            page: window.location.pathname,
                            referrer:
                                document.referrer || null,
                        }),
                    },
                );

                console.log(
                    "[Visitor] HTTP Status:",
                    response.status,
                );

                const text = await response.text();

                console.log(
                    "[Visitor] Server Response:",
                    text,
                );

                if (!response.ok) {
                    console.error(
                        "[Visitor] Server returned an error:",
                        response.status,
                        text,
                    );
                }
            } catch (error) {
                console.error(
                    "[Visitor] Tracking failed:",
                    error,
                );
            }
        };

        trackVisitor();
    }, []);
}

