import { ActionIcon, Tooltip } from "@mantine/core";
import { SunMoonIcon } from "lucide-animated";
import { useMantineColorScheme } from "@mantine/core";

export default function ThemeToggle() {
    const {
        colorScheme,
        setColorScheme,
    } = useMantineColorScheme();

    const isDark = colorScheme === "dark";

    const toggleTheme = () => {
        setColorScheme(isDark ? "light" : "dark");
    };

    return (
        <Tooltip
            label={
                isDark
                    ? "Switch to light mode"
                    : "Switch to dark mode"
            }
        >
            <ActionIcon
                variant="subtle"
                size="lg"
                radius="md"
                onClick={toggleTheme}
                aria-label={
                    isDark
                        ? "Switch to light mode"
                        : "Switch to dark mode"
                }
                className="
                    !text-[var(--text)]
                    hover:!bg-[var(--accent-bg)]
                    hover:!text-[var(--accent)]
                "
            >
                <SunMoonIcon
                    size={20}
                    className="!text-current"
                />
            </ActionIcon>
        </Tooltip>
    );
}