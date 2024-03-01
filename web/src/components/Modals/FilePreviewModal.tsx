import { FC } from "react";
import { IconDownload, IconTrash, IconX } from "@tabler/icons-react";
import { Button, Divider, Modal, ModalContent } from "@nextui-org/react";

import { File } from "@/types";

export const FilePreviewModal: FC<{
  file?: File;
  onClose: () => void;
}> = ({ file, onClose }) => {
  return (
    <Modal size="full" isOpen={file ? true : false} hideCloseButton>
      <ModalContent>
        {file && (
          <div>
            <div className="flex items-center justify-end p-3">
              <div className="flex items-center">
                <Button isIconOnly variant="bordered" onClick={onClose}>
                  <IconX size={18} />
                </Button>
              </div>
            </div>
            <Divider />
            <div className="flex flex-col items-center justify-center gap-5 py-28">
              <div className="flex flex-col gap-5 items-center">
                <p className="text-xl font-medium">{file.name}</p>
                <div className="flex flex-col gap-2 items-center">
                  <Button
                    color="primary"
                    startContent={<IconDownload size={18} />}
                  >
                    Download
                  </Button>
                  <Button
                    variant="light"
                    color="danger"
                    startContent={<IconTrash size={18} />}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
};
