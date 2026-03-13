/** A single access request entry. */
export type AccessRequest = {
	id: string;
	name: string;
	avatarUrl?: string;
};

/** Decision state for a single access request. */
export type Decision = "undecided" | "approved" | "rejected";

/** Props for the {@link AccessRequestBanner} component. */
export type AccessRequestBannerProps = {
	requests: AccessRequest[];
	onApprove?: (id: string) => void;
	onReject?: (id: string) => void;
	onDismiss?: () => void;
};

/** Spring config reused across all bouncy animations in this component family. */
export const BOUNCY_SPRING = {
	type: "spring" as const,
	stiffness: 300,
	damping: 15,
};

/** Softer spring for expanding section so it feels weighty, not snappy. */
export const EXPAND_SPRING = {
	type: "spring" as const,
	stiffness: 250,
	damping: 22,
};

/**
 * Extracts up to 2 initials from a full name for avatar fallbacks.
 *
 * "Octavian Tocan" -> "OT", "Jane" -> "J"
 */
export function getInitials(name: string): string {
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}
