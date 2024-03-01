import { FC, ReactElement } from "react";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  DropdownSection,
} from "@nextui-org/react";
import {
  IconList,
  IconDots,
  IconTrash,
  IconUpload,
  IconGridDots,
  IconFolderUp,
  IconArrowsSort,
  IconFolderPlus,
} from "@tabler/icons-react";

import { trpc } from "@/trpc/client";
import { Page, Sort, View } from "@/types";

import { useUpload } from "@/hooks/useUpload";
import { usePerferenceContext } from "@/hooks/useContext";

export const MobileToolBar: FC<{
  page: Page;
  onNewFolder: () => void;
  onEmptyTrash: () => void;
}> = ({ page, onNewFolder, onEmptyTrash }) => {
  const { onUploadFiles, onUploadFolder } = useUpload();

  const dropDownItems: ReactElement[] = [];

  if (page === "drive") {
    dropDownItems.push(
      <DropdownItem
        key="newFolder"
        startContent={<IconFolderPlus size={18} />}
        onClick={onNewFolder}
      >
        New folder
      </DropdownItem>,

      <DropdownItem
        key="uploadFiles"
        startContent={<IconUpload size={18} />}
        onClick={onUploadFiles}
      >
        Upload files
      </DropdownItem>,

      <DropdownItem
        key="uploadFolder"
        startContent={<IconFolderUp size={18} />}
        onClick={onUploadFolder}
      >
        Upload folder
      </DropdownItem>
    );
  } else if (page === "trash") {
    dropDownItems.push(
      <DropdownItem
        key="emptyTrash"
        startContent={<IconTrash size={18} />}
        onClick={onEmptyTrash}
      >
        Empty trash
      </DropdownItem>
    );
  }

  return (
    <div className="pt-4 flex md:hidden sticky items-center justify-between gap-4 px-6">
      <div>
        {(page === "drive" || page === "trash") && (
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly variant="light">
                <IconDots />
              </Button>
            </DropdownTrigger>
            <DropdownMenu>{dropDownItems.map((item) => item)}</DropdownMenu>
          </Dropdown>
        )}
      </div>
      <div className="flex items-center gap-2">
        <SortButton />
        <div className="h-6 w-[1.5px] bg-divider" />
        <ViewButton />
      </div>
    </div>
  );
};

const SortButton = () => {
  const [sort, changeSort] = usePerferenceContext(({ sort, changeSort }) => [
    sort,
    changeSort,
  ]);

  const { mutate } = trpc.changeSort.useMutation();

  const handleSortChange = ({ by, order }: Partial<Sort>) => {
    const newSort = {
      by: by ?? sort.by,
      order: order ?? sort.order,
    };
    changeSort(newSort);
    mutate({ sort: newSort });
  };

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button isIconOnly variant="light">
          <IconArrowsSort size={20} />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        selectionMode="multiple"
        selectedKeys={[sort.by, sort.order]}
      >
        <DropdownSection showDivider>
          <DropdownItem
            key="name"
            onClick={() => handleSortChange({ by: "name" })}
          >
            Name
          </DropdownItem>

          <DropdownItem
            key="modified"
            onClick={() => handleSortChange({ by: "modified" })}
          >
            Modified
          </DropdownItem>

          <DropdownItem
            key="size"
            onClick={() => handleSortChange({ by: "size" })}
          >
            File size
          </DropdownItem>
        </DropdownSection>

        <DropdownSection>
          <DropdownItem
            key="asc"
            onClick={() => handleSortChange({ order: "asc" })}
          >
            Ascending
          </DropdownItem>

          <DropdownItem
            key="desc"
            onClick={() => handleSortChange({ order: "desc" })}
          >
            Decending
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
};

const ViewButton = () => {
  const [view, changeView] = usePerferenceContext(({ view, changeView }) => [
    view,
    changeView,
  ]);

  const { mutate } = trpc.changeView.useMutation();

  const handleViewChange = (view: View) => {
    changeView(view);
    mutate({ view });
  };

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button isIconOnly variant="light">
          {view === "list" ? (
            <IconList size={20} />
          ) : (
            <IconGridDots size={20} />
          )}
        </Button>
      </DropdownTrigger>
      <DropdownMenu selectionMode="single" selectedKeys={[view]}>
        <DropdownItem
          key="list"
          startContent={<IconList size={18} />}
          onClick={() => handleViewChange("list")}
        >
          List
        </DropdownItem>

        <DropdownItem
          key="grid"
          startContent={<IconGridDots size={18} />}
          onClick={() => handleViewChange("grid")}
        >
          Grid
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};
