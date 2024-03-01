import { IconTrash } from "@tabler/icons-react";

export const EmptyTrashView = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-6 py-24 px-6 max-w-sm mx-auto">
      <div className="flex items-center justify-center bg-primary-50 w-36 h-36 rounded-full">
        <IconTrash size={90} className="text-primary" />
      </div>
      <div className="space-y-2.5 text-center">
        <h2 className="text-xl lg:text-2xl font-medium">Bin is empty</h2>
        <p className="text-sm lg:text-base text-default-500">
          Items moved to the bin will be deleted forever after 30 days.
        </p>
      </div>
    </div>
  );
};
