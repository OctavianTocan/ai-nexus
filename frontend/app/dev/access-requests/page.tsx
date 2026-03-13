"use client";

import { useState } from "react";
import {
	type AccessRequest,
	AccessRequestBanner,
} from "@/components/access-request-banner";

/** Mock data for testing the banner with various name lengths and counts. */
const MOCK_REQUESTS: AccessRequest[] = [
	{ id: "1", name: "Octavian Tocan" },
	{ id: "2", name: "Jane Smith" },
	{ id: "3", name: "Alex Chen" },
	{ id: "4", name: "Maria Lopez" },
	{ id: "5", name: "Sam Wilson" },
];

/**
 * Dev-only route for testing the AccessRequestBanner component.
 *
 * Renders three variants (5, 2, and 1 users) so all text logic
 * branches and layout edge cases can be verified visually.
 * Logs approve/reject/dismiss actions to console.
 */
export default function AccessRequestsDevPage() {
	const [dismissed, setDismissed] = useState<Record<string, boolean>>({});

	return (
		<div className="mx-auto flex max-w-2xl flex-col gap-8 p-8">
			<h1 className="text-2xl font-bold">Access Request Banner - Dev</h1>

			{/* Full list: 5 users - tests staggered animation and avatar overflow */}
			{!dismissed.full && (
				<div>
					<p className="mb-2 text-sm text-muted-foreground">5 users:</p>
					<AccessRequestBanner
						requests={MOCK_REQUESTS}
						onApprove={(id) => console.log("Approved:", id)}
						onReject={(id) => console.log("Rejected:", id)}
						onDismiss={() => setDismissed((d) => ({ ...d, full: true }))}
					/>
				</div>
			)}

			{/* Two users - tests the "X and Y are requesting" text variant */}
			{!dismissed.two && (
				<div>
					<p className="mb-2 text-sm text-muted-foreground">2 users:</p>
					<AccessRequestBanner
						requests={MOCK_REQUESTS.slice(0, 2)}
						onApprove={(id) => console.log("Approved:", id)}
						onReject={(id) => console.log("Rejected:", id)}
						onDismiss={() => setDismissed((d) => ({ ...d, two: true }))}
					/>
				</div>
			)}

			{/* Single user - tests the "X is requesting" text variant */}
			{!dismissed.single && (
				<div>
					<p className="mb-2 text-sm text-muted-foreground">1 user:</p>
					<AccessRequestBanner
						requests={MOCK_REQUESTS.slice(0, 1)}
						onApprove={(id) => console.log("Approved:", id)}
						onReject={(id) => console.log("Rejected:", id)}
						onDismiss={() => setDismissed((d) => ({ ...d, single: true }))}
					/>
				</div>
			)}

			{/* Reset button appears once any banner has been dismissed */}
			{Object.keys(dismissed).length > 0 && (
				<button
					type="button"
					onClick={() => setDismissed({})}
					className="text-sm text-muted-foreground underline hover:text-foreground"
				>
					Reset all banners
				</button>
			)}
		</div>
	);
}
