import { Button } from "@nextui-org/react";
import { IconCircleCheck } from "@tabler/icons-react";

export const Options = () => {
	return (
		<section className="pt-36">
			<h2 className="text-4xl font-bold tracking-tight">
				Let's find the option that's <span className="text-primary">right</span>{" "}
				for you
			</h2>
			<div className="grid md:grid-cols-2 gap-6 pt-12 text-left">
				<TierCard
					name="Free"
					description="Free forever, for teams just getting started"
					buttonLabel="Get Started"
					features={["1GB of free storage"]}
				/>
				<TierCard
					name="Self Host"
					description="Self host and maintain Highstorm on your own servers"
					buttonLabel="Deploy your own"
					features={[
						"Desired amount of storage",
						"Complete control of your data",
					]}
				/>
			</div>
		</section>
	);
};

type TierCardProps = {
	name: string;
	description: string;
	buttonLabel: string;
	features: string[];
};

const TierCard = ({
	name,
	description,
	features,
	buttonLabel,
}: TierCardProps) => {
	return (
		<div className="bg-default-50 p-6 rounded-lg flex flex-col justify-between border border-divider">
			<div className="pb-4">
				<h3 className="text-3xl font-bold text-left">{name}</h3>
				<p className="pt-1.5 pb-4 text-default-500">{description}</p>
				<div className="border-t border-default-200 pt-4 pb-8 space-y-2.5">
					{features.map((feature, index) => (
						<div key={index} className="flex items-center gap-3">
							<IconCircleCheck size={24} className="text-success" />
							<p className="text-lg">{feature}</p>
						</div>
					))}
				</div>
			</div>
			<Button size="lg" color="primary" fullWidth>
				{buttonLabel}
			</Button>
		</div>
	);
};
