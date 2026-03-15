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
 * Shows either the "Access Requests" title (expanded) or the summary text
 * (collapsed) with a purely vertical swap animation.
 *
 * **WHY `mode="popLayout"`?**
 * When collapsing, the collapsed avatars appear as a flex sibling *before*
 * this container, pushing it rightward. With a normal `AnimatePresence` the
 * exiting title would follow that horizontal shift. `popLayout` immediately
 * takes the exiting element out of flow (absolute-positioned at its current
 * visual coordinates), so it stays put at the left edge and animates
 * straight up — as if the incoming avatars physically pushed it out.
 */
function HeaderTextBlock({
	bannerState,
	requests,
}: {
	bannerState: BannerState;
	requests: AccessRequest[];
}) {
	return (
		<div className="min-w-0 flex-1 overflow-hidden">
			<AnimatePresence mode="popLayout" initial={false}>
				{bannerState.status === "expanded" ? (
					<motion.div
						key="title"
						initial={{ opacity: 0, y: -16, filter: "blur(4px)" }}
						animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
						exit={{ opacity: 0, y: -16, filter: "blur(4px)" }}
						transition={{ type: "spring", stiffness: 400, damping: 30 }}
					>
						<motion.span
							initial={{ scale: 0.85 }}
							animate={{ scale: 1 }}
							exit={{ scale: 0.85 }}
							transition={{ type: "spring", stiffness: 400, damping: 30 }}
							className="block origin-left text-sm font-semibold text-foreground"
						>
							Access Requests
						</motion.span>
					</motion.div>
				) : (
					<motion.div
						key="summary"
						initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
						animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
						exit={{ opacity: 0, y: 16, filter: "blur(4px)" }}
						transition={{ type: "spring", stiffness: 400, damping: 30 }}
					>
						<motion.div
							initial={{ scale: 0.85 }}
							animate={{ scale: 1 }}
							exit={{ scale: 0.85 }}
							transition={{ type: "spring", stiffness: 400, damping: 30 }}
							className="origin-left"
						>
							<SummaryText requests={requests} />
						</motion.div>
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
 * 1. **Toggle button** — wraps `CollapsedAvatarGroup`, `HeaderTextBlock`,
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

				<HeaderTextBlock bannerState={bannerState} requests={requests} />

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
