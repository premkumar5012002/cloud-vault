import { FC } from "react";
import {
  Modal,
  Button,
  ModalBody,
  ModalHeader,
  ModalFooter,
  ModalContent,
} from "@nextui-org/react";

import { useUploadStore } from "@/store/upload";

export const CancelUploadModal: FC<{
  isOpen: boolean;
  onOpenChange: () => void;
}> = ({ isOpen, onOpenChange }) => {
  const { clear } = useUploadStore();

  const onCancel = () => {
    clear();
    onOpenChange();
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader className="text-xl">Cancel Uploads?</ModalHeader>
        <ModalBody>
          <p className="text-default-500">
            Are you sure you want to cancel the all the uploads.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onOpenChange} color="danger" variant="light">
            Close
          </Button>
          <Button color="primary" onClick={onCancel}>
            Yes, Cancel it
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
