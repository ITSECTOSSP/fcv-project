import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { echo } from "@/echo";

interface PresenceUser {
  id: string | number;
  name: string;
}

interface OnlineUsersContextType {
  onlineUserIds: Set<string>;
}

const OnlineUsersContext =
  createContext<OnlineUsersContextType | undefined>(undefined);

export function OnlineUsersProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("auth_token")
  );

  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(
    new Set()
  );

  // Detect login/logout in this tab and token changes in other tabs.
  useEffect(() => {
    const syncToken = () => {
      setToken(localStorage.getItem("auth_token"));
    };

    window.addEventListener("auth-token-changed", syncToken);
    window.addEventListener("storage", syncToken);

    return () => {
      window.removeEventListener("auth-token-changed", syncToken);
      window.removeEventListener("storage", syncToken);
    };
  }, []);

  // Maintain one Reverb presence subscription for the entire app.
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

        setOnlineUserIds(
          new Set(users.map((user) => String(user.id)))
        );
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

  return (
    <OnlineUsersContext.Provider value={{ onlineUserIds }}>
      {children}
    </OnlineUsersContext.Provider>
  );
}

export function useOnlineUsers() {
  const context = useContext(OnlineUsersContext);

  if (!context) {
    throw new Error(
      "useOnlineUsers must be used within OnlineUsersProvider"
    );
  }

  return context;
}