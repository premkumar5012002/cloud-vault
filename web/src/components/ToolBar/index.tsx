import { FC } from "react";
import { useDisclosure } from "@nextui-org/react";

import { Page } from "@/types";

import { NewFolderModal } from "@/components/Modals/NewFolderModal";
import { EmptyTrashModal } from "@/components/Modals/EmptyTrashModal";
import { DesktopToolBar } from "@/components/ToolBar/Desktop";
import { MobileToolBar } from "@/components/ToolBar/Mobile";

export const ToolBar: FC<{ page: Page; folderId?: string }> = ({
  page,
  folderId,
}) => {
  const {
    isOpen: isNewFolderModalOpen,
    onOpenChange: onNewFolderModalOpenChange,
  } = useDisclosure();

  const {
    isOpen: isEmptyTrashModalOpen,
    onOpenChange: onEmptyTrashModalOpenChange,
  } = useDisclosure();

  return (
    <>
      <DesktopToolBar
        page={page}
        onNewFolder={onNewFolderModalOpenChange}
        onEmptyTrash={onEmptyTrashModalOpenChange}
      />
      <MobileToolBar
        page={page}
        onNewFolder={onNewFolderModalOpenChange}
        onEmptyTrash={onEmptyTrashModalOpenChange}
      />
      {/* Modals */}
      <NewFolderModal
        folderId={folderId}
        isOpen={isNewFolderModalOpen}
        onOpenChange={onNewFolderModalOpenChange}
      />
      <EmptyTrashModal
        isOpen={isEmptyTrashModalOpen}
        onOpenChange={onEmptyTrashModalOpenChange}
      />
    </>
  );
};
