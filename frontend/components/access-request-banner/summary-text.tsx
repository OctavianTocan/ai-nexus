import type { AccessRequest } from "./types";

/**
 * Renders the summary text with highlighted handles and counts.
 *
 * Highlights the @handle and "N others" in white (foreground) while
 * keeping the rest in a muted color, so the important info pops.
 */
export function SummaryText({ requests }: { requests: AccessRequest[] }) {
	const first = requests[0];
	const second = requests[1];

	if (!first) return null;

	if (requests.length === 1) {
		return (
			<span className="text-sm text-muted-foreground">
				<span className="font-medium text-foreground">@{first.name}</span> is
				requesting access
			</span>
		);
	}

	if (requests.length === 2 && second) {
		return (
			<span className="text-sm text-muted-foreground">
				<span className="font-medium text-foreground">@{first.name}</span> and{" "}
				<span className="font-medium text-foreground">@{second.name}</span> are
				requesting access
			</span>
		);
	}

	return (
		<span className="text-sm text-muted-foreground">
			<span className="font-medium text-foreground">@{first.name}</span> and{" "}
			<span className="font-medium text-foreground">
				{requests.length - 1} others
			</span>{" "}
			are requesting access
		</span>
	);
}
