import { ReactNode } from "react";
import { Modal as MantineModal } from "@mantine/core";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ title, onClose, children }: ModalProps) {
  return (
    <MantineModal
      opened
      onClose={onClose}
      title={title}
      centered
      size="md"
    >
      {children}
    </MantineModal>
  );
}
