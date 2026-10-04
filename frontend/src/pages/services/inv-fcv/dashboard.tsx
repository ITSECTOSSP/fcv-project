import {
    Boxes,
    ClipboardList,
    FileCheck,
    PackageCheck,
    PackageOpen,
    Tags,
    UserRound,
} from "lucide-react";

import {
    Card,
    Grid,
    Group,
    SimpleGrid,
    Stack,
    Text,
} from "@mantine/core";

export default function InventoryDashboard() {
    return (
        <Stack gap="lg">
            {/* Header */}
            <div>
                <Text size="xl" fw={700}>
                    Inventory Dashboard
                </Text>

                <Text c="dimmed" size="sm">
                    Overview of office equipment and inventory records.
                </Text>
            </div>

            {/* Summary Cards */}
            <SimpleGrid
                cols={{ base: 1, xs: 2, md: 4 }}
                spacing="md"
            >
                <Card withBorder radius="md" p="lg">
                    <Group justify="space-between">
                        <div>
                            <Text size="sm" c="dimmed">
                                Total Equipment
                            </Text>

                            <Text size="xl" fw={700}>
                                0
                            </Text>
                        </div>

                        <Boxes size={28} />
                    </Group>
                </Card>

                <Card withBorder radius="md" p="lg">
                    <Group justify="space-between">
                        <div>
                            <Text size="sm" c="dimmed">
                                Assigned Equipment
                            </Text>

                            <Text size="xl" fw={700}>
                                0
                            </Text>
                        </div>

                        <UserRound size={28} />
                    </Group>
                </Card>

                <Card withBorder radius="md" p="lg">
                    <Group justify="space-between">
                        <div>
                            <Text size="sm" c="dimmed">
                                Unassigned Equipment
                            </Text>

                            <Text size="xl" fw={700}>
                                0
                            </Text>
                        </div>

                        <PackageOpen size={28} />
                    </Group>
                </Card>

                <Card withBorder radius="md" p="lg">
                    <Group justify="space-between">
                        <div>
                            <Text size="sm" c="dimmed">
                                Equipment Types
                            </Text>

                            <Text size="xl" fw={700}>
                                0
                            </Text>
                        </div>

                        <Tags size={28} />
                    </Group>
                </Card>
            </SimpleGrid>

            {/* Main Sections */}
            <Grid>
                <Grid.Col span={{ base: 12, md: 7 }}>
                    <Card withBorder radius="md" p="lg">
                        <Group mb="md">
                            <PackageCheck size={20} />

                            <Text fw={600}>
                                Equipment Overview
                            </Text>
                        </Group>

                        <Text size="sm" c="dimmed">
                            Equipment statistics by type will appear here.
                        </Text>
                    </Card>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 5 }}>
                    <Card withBorder radius="md" p="lg">
                        <Group mb="md">
                            <ClipboardList size={20} />

                            <Text fw={600}>
                                Recent Assignments
                            </Text>
                        </Group>

                        <Text size="sm" c="dimmed">
                            Recently assigned equipment will appear here.
                        </Text>
                    </Card>
                </Grid.Col>

                <Grid.Col span={12}>
                    <Card withBorder radius="md" p="lg">
                        <Group mb="md">
                            <FileCheck size={20} />

                            <Text fw={600}>
                                Recent Inventory Activity
                            </Text>
                        </Group>

                        <Text size="sm" c="dimmed">
                            Recent equipment additions, updates, assignments,
                            and returns will appear here.
                        </Text>
                    </Card>
                </Grid.Col>
            </Grid>
        </Stack>
    );
}