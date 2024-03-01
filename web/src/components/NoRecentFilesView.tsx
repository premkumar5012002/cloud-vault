import { IconClock } from "@tabler/icons-react";

export const NoRecentFilesView = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-6 py-24 px-6 max-w-sm mx-auto">
      <div className="flex items-center justify-center bg-primary-50 w-36 h-36 rounded-full">
        <IconClock size={90} className="text-primary" />
      </div>
      <div className="space-y-2.5 text-center">
        <h2 className="text-xl lg:text-2xl font-medium">No recent files</h2>
        <p className="text-sm lg:text-base text-default-500">
          You haven&apos;t viewed or modified any files recently.
        </p>
      </div>
    </div>
  );
};
