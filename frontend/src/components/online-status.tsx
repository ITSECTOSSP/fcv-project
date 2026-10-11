import { useOnlineUsers } from "@/lib/hook/auth-fcv/online-users";

export default function OnlineUsersListener() {
  useOnlineUsers();

  return null;
}