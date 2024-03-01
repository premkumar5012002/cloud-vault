import {
  IconX,
  IconEdit,
  IconStar,
  IconDots,
  IconTrash,
  IconRestore,
  IconStarOff,
  IconDownload,
  IconFolderSymlink,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { FC, Key, ReactElement } from "react";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";

import { Page } from "@/types";
import { trpc } from "@/trpc/client";

import { useSelectionStore } from "@/store/selection";

export const MobileSelectionBar: FC<{
  page: Page | "search";
  onTrashItems: () => void;
  onRestoreItems: () => void;
  onRenameItem: () => void;
  onStarItems: () => void;
  onUnStarItems: () => void;
  onMoveItems: () => void;
  onDeleteItems: () => void;
}> = ({
  page,

  onTrashItems,
  onRestoreItems,
  onRenameItem,
  onStarItems,
  onUnStarItems,
  onMoveItems,
  onDeleteItems,
}) => {
  const { selectedFolders, selectedFiles, clearSelection } =
    useSelectionStore();

  const dropDownItems: ReactElement[] = [];

  const TrashItems = (
    <DropdownItem
      key="trash"
      startContent={<IconTrash size={18} />}
      onClick={onTrashItems}
    >
      Trash
    </DropdownItem>
  );

  const RenameItem = (
    <DropdownItem
      key="rename"
      startContent={<IconEdit size={18} />}
      onClick={onRenameItem}
    >
      Rename
    </DropdownItem>
  );

  const StarItems = (
    <DropdownItem
      key="star"
      startContent={<IconStar size={18} />}
      onClick={onStarItems}
    >
      Add to starred
    </DropdownItem>
  );

  const UnStarItems = (
    <DropdownItem
      key="unStar"
      startContent={<IconStarOff size={18} />}
      onClick={onUnStarItems}
    >
      Remove from starred
    </DropdownItem>
  );

  const RestoreItems = (
    <DropdownItem
      key="restore"
      startContent={<IconRestore size={18} />}
      onClick={onRestoreItems}
    >
      Restore
    </DropdownItem>
  );

  const MoveItems = (
    <DropdownItem
      key="move"
      startContent={<IconFolderSymlink size={18} />}
      onClick={onMoveItems}
    >
      Move to
    </DropdownItem>
  );

  const DeleteItems = (
    <DropdownItem
      key="delete"
      startContent={<IconFolderSymlink size={18} />}
      onClick={onDeleteItems}
    >
      Delete
    </DropdownItem>
  );

  const DownloadItems = (
    <DropdownItem
      key="download"
      startContent={<IconDownload size={18} />}
      onClick={() => {}}
    >
      Download
    </DropdownItem>
  );

  let disabledKeys: Iterable<Key> = [];

  if (selectedFolders.length + selectedFiles.length > 1) {
    disabledKeys = ["rename"];
  }

  if (page === "drive" || page === "search") {
    dropDownItems.push(
      TrashItems,
      RenameItem,
      StarItems,
      MoveItems,
      DownloadItems
    );
  } else if (page === "recent") {
    dropDownItems.push(
      TrashItems,
      RenameItem,
      StarItems,
      MoveItems,
      DownloadItems
    );
  } else if (page === "starred") {
    dropDownItems.push(
      TrashItems,
      RenameItem,
      UnStarItems,
      MoveItems,
      DownloadItems
    );
  } else if (page === "trash") {
    disabledKeys = [];
    dropDownItems.push(DeleteItems, RestoreItems);
  }

  return (
    <div className="pt-4 flex md:hidden sticky items-center justify-between gap-4 px-6">
      <Dropdown>
        <DropdownTrigger>
          <Button isIconOnly variant="light">
            <IconDots />
          </Button>
        </DropdownTrigger>
        <DropdownMenu disabledKeys={disabledKeys}>
          {dropDownItems.map((item) => item)}
        </DropdownMenu>
      </Dropdown>
      <Button isIconOnly variant="bordered" onClick={clearSelection}>
        <IconX size={20} />
      </Button>
    </div>
  );
};
