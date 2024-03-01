import { Button, Link } from "@nextui-org/react";
import { IconArrowRight, IconStar } from "@tabler/icons-react";

import { getPageSession } from "@/lib/auth/lucia";

import { NavBar } from "./nav-bar";
import { Features } from "./features";
import { Options } from "./options";

export default async function Home() {
	const session = await getPageSession();
	return (
		<main className="w-full">
			<NavBar session={session} />
			<div className="max-w-6xl mx-auto px-6 py-12 sm:py-16 lg:py-20 text-center space-y-6">
				<h1 className="font-bold tracking-tight text-4xl sm:text-6xl max-w-2xl mx-auto">
					Powerful cloud storage for{" "}
					<span className="text-primary">all your files</span>
				</h1>
				<p className="text-base sm:text-lg max-w-xl mx-auto text-default-500">
					Welcome to CloudVault, an open-source cloud storage for managing your
					files online.
				</p>
				<div className="flex flex-col sm:flex-row items-center justify-center gap-3">
					<Button
						as={Link}
						color="primary"
						href={session ? "/drive" : "sign-up"}
						className="w-40"
					>
						<span>Get Started</span>
						<IconArrowRight size={18} />
					</Button>
					<Button variant="light" className="w-40">
						<IconStar size={18} />
						<span>Star on GitHub</span>
					</Button>
				</div>
				<Features />
				<Options />
				<section className="pt-36">
					<div className="bg-default-50 py-20 rounded-lg border border-divider px-4">
						<h2 className="text-4xl font-bold">
							<span className="text-primary">Ready</span> to Get Started?
						</h2>
						<p className="text-default-400 mt-3 text-lg">
							Sign up now to start uploading your files...
						</p>
						<Button color="primary" size="lg" className="mt-4">
							<span>Create account</span>
						</Button>
					</div>
				</section>
			</div>
			<footer className="flex flex-col md:flex-row gap-2 items-center justify-between pt-36 pb-6 px-6">
				<p className="text-center text-default-400 text-sm">
					&copy; 2023 All rights reserved.
				</p>
				<div className="flex items-center gap-4">
					<Link href="/privacy-policy" className="text-default-400 text-sm">
						Privacy Policy
					</Link>
					<Link href="/terms-of-service" className="text-default-400 text-sm">
						Terms of Service
					</Link>
					<Link href="/github" className="text-default-400 text-sm">
						GitHub
					</Link>
				</div>
			</footer>
		</main>
	);
}
