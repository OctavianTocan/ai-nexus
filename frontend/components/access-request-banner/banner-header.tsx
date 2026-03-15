"use client";

import { IconChevronDown, IconX } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import {
	Avatar,
	AvatarFallback,
	AvatarGroup,
	AvatarGroupCount,
	AvatarImage,
} from "@/components/ui/avatar";
import { SummaryText } from "./summary-text";
import {
	type AccessRequest,
	type BannerHeaderProps,
	type BannerState,
	BOUNCY_SPRING,
	getInitials,
} from "./types";

// ---------------------------------------------------------------------------
// Private sub-components — not exported; only used within this file.
// ---------------------------------------------------------------------------

/**
 * Renders the collapsed avatar stack with an optional overflow count bubble.
 *
 * Only mounted when the banner is in its collapsed state. Unmounting (rather
 * than hiding) is intentional: each avatar carries a Motion `layoutId`, so
 * when the banner expands this element disappears from the DOM and the
 * matching `layoutId` appears inside the expanded rows — triggering Motion's
 * shared-layout "hero" animation that bounces avatars from the header to
 * their row positions.
 *
 * Avatars are assigned descending `z-index` values so the leftmost avatar
 * sits visually on top, matching the standard left-overlap stack convention.
 */
function CollapsedAvatarGroup({
	collapsedAvatars,
	remainingCount,
}: {
	collapsedAvatars: AccessRequest[];
	remainingCount: number;
}) {
	return (
		<AvatarGroup>
			{collapsedAvatars.map((r, i) => (
				<motion.div
					key={r.id}
					layoutId={`avatar-${r.id}`}
					transition={BOUNCY_SPRING}
					// Leftmost avatar (i=0) gets the highest z-index
					style={{ zIndex: collapsedAvatars.length - i + 1 }}
				>
					<Avatar>
						{r.avatarUrl && <AvatarImage src={r.avatarUrl} alt={r.name} />}
						<AvatarFallback>{getInitials(r.name)}</AvatarFallback>
					</Avatar>
				</motion.div>
			))}

			{/* Overflow bubble — only rendered when requests exceed the collapsed limit */}
			{remainingCount > 0 && (
				<AvatarGroupCount>
					<span className="text-xs">+{remainingCount}</span>
				</AvatarGroupCount>
			)}
		</AvatarGroup>
	);
}

/**
 * Crossfades between the "Access Requests" title (expanded) and the
 * `SummaryText` sentence (collapsed) using `AnimatePresence` with `mode="wait"`.
 *
 * **WHY `mode="wait"` enables natural flow instead of absolute positioning?**
 * `mode="wait"` guarantees at most one child is in the DOM at a time — the
 * exiting child fully unmounts before the entering child mounts. Because
 * they never coexist, both can participate in normal document flow and the
 * container height adjusts to fit the content. This lets the summary text
 * wrap to two lines at narrow widths (matching the reference design) instead
 * of being clipped to one line by a fixed-height absolute box.
 *
 * `min-h-[1.25rem]` prevents the container from collapsing to zero height
 * during the brief gap between exit and enter.
 *
 * **WHY opposite `y` directions?**
 * The title enters from above (`y: -20`) — it conceptually "drops down" to
 * replace the summary. The summary enters from below (`y: 20`) — it
 * "rises up" when the banner collapses. This directional intent makes the
 * swap feel purposeful rather than an arbitrary crossfade.
 */
function HeaderTextCrossfade({
	bannerState,
	requests,
}: {
	bannerState: BannerState;
	requests: AccessRequest[];
}) {
	return (
		<div className="min-h-[1.25rem] min-w-0 flex-1 overflow-hidden">
			<AnimatePresence mode="wait" initial={false}>
				{bannerState.status === "expanded" ? (
					<motion.div
						key="title"
						initial={{ opacity: 0, y: -20, scale: 0.9 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{
							opacity: 0,
							y: -20,
							scale: 0.9,
							transition: { duration: 0.12 },
						}}
						transition={{ type: "spring", stiffness: 350, damping: 25 }}
					>
						<span className="text-sm font-semibold text-foreground">
							Access Requests
						</span>
					</motion.div>
				) : (
					<motion.div
						key="summary"
						className="line-clamp-2"
						initial={{ opacity: 0, y: 20, scale: 0.9 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{
							opacity: 0,
							y: 20,
							scale: 0.9,
							transition: { duration: 0.12 },
						}}
						transition={{ type: "spring", stiffness: 400, damping: 30 }}
					>
						<SummaryText requests={requests} />
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Exported component
// ---------------------------------------------------------------------------

/**
 * Header row for the access-request banner.
 *
 * Contains two sibling `<button>` elements inside a flex `<div>`:
 * 1. **Toggle button** — wraps `CollapsedAvatarGroup`, `HeaderTextCrossfade`,
 *    and the animated chevron. Clicking expands or collapses the list.
 * 2. **Dismiss button** — removes the banner entirely.
 *
 * **WHY two sibling buttons instead of one outer button?**
 * Nesting `<button>` inside `<button>` is invalid per the HTML interactive
 * content model and triggers a lint error. Keeping them as siblings means
 * dismiss clicks cannot bubble to the toggle handler — no `stopPropagation`
 * needed.
 */
export function BannerHeader({
	bannerState,
	requests,
	collapsedAvatars,
	remainingCount,
	onToggleExpand,
	onDismiss,
}: BannerHeaderProps) {
	return (
		<div className="flex items-center gap-3 px-4 py-3">
			{/*
			 * Toggle button — flex-1 + min-w-0 lets it fill all remaining space
			 * while allowing the text area inside to truncate correctly.
			 */}
			<button
				type="button"
				onClick={onToggleExpand}
				className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
			>
				{/* Unmounted when expanded so the layoutId hero animation can fire */}
				{bannerState.status === "collapsed" && (
					<CollapsedAvatarGroup
						collapsedAvatars={collapsedAvatars}
						remainingCount={remainingCount}
					/>
				)}

				<HeaderTextCrossfade bannerState={bannerState} requests={requests} />

				{/*
				 * Chevron rotates 180° to signal open/close state.
				 * WHY animate rotate instead of a CSS class toggle?
				 * Motion interpolates through the shortest rotation arc, so
				 * collapsing from 180° → 0° animates counter-clockwise without
				 * any extra logic.
				 */}
				<motion.div
					animate={{ rotate: bannerState.status === "expanded" ? 180 : 0 }}
					transition={BOUNCY_SPRING}
					className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
				>
					<IconChevronDown className="size-4" />
				</motion.div>
			</button>

			{/* Dismiss button — sibling of the toggle button, not a descendant,
			    so no stopPropagation is needed. */}
			<button
				type="button"
				onClick={onDismiss}
				className="shrink-0 cursor-pointer rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
				aria-label="Dismiss"
			>
				<IconX className="size-4" />
			</button>
		</div>
	);
}
