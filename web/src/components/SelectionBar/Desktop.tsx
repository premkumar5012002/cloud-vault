import { FC } from "react";
import {
  IconX,
  IconEdit,
  IconStar,
  IconTrash,
  IconStarOff,
  IconRestore,
  IconDownload,
  IconFolderSymlink,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@nextui-org/react";

import { Page } from "@/types";

import { useSelectionStore } from "@/store/selection";

export const DesktopSelectionBar: FC<{
  page: Page;
  isStarItemsLoading: boolean;
  isUnStarItemsLoading: boolean;
  isRestoreItemsLoading: boolean;
  onTrashItems: () => void;
  onRestoreItems: () => void;
  onRenameItem: () => void;
  onStarItems: () => void;
  onUnStarItems: () => void;
  onMoveItems: () => void;
  onDeleteItems: () => void;
}> = ({
  page,
  isStarItemsLoading,
  isUnStarItemsLoading,
  isRestoreItemsLoading,
  onTrashItems,
  onRestoreItems,
  onRenameItem,
  onStarItems,
  onUnStarItems,
  onMoveItems,
  onDeleteItems,
}) => {
  const selectionBars: React.ReactElement[] = [];

  if (page === "drive" || page === "search") {
    selectionBars.push(
      <TrashButton key="trash" onClick={onTrashItems} />,
      <RenameButton key="rename" onClick={onRenameItem} />,
      <StarButton
        key="star"
        isLoading={isStarItemsLoading}
        onClick={onStarItems}
      />,
      <MoveButton key="move" onClick={onMoveItems} />,
      <DownloadButton key="download" />
    );
  } else if (page === "recent") {
    selectionBars.push(
      <TrashButton key="trash" onClick={onTrashItems} />,
      <RenameButton key="rename" onClick={onRenameItem} />,
      <StarButton
        key="star"
        isLoading={isStarItemsLoading}
        onClick={onStarItems}
      />,
      <MoveButton key="move" onClick={onMoveItems} />,
      <DownloadButton key="download" />
    );
  } else if (page === "starred") {
    selectionBars.push(
      <TrashButton key="trash" onClick={onTrashItems} />,
      <RenameButton key="rename" onClick={onRenameItem} />,
      <UnStarButton
        key="unstar"
        isLoading={isUnStarItemsLoading}
        onClick={onUnStarItems}
      />,
      <MoveButton key="move" onClick={onMoveItems} />,
      <DownloadButton key="download" />
    );
  } else {
    selectionBars.push(
      <RestoreButton
        key="restore"
        isLoading={isRestoreItemsLoading}
        onClick={onRestoreItems}
      />,
      <DeleteButton key="delete" onClick={onDeleteItems} />
    );
  }

  return (
    <div className="hidden md:flex pt-4 sticky items-center justify-between gap-4 px-6">
      <div className="space-x-3">{selectionBars.map((item) => item)}</div>
      <ClearSelection />
    </div>
  );
};

const TrashButton: FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <Button
      variant="bordered"
      startContent={<IconTrash size={18} />}
      onClick={onClick}
    >
      Trash
    </Button>
  );
};

export const RenameButton: FC<{ onClick: () => void }> = ({ onClick }) => {
  const { selectedFolders, selectedFiles } = useSelectionStore();

  return (
    <Button
      variant="bordered"
      isDisabled={selectedFolders.length + selectedFiles.length > 1}
      startContent={<IconEdit size={18} />}
      onClick={onClick}
    >
      Rename
    </Button>
  );
};

export const StarButton: FC<{ isLoading: boolean; onClick: () => void }> = ({
  isLoading,
  onClick,
}) => {
  return (
    <Button
      variant="bordered"
      isLoading={isLoading}
      startContent={<IconStar size={18} />}
      onClick={onClick}
    >
      Add to starred
    </Button>
  );
};

export const UnStarButton: FC<{ isLoading: boolean; onClick: () => void }> = ({
  isLoading,
  onClick,
}) => {
  return (
    <Button
      variant="bordered"
      isLoading={isLoading}
      startContent={<IconStarOff size={18} />}
      onClick={onClick}
    >
      Remove from starred
    </Button>
  );
};

export const MoveButton: FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <Button
      variant="bordered"
      startContent={<IconFolderSymlink size={18} />}
      onClick={onClick}
    >
      Move to
    </Button>
  );
};

export const DownloadButton = () => {
  return (
    <Button variant="bordered" startContent={<IconDownload size={18} />}>
      Download
    </Button>
  );
};

export const RestoreButton: FC<{ isLoading: boolean; onClick: () => void }> = ({
  isLoading,
  onClick,
}) => {
  return (
    <Button
      variant="bordered"
      isLoading={isLoading}
      startContent={<IconRestore size={18} />}
      onClick={onClick}
    >
      Restore
    </Button>
  );
};

export const DeleteButton: FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <Button
      variant="bordered"
      startContent={<IconTrash size={18} />}
      onClick={onClick}
    >
      Delete
    </Button>
  );
};

export const ClearSelection = () => {
  const { selectedFolders, selectedFiles, clearSelection } =
    useSelectionStore();

  return (
    <Button
      variant="bordered"
      startContent={<IconX size={18} />}
      onClick={clearSelection}
    >
      {selectedFolders.length + selectedFiles.length} Selected
    </Button>
  );
};
