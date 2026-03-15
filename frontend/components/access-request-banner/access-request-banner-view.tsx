"use client";

import { LayoutGroup, motion } from "motion/react";
import { BannerHeader } from "./banner-header";
import { ExpandedRequestList } from "./expanded-request-list";
import { type AccessRequestBannerViewProps, EXPAND_SPRING } from "./types";

/**
 * Pure presentation layer for the access-request banner.
 *
 * This component is intentionally thin — it owns no state and contains no
 * animation or layout logic of its own. Its only job is to compose the two
 * structural pieces (`BannerHeader` and `ExpandedRequestList`) inside the
 * shared `LayoutGroup` that enables Motion's cross-component layout
 * animations (the avatar hero transitions).
 *
 * **WHY `LayoutGroup` here and not further down?**
 * `LayoutGroup` must wrap *all* components that share `layoutId` values. The
 * avatar `layoutId`s are used in both `BannerHeader` (collapsed stack) and
 * `RequestRow` (expanded rows), which live in separate subtrees. Placing
 * `LayoutGroup` at the view root ensures Motion can track the same id across
 * both subtrees and animate the positional hand-off.
 *
 * **WHY `motion.div` with `layout` here?**
 * The card's height changes when the list expands. The `layout` prop tells
 * Motion to animate the card's bounding box smoothly instead of snapping.
 * `overflow-hidden` prevents content from peeking outside the card during
 * the height tween.
 *
 * @see {@link AccessRequestBanner} for the stateful Component that drives this View.
 * @see {@link BannerHeader} for the header row (toggle + dismiss).
 * @see {@link ExpandedRequestList} for the sliding user-row panel.
 */
export function AccessRequestBannerView({
	requests,
	bannerState,
	decisions,
	collapsedAvatars,
	remainingCount,
	onToggleExpand,
	onDismiss,
	onApproveRequest,
	onRejectRequest,
	onResetRequest,
}: AccessRequestBannerViewProps) {
	return (
		<LayoutGroup>
			<motion.div
				transition={EXPAND_SPRING}
				className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm"
			>
				<BannerHeader
					bannerState={bannerState}
					requests={requests}
					collapsedAvatars={collapsedAvatars}
					remainingCount={remainingCount}
					onToggleExpand={onToggleExpand}
					onDismiss={onDismiss}
				/>

				<ExpandedRequestList
					bannerState={bannerState}
					requests={requests}
					decisions={decisions}
					onApproveRequest={onApproveRequest}
					onRejectRequest={onRejectRequest}
					onResetRequest={onResetRequest}
				/>
			</motion.div>
		</LayoutGroup>
	);
}
