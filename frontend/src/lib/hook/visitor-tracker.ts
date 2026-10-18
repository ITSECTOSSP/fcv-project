import { useEffect } from "react";
import api from "@/lib/api/api";

// Prevent duplicate requests caused by React StrictMode.
let visitorTrackingStarted = false;

export function useVisitorTracking() {
    useEffect(() => {
        if (visitorTrackingStarted) {
            console.log("[Visitor] Tracking already started.");
            return;
        }

        visitorTrackingStarted = true;

        const trackVisitor = async () => {
            try {
                let visitorId = localStorage.getItem("fcv_visitor_id");

                if (!visitorId) {
                    visitorId = crypto.randomUUID();
                    localStorage.setItem("fcv_visitor_id", visitorId);
                }

                console.log("[Visitor] Visitor ID:", visitorId);

                const response = await api.post(
                    "/api/auth/visitor/track",
                    {
                        visitor_id: visitorId,
                        page: window.location.pathname,
                        referrer: document.referrer || null,
                    },
                );

                console.log("[Visitor] HTTP Status:", response.status);
                console.log("[Visitor] Server Response:", response.data);
            } catch (error) {
                console.error("[Visitor] Tracking failed:", error);

                // Allow a retry if the request failed.
                visitorTrackingStarted = false;
            }
        };

        void trackVisitor();
    }, []);
}