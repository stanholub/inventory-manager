import { Alert } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";

export function ErrorBanner({ message }: { message: string }) {
  return (
    <Alert icon={<IconAlertCircle size={16} />} color="red" mb="sm">
      {message}
    </Alert>
  );
}
