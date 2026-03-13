"use client";

import { IconCheck, IconX } from "@tabler/icons-react";
import { motion } from "motion/react";
import { BOUNCY_SPRING, type Decision } from "./types";

/**
 * Sliding pill toggle for approve/reject decisions.
 *
 * A pill container with two sides. A sliding highlight indicator
 * animates between the two positions when a decision is made.
 * Uses neutral colors (muted/foreground) instead of semantic
 * green/red to avoid a cheap look. Clicking the active side
 * resets to undecided (reversible).
 */
export function DecisionPill({
	decision,
	onApprove,
	onReject,
	onReset,
	/** Unique ID to scope the layoutId so multiple pills don't conflict */
	pillId,
}: {
	decision: Decision;
	onApprove: () => void;
	onReject: () => void;
	onReset: () => void;
	pillId: string;
}) {
	const isApproved = decision === "approved";
	const isRejected = decision === "rejected";
	const isDecided = isApproved || isRejected;

	return (
		<div className="relative inline-flex items-center overflow-hidden rounded-full border border-border">
			{/* Sliding highlight: animates between left/right halves via layoutId.
			    Uses subtle muted background instead of green/red. */}
			{isDecided && (
				<motion.div
					layoutId={`pill-highlight-${pillId}`}
					className={`absolute inset-y-0 w-1/2 rounded-full bg-muted ${
						isApproved ? "left-0" : "left-1/2"
					}`}
					transition={BOUNCY_SPRING}
				/>
			)}

			{/* Approve side */}
			<motion.button
				type="button"
				onClick={isApproved ? onReset : onApprove}
				className={`relative z-10 flex cursor-pointer items-center gap-1 px-3 py-1 text-xs font-medium transition-colors ${
					isApproved
						? "text-foreground"
						: "text-muted-foreground hover:text-foreground"
				}`}
				whileTap={{ scale: 0.95 }}
			>
				{isApproved && <IconCheck className="size-3" />}
				{isApproved ? "Approved" : "Approve"}
			</motion.button>

			{/* Divider: hidden when decided since the highlight covers it */}
			{!isDecided && <div className="h-4 w-px bg-border" />}

			{/* Reject side */}
			<motion.button
				type="button"
				onClick={isRejected ? onReset : onReject}
				className={`relative z-10 flex cursor-pointer items-center gap-1 px-3 py-1 text-xs font-medium transition-colors ${
					isRejected
						? "text-foreground"
						: "text-muted-foreground hover:text-foreground"
				}`}
				whileTap={{ scale: 0.95 }}
			>
				{isRejected && <IconX className="size-3" />}
				{isRejected ? "Rejected" : "Reject"}
			</motion.button>
		</div>
	);
}
