"use client";

import { IconCheck, IconX } from "@tabler/icons-react";
import { motion } from "motion/react";
import { BOUNCY_SPRING, type Decision } from "./types";

/**
 * Sliding pill toggle for approve/reject decisions.
 *
 * Uses a sliding highlight indicator that animates between "Approve"
 * and "Reject" positions. Clicking the active side again resets to
 * undecided. The sliding indicator uses layoutId for smooth position
 * animation.
 */
export function DecisionPill({
	decision,
	onApprove,
	onReject,
	onReset,
	/** Unique ID used to scope the layoutId so multiple pills don't conflict */
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
			{/* Sliding highlight indicator that moves between approve/reject */}
			{isDecided && (
				<motion.div
					layoutId={`pill-highlight-${pillId}`}
					className={`absolute inset-y-0 w-1/2 rounded-full ${
						isApproved
							? "left-0 bg-emerald-500/15"
							: "left-1/2 bg-destructive/10"
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
						? "text-emerald-600 dark:text-emerald-400"
						: "text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400"
				}`}
				whileTap={{ scale: 0.95 }}
			>
				{isApproved && <IconCheck className="size-3" />}
				{isApproved ? "Approved" : "Approve"}
			</motion.button>

			{/* Divider: hidden when a decision is made since highlight covers it */}
			{!isDecided && <div className="h-4 w-px bg-border" />}

			{/* Reject side */}
			<motion.button
				type="button"
				onClick={isRejected ? onReset : onReject}
				className={`relative z-10 flex cursor-pointer items-center gap-1 px-3 py-1 text-xs font-medium transition-colors ${
					isRejected
						? "text-destructive"
						: "text-muted-foreground hover:text-destructive"
				}`}
				whileTap={{ scale: 0.95 }}
			>
				{isRejected && <IconX className="size-3" />}
				{isRejected ? "Rejected" : "Reject"}
			</motion.button>
		</div>
	);
}
