import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

const apiUrl = import.meta.env.VITE_API_URL.replace(/\/+$/, "");
const broadcastingAuthUrl = `${apiUrl}/api/broadcasting/auth`;

export const echo = new Echo({
  broadcaster: "reverb",
  key: import.meta.env.VITE_REVERB_APP_KEY,

  wsHost: import.meta.env.VITE_REVERB_HOST,
  wsPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8081),
  wssPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8081),

  forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? "http") === "https",
  enabledTransports: ["ws", "wss"],

  authEndpoint: broadcastingAuthUrl,

  authorizer: (channel) => ({
    authorize: (socketId, callback) => {
      const token = localStorage.getItem("auth_token");

      fetch(broadcastingAuthUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: new URLSearchParams({
          socket_id: socketId,
          channel_name: channel.name,
        }),
      })
        .then(async (response) => {
          if (!response.ok) {
            const details = await response.text();
            throw new Error(
              `Broadcast authorization failed: ${response.status} ${details}`,
            );
          }

          return response.json();
        })
        .then((data) => callback(null, data))
        .catch((error) => callback(error, null));
    },
  }),
});
