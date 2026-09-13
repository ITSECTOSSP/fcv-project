import { Center, Loader } from "@mantine/core";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/api/auth/use-auth";

export default function AuthGuard() {
    const {
        isAuthenticated,
        isCheckingAuth,
    } = useAuth();

    if (isCheckingAuth) {
        return (
            <Center h="100vh">
                <Loader
                    size="md"
                    color="var(--accent)"
                />
            </Center>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}