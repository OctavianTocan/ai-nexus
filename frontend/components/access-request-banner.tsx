"use client";

import { IconCheck, IconChevronDown, IconX } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import {
	Avatar,
	AvatarFallback,
	AvatarGroup,
	AvatarImage,
} from "@/components/ui/avatar";

/** A single access request entry. */
export type AccessRequest = {
	id: string;
	name: string;
	avatarUrl?: string;
};

/** Decision state for a single access request. */
type Decision = "undecided" | "approved" | "rejected";

/** Spring config reused across all bouncy animations in this component. */
const BOUNCY_SPRING = { type: "spring" as const, stiffness: 300, damping: 15 };

/** Slightly softer spring for the expanding section so it feels weighty rather than snappy. */
const EXPAND_SPRING = { type: "spring" as const, stiffness: 250, damping: 20 };

/**
 * Extracts up to 2 initials from a full name for avatar fallbacks.
 *
 * Takes the first character of the first and last name segments,
 * so "Octavian Tocan" becomes "OT" and "Jane" becomes "J".
 */
function getInitials(name: string): string {
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

/**
 * Builds the summary string for the collapsed banner.
 *
 * Uses the first user's name and counts the rest to keep the
 * collapsed bar scannable at a glance.
 */
function buildSummaryText(requests: AccessRequest[]): string {
	const first = requests[0];
	const second = requests[1];
	if (!first) return "";
	if (requests.length === 1) return `@${first.name} is requesting access`;
	if (requests.length === 2 && second)
		return `@${first.name} and @${second.name} are requesting access`;
	return `@${first.name} and ${requests.length - 1} others are requesting access`;
}

/**
 * Pill toggle for approve/reject decisions.
 *
 * Shows two side-by-side buttons when undecided, collapses to a single
 * status indicator once a decision is made. Clicking a decided pill
 * resets it to undecided so decisions are reversible.
 */
function DecisionPill({
	decision,
	onApprove,
	onReject,
	onReset,
}: {
	decision: Decision;
	onApprove: () => void;
	onReject: () => void;
	onReset: () => void;
}) {
	if (decision === "approved") {
		return (
			<motion.button
				type="button"
				onClick={onReset}
				className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400"
				/* Bounce in when transitioning to decided state */
				initial={{ scale: 0.9 }}
				animate={{ scale: 1 }}
				transition={BOUNCY_SPRING}
				whileTap={{ scale: 0.95 }}
			>
				<IconCheck className="size-3" />
				Approved
			</motion.button>
		);
	}

	if (decision === "rejected") {
		return (
			<motion.button
				type="button"
				onClick={onReset}
				className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive"
				initial={{ scale: 0.9 }}
				animate={{ scale: 1 }}
				transition={BOUNCY_SPRING}
				whileTap={{ scale: 0.95 }}
			>
				<IconX className="size-3" />
				Rejected
			</motion.button>
		);
	}

	/* Undecided: show both options in a shared pill container */
	return (
		<div className="inline-flex items-center overflow-hidden rounded-full border border-border">
			<motion.button
				type="button"
				onClick={onApprove}
				className="px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400"
				whileTap={{ scale: 0.95 }}
			>
				Approve
			</motion.button>
			{/* Visual divider between the two options */}
			<div className="h-4 w-px bg-border" />
			<motion.button
				type="button"
				onClick={onReject}
				className="px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
				whileTap={{ scale: 0.95 }}
			>
				Reject
			</motion.button>
		</div>
	);
}

/**
 * A single row in the expanded access request list.
 *
 * Renders avatar + name on the left, DecisionPill on the right.
 * Designed to be wrapped in a motion.div for staggered entry animation.
 */
function AccessRequestRow({
	request,
	decision,
	onApprove,
	onReject,
	onReset,
}: {
	request: AccessRequest;
	decision: Decision;
	onApprove: () => void;
	onReject: () => void;
	onReset: () => void;
}) {
	return (
		<div className="flex items-center justify-between gap-3 px-4 py-2">
			<div className="flex items-center gap-3">
				<Avatar size="sm">
					{request.avatarUrl && (
						<AvatarImage src={request.avatarUrl} alt={request.name} />
					)}
					<AvatarFallback>{getInitials(request.name)}</AvatarFallback>
				</Avatar>
				<span className="text-sm font-medium">{request.name}</span>
			</div>
			<DecisionPill
				decision={decision}
				onApprove={onApprove}
				onReject={onReject}
				onReset={onReset}
			/>
		</div>
	);
}

/** Props for the {@link AccessRequestBanner} component. */
export type AccessRequestBannerProps = {
	requests: AccessRequest[];
	onApprove?: (id: string) => void;
	onReject?: (id: string) => void;
	onDismiss?: () => void;
};

/**
 * Collapsible notification banner for pending access requests.
 *
 * Collapsed state shows an avatar group, summary text, expand chevron,
 * and dismiss button. Expanded state reveals per-user rows with
 * approve/reject pill toggles. All transitions use bouncy spring animations
 * via Motion v12.
 *
 * @example
 * ```tsx
 * <AccessRequestBanner
 *   requests={[{ id: "1", name: "Octavian Tocan" }]}
 *   onApprove={(id) => console.log("approved", id)}
 *   onReject={(id) => console.log("rejected", id)}
 *   onDismiss={() => console.log("dismissed")}
 * />
 * ```
 */
export function AccessRequestBanner({
	requests,
	onApprove,
	onReject,
	onDismiss,
}: AccessRequestBannerProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	/* Track decisions locally so the banner can show decided state inline */
	const [decisions, setDecisions] = useState<Record<string, Decision>>({});

	const handleApprove = (id: string) => {
		setDecisions((prev) => ({ ...prev, [id]: "approved" }));
		onApprove?.(id);
	};

	const handleReject = (id: string) => {
		setDecisions((prev) => ({ ...prev, [id]: "rejected" }));
		onReject?.(id);
	};

	/** Resets a decision back to undecided without firing external callbacks. */
	const handleReset = (id: string) => {
		setDecisions((prev) => ({ ...prev, [id]: "undecided" }));
	};

	/* Don't render anything if there are no requests */
	if (requests.length === 0) return null;

	return (
		<div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
			{/* Collapsed bar: always visible regardless of expand state */}
			<div className="flex items-center gap-3 px-4 py-3">
				{/* Avatar stack showing up to 3 users to avoid visual clutter */}
				<AvatarGroup>
					{requests.slice(0, 3).map((r) => (
						<Avatar key={r.id} size="sm">
							{r.avatarUrl && <AvatarImage src={r.avatarUrl} alt={r.name} />}
							<AvatarFallback>{getInitials(r.name)}</AvatarFallback>
						</Avatar>
					))}
				</AvatarGroup>

				{/* Summary text fills the middle, truncates on narrow screens */}
				<span className="flex-1 truncate text-sm text-foreground">
					{buildSummaryText(requests)}
				</span>

				{/* Chevron: rotates 180 degrees when expanded with bouncy spring */}
				<motion.button
					type="button"
					onClick={() => setIsExpanded((prev) => !prev)}
					className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
					animate={{ rotate: isExpanded ? 180 : 0 }}
					transition={BOUNCY_SPRING}
					aria-label={isExpanded ? "Collapse" : "Expand"}
				>
					<IconChevronDown className="size-4" />
				</motion.button>

				{/* Dismiss button removes the entire banner */}
				<button
					type="button"
					onClick={onDismiss}
					className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
					aria-label="Dismiss"
				>
					<IconX className="size-4" />
				</button>
			</div>

			{/* Expanded list: animated height with staggered rows */}
			<AnimatePresence>
				{isExpanded && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={EXPAND_SPRING}
						className="overflow-hidden"
					>
						{/* Top border to visually separate from collapsed bar */}
						<div className="border-t border-border" />
						<div className="py-1">
							{requests.map((request, index) => (
								<motion.div
									key={request.id}
									/* Stagger: each row slides in slightly after the previous */
									initial={{ opacity: 0, y: -8 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{
										...BOUNCY_SPRING,
										delay: index * 0.05,
									}}
								>
									<AccessRequestRow
										request={request}
										decision={decisions[request.id] ?? "undecided"}
										onApprove={() => handleApprove(request.id)}
										onReject={() => handleReject(request.id)}
										onReset={() => handleReset(request.id)}
									/>
								</motion.div>
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
