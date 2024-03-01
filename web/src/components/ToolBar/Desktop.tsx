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
  IconPlus,
  IconFile,
  IconTrash,
  IconFolder,
  IconUpload,
  IconGridDots,
  IconArrowsSort,
  IconChevronDown,
} from "@tabler/icons-react";
import { FC, ReactElement } from "react";

import { trpc } from "@/trpc/client";
import { Page, Sort, View } from "@/types";

import { useUpload } from "@/hooks/useUpload";
import { usePerferenceContext } from "@/hooks/useContext";

export const DesktopToolBar: FC<{
  page: Page;
  onNewFolder: () => void;
  onEmptyTrash: () => void;
}> = ({ page, onNewFolder, onEmptyTrash }) => {
  const toolBars: ReactElement[] = [];

  if (page === "drive") {
    toolBars.push(
      <NewFolderButton key="newFolder" onClick={onNewFolder} />,
      <UploadButton key="upload" />
    );
  } else if (page === "trash") {
    toolBars.push(<EmptyButton key="emptyTrash" onClick={onEmptyTrash} />);
  }

  return (
    <div className="hidden md:flex pt-4 sticky items-center justify-between gap-4 px-6">
      <div className="space-x-3">{toolBars.map((toolBar) => toolBar)}</div>
      <div className="space-x-3">
        <SortButton />
        <ViewButton />
      </div>
    </div>
  );
};

const NewFolderButton: FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <Button
      color="primary"
      startContent={<IconPlus size={18} />}
      onClick={onClick}
    >
      <span>New Folder</span>
    </Button>
  );
};

const UploadButton = () => {
  const { onUploadFiles, onUploadFolder } = useUpload();

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          variant="ghost"
          startContent={<IconUpload size={18} />}
          endContent={<IconChevronDown size={18} />}
        >
          Upload
        </Button>
      </DropdownTrigger>

      <DropdownMenu>
        <DropdownItem
          startContent={<IconFile size={18} />}
          onClick={onUploadFiles}
        >
          Files
        </DropdownItem>

        <DropdownItem
          startContent={<IconFolder size={18} />}
          onClick={onUploadFolder}
        >
          Folder
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

const EmptyButton: FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <Button
      variant="bordered"
      startContent={<IconTrash size={18} />}
      onClick={onClick}
    >
      Empty Trash
    </Button>
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
        <Button
          variant="bordered"
          startContent={<IconArrowsSort size={18} />}
          endContent={<IconChevronDown size={18} />}
        >
          Sort
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
        <Button
          variant="bordered"
          startContent={
            view === "list" ? (
              <IconList size={18} />
            ) : (
              <IconGridDots size={18} />
            )
          }
          endContent={<IconChevronDown size={18} />}
        >
          {view === "list" ? "List" : "Grid"}
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
