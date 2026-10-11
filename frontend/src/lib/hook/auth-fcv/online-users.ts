import { useEffect, useState } from "react";
import { echo } from "@/echo";

interface PresenceUser {
  id: string | number;
  name: string;
}

const AUTH_TOKEN_CHANGED = "auth-token-changed";

export function useOnlineUsers() {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("auth_token"),
  );

  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  // Detect login/logout in the current tab and token changes
  // from another tab.
  useEffect(() => {
    const syncToken = () => {
      setToken(localStorage.getItem("auth_token"));
    };

    window.addEventListener(AUTH_TOKEN_CHANGED, syncToken);
    window.addEventListener("storage", syncToken);

    return () => {
      window.removeEventListener(AUTH_TOKEN_CHANGED, syncToken);
      window.removeEventListener("storage", syncToken);
    };
  }, []);

  // Subscribe only while authenticated.
  useEffect(() => {
    if (!token) {
      setOnlineUserIds(new Set());
      return;
    }

    let isMounted = true;

    const channel = echo.join("user-status");

    channel
      .here((users: PresenceUser[]) => {
        if (!isMounted) return;

        setOnlineUserIds(new Set(users.map((user) => String(user.id))));
      })
      .joining((user: PresenceUser) => {
        if (!isMounted) return;

        setOnlineUserIds((previous) => {
          const next = new Set(previous);
          next.add(String(user.id));
          return next;
        });
      })
      .leaving((user: PresenceUser) => {
        if (!isMounted) return;

        setOnlineUserIds((previous) => {
          const next = new Set(previous);
          next.delete(String(user.id));
          return next;
        });
      });

    return () => {
      isMounted = false;
      echo.leave("user-status");
    };
  }, [token]);

  return { onlineUserIds };
}
