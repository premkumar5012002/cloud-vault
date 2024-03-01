import {
  Modal,
  Button,
  Divider,
  ModalBody,
  ModalFooter,
  Breadcrumbs,
  ModalHeader,
  ModalContent,
  useDisclosure,
  BreadcrumbItem,
  CircularProgress,
} from "@nextui-org/react";
import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import { IconFolderPlus, IconCloudFilled } from "@tabler/icons-react";

import { BreadCrumb, File, Folder } from "@/types";
import { trpc } from "@/trpc/client";
import { formatRelativeDate, formatSize } from "@/lib/utils";

import { useSelectionStore } from "@/store/selection";

import { NewFolderModal } from "./NewFolderModal";

const HEADERS = ["TYPE", "NAME", "SIZE", "MODIFIED AT", "CREATED AT"];

export const MoveItemsModal: FC<{
  isOpen: boolean;
  onOpenChange: () => void;
}> = ({ isOpen, onOpenChange }) => {
  const utils = trpc.useUtils();

  const [isMoveItemsDisabled, setIsMoveItemsDisabled] = useState(false);

  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>();

  const { selectedFolders, selectedFiles, clearSelection } =
    useSelectionStore();

  const {
    isOpen: isNewFolderModalOpen,
    onOpenChange: onNewFolderModalOpenChange,
  } = useDisclosure();

  const { data: breadCrumbs, isLoading: isBreadCrumbsLoading } =
    trpc.folders.getBreadCrumbs.useQuery({
      folderId: currentFolderId,
    });

  const { data: folders, isLoading: isFoldersLoading } =
    trpc.folders.getFolders.useQuery({
      page: "drive",
      folderId: currentFolderId,
    });

  const { data: files, isLoading: isFilesLoading } =
    trpc.files.getFiles.useQuery({
      page: "drive",
      folderId: currentFolderId,
    });

  const isQueryLoading =
    isBreadCrumbsLoading || isFoldersLoading || isFilesLoading;

  const { mutate: moveItems, isLoading: isItemsMoving } =
    trpc.contents.move.useMutation({
      onError: (e) => {
        toast.error(e.message);
      },
      onSuccess: async () => {
        let hasRootFolder = false;
        let hasSelectedFolder = selectedFolders.length > 0;
        let hasSelectedFiles = selectedFiles.length > 0;

        const folderIds = new Set<string>();

        for (const selectedFolder of selectedFolders) {
          if (selectedFolder.parentId) {
            folderIds.add(selectedFolder.parentId);
          } else {
            hasRootFolder = true;
          }
        }

        for (const selectedFile of selectedFiles) {
          if (selectedFile.folderId) {
            folderIds.add(selectedFile.folderId);
          } else {
            hasRootFolder = true;
          }
        }

        if (hasRootFolder) {
          if (hasSelectedFolder) {
            await utils.folders.getFolders.invalidate({ page: "drive" });
          }

          if (hasSelectedFiles) {
            await utils.files.getFiles.invalidate({ page: "drive" });
          }
        }

        for (const folderId of folderIds) {
          if (hasSelectedFolder) {
            await utils.folders.getFolders.invalidate({
              page: "drive",
              folderId,
            });
          }

          if (hasSelectedFiles) {
            await utils.files.getFiles.invalidate({ page: "drive", folderId });
          }
        }

        setCurrentFolderId(undefined);
        clearSelection();
        onOpenChange();
        toast.success("The selected items successfully moved");
      },
    });

  const onChangeFolder = (folderId?: string) => {
    setCurrentFolderId(folderId);
  };

  const onMoveItems = () => {};

  useEffect(() => {
    for (const BreadCrumb of breadCrumbs ?? []) {
      const selectedfolderIds = selectedFolders.map((folder) => folder.id);
      if (selectedfolderIds.includes(BreadCrumb.id)) {
        setIsMoveItemsDisabled(true);
      }
    }
  }, [breadCrumbs]);

  return (
    <>
      <Modal size="2xl" isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader>
            <h2 className="text-xl font-semibold">Move Items</h2>
          </ModalHeader>

          <ModalBody>
            <div className="flex items-center justify-between">
              <BreadCrumbs
                breadCrumbs={breadCrumbs}
                onChangeFolder={onChangeFolder}
              />

              <Button
                isIconOnly
                variant="bordered"
                onClick={onNewFolderModalOpenChange}
              >
                <IconFolderPlus size={20} />
              </Button>
            </div>

            <div className="block max-h-72 overflow-auto">
              <table className="w-full text-sm text-left rtl:text-right">
                <thead className="sticky top-0 text-xs text-default-500 uppercase bg-default-100">
                  <tr>
                    {HEADERS.map((header) => (
                      <th
                        key={header}
                        scope="col"
                        className="px-6 py-3 truncate"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {folders?.map((folder) => (
                    <FolderRow {...folder} onChangeFolder={onChangeFolder} />
                  ))}

                  {files?.map((file) => (
                    <FileRow {...file} />
                  ))}
                </tbody>
              </table>

              {isQueryLoading && (
                <div className="flex items-center justify-center gap-3 text-lg pt-6 pb-3">
                  <CircularProgress size="sm" />
                  Loading..
                </div>
              )}

              {folders &&
                files &&
                folders.length === 0 &&
                files.length === 0 && (
                  <div className="flex items-center w-full justify-center gap-3 text-lg pt-8 pb-6 text-default-400">
                    Empty folder contents...
                  </div>
                )}
            </div>
          </ModalBody>

          <Divider />

          <ModalFooter>
            <Button onClick={onOpenChange}>Cancel</Button>
            <Button
              color="primary"
              isLoading={isItemsMoving}
              isDisabled={isMoveItemsDisabled}
              onClick={onMoveItems}
            >
              Move
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <NewFolderModal
        folderId={currentFolderId}
        isOpen={isNewFolderModalOpen}
        onOpenChange={onNewFolderModalOpenChange}
      />
    </>
  );
};

const BreadCrumbs: FC<{
  breadCrumbs?: BreadCrumb[];
  onChangeFolder: (id?: string) => void;
}> = ({ breadCrumbs, onChangeFolder }) => {
  return (
    <Breadcrumbs size="lg" maxItems={4}>
      <BreadcrumbItem onClick={() => onChangeFolder()}>
        <p className="flex items-center gap-1.5 font-medium">
          <IconCloudFilled size={20} />
          Drive
        </p>
      </BreadcrumbItem>
      {breadCrumbs?.map(({ id, name }) => (
        <BreadcrumbItem key={id} onClick={() => onChangeFolder(id)}>
          <p className="font-medium">{name}</p>
        </BreadcrumbItem>
      ))}
    </Breadcrumbs>
  );
};

const FolderRow: FC<Folder & { onChangeFolder: (id: string) => void }> = ({
  id,
  name,
  size,
  updatedAt,
  createdAt,
  onChangeFolder,
}) => {
  return (
    <tr key={id}>
      <td className="px-6 py-4">
        <Image src="/folder.svg" width={30} height={30} alt="Folder" />
      </td>

      <td className="px-6 py-4" onClick={() => onChangeFolder(id)}>
        <button className="hover:underline">{name}</button>
      </td>

      <td className="px-6 py-4">{formatSize(size)}</td>

      <td className="px-6 py-4">{formatRelativeDate(updatedAt)}</td>
      <td className="px-6 py-4">{formatRelativeDate(createdAt)}</td>
    </tr>
  );
};

const FileRow: FC<File> = ({ id, name, size, updatedAt, uploadedAt }) => {
  return (
    <tr key={id} className="text-default-500 hover:cursor-not-allowed">
      <td className="px-6 py-4"></td>

      <td className="px-6 py-4">
        <p>{name}</p>
      </td>

      <td className="px-6 py-4">{formatSize(size)}</td>

      <td className="px-6 py-4">
        {new Date(updatedAt.toString()).toLocaleDateString()}
      </td>

      <td className="px-6 py-4">
        {new Date(uploadedAt.toString()).toLocaleDateString()}
      </td>
    </tr>
  );
};
