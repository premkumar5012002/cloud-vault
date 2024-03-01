import {
	Icon,
	IconShare,
	IconFolders,
	IconRefresh,
	IconServer2,
	IconAppWindow,
	IconBrandOpenSource,
} from "@tabler/icons-react";

type Feature = {
	icon: Icon;
	title: string;
	description: string;
};

const features: Feature[] = [
	{
		icon: IconBrandOpenSource,
		title: "Open Source",
		description:
			"Access and customize the source code for collaborative development and personalization.",
	},
	{
		icon: IconServer2,
		title: "Self Host",
		description:
			"Empower users to host the application on their servers, ensuring greater control and flexibility.",
	},
	{
		icon: IconFolders,
		title: "Efficient File Organization",
		description:
			"Enjoy seamless file management through drag-and-drop functionality, advanced search, and filters.",
	},
	{
		icon: IconRefresh,
		title: "Continuous Updates",
		description:
			"Stay ahead with regular updates, featuring new functionalities, improvements, and security patches.",
	},
	{
		icon: IconAppWindow,
		title: "User-Friendly Interface",
		description:
			"Experience an intuitive design that offers a seamless user experience, with customizable dashboards.",
	},
	{
		icon: IconShare,
		title: "File Sharing",
		description:
			"Facilitate secure file sharing and enhance collaboration with customizable access permissions.",
	},
];

export const Features = () => {
	return (
		<section className="pt-36">
			<h2 className="text-4xl font-bold tracking-tight">
				<span className="text-primary">Discover</span> the features of CloudVault
			</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
				{features.map((feature, index) => (
					<div
						key={index}
						className="text-left p-6 bg-default-50 border border-divider rounded-lg"
					>
						{<feature.icon size={48} />}
						<h3 className="text-xl font-bold pb-1.5 pt-3">{feature.title}</h3>
						<p className="text-default-400">{feature.description}</p>
					</div>
				))}
			</div>
		</section>
	);
};
