import { KeyboardEvent } from "react";
import { clsx, ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function getBaseUrl() {
	return process.env.NEXT_PUBLIC_VERCEL_URL ?? "http://localhost:3000";
}

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const preventDefaultOnEnterKey = (
	e: KeyboardEvent<HTMLInputElement>,
	onEnter: () => void
) => {
	if (e.key === "Enter") {
		onEnter();
		e.preventDefault();
	}
};

export const calculateUsage = (used: number, total: number) => {
	if (total === 0) return 0;
	return (used / total) * 100;
};

export const formatSize = (sizeInBytes: number): string => {
	const units = ["B", "KB", "MB", "GB"];

	let unitIndex = 0;

	while (sizeInBytes >= 1000 && unitIndex < units.length - 1) {
		sizeInBytes /= 1000;
		unitIndex++;
	}

	return `${Math.floor(sizeInBytes)} ${units[unitIndex]}`;
};

export const formatUploadedSize = (progress: number, totalSize: number): string => {
	const uploadedSizeInBytes = (progress * totalSize) / 100;
	return formatSize(uploadedSizeInBytes);
};

export const formatRelativeDate = (date: Date | string) => {
	const formatedDate = date instanceof Date ? date : new Date(date);

	// Current timestamp
	const now = new Date();

	// Difference in milliseconds
	const diff = now.getTime() - formatedDate.getTime();

	// Function to convert milliseconds to human-readable time
	const formatTime = (time: number, unit: string) => {
		const rounded = Math.round(time);
		return `${rounded} ${unit}${rounded !== 1 ? "s" : ""} ago`;
	};

	if (diff < 60000) {
		// Less than a minute
		return "now";
	} else if (diff < 3600000) {
		// Less than an hour
		return formatTime(diff / 60000, "minute");
	} else if (diff < 86400000) {
		// Less than a day
		return formatTime(diff / 3600000, "hour");
	} else if (diff < 604800000) {
		// Less than a week
		return formatTime(diff / 86400000, "day");
	} else if (diff < 2628000000) {
		// Less than a month
		return formatTime(diff / 604800000, "week");
	} else if (diff < 31536000000) {
		// Less than a year
		return new Intl.DateTimeFormat("en-US", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		}).format(formatedDate);
	} else {
		// More than a year
		return new Intl.DateTimeFormat("en-US", {
			year: "numeric",
			month: "long",
			day: "2-digit",
		}).format(formatedDate);
	}
};
