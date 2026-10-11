import { useEffect } from "react";
import { Center, Loader } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/lib/api/auth/use-auth";

export default function AuthGuard() {
  const { user, isAuthenticated, isCheckingAuth } = useAuth();

  useEffect(() => {
    if (
      isCheckingAuth ||
      !isAuthenticated ||
      !user ||
      sessionStorage.getItem("show_login_notification") !== "1"
    ) {
      return;
    }

    // Consume the flag so the notification appears only once.
    sessionStorage.removeItem("show_login_notification");

    const employee = user.employee;

    const employeeName = employee
      ? [employee.first_name, employee.middle_name, employee.last_name]
          .filter(Boolean)
          .join(" ")
      : null;

    notifications.show({
      title: "Login successful!",
      message: (
        <div>
          <div>
            <strong>Account:</strong> {user.name}
          </div>

          <div>
            <strong>Email:</strong> {user.email}
          </div>

          {employee ? (
            <>
              <div>
                <strong>Employee:</strong> {employeeName}
              </div>

              <div>
                <strong>Section:</strong>{" "}
                {employee.section?.name ?? "Not assigned"}
              </div>

              <div>
                <strong>Division:</strong>{" "}
                {employee.section?.division?.name ?? "Not assigned"}
              </div>
            </>
          ) : (
            <div>No HR-FCV employee is linked to this account.</div>
          )}
        </div>
      ),
      color: "green",
      autoClose: 8000,
      position: "bottom-right",
    });
  }, [isAuthenticated, isCheckingAuth, user]);

  if (isCheckingAuth) {
    return (
      <Center h="100vh">
        <Loader size="md" color="var(--accent)" />
      </Center>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
