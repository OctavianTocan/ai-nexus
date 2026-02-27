#!/usr/bin/env bun
/**
 * tasks.ts — Display active AI Nexus tasks from Notion via MCPorter.
 *
 * Requires NOTION_TOKEN in .env (Bun auto-loads it).
 * Uses the official @notionhq/notion-mcp-server via stdio.
 *
 * Usage:  just tasks
 */
import { callOnce } from "mcporter";

const DATA_SOURCE_ID = "c11041dc-8621-4742-8e5a-0ec0e1efcc17";

// ── ANSI helpers ──────────────────────────────────────────────────────────────
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";
const CYAN = "\x1b[36m";

const PRIORITY_ICON: Record<string, string> = {
	Critical: "\x1b[31m●\x1b[0m",
	High: "\x1b[33m●\x1b[0m",
	Medium: "\x1b[93m●\x1b[0m",
	Low: "\x1b[32m●\x1b[0m",
};

const STATUS_ICON: Record<string, string> = {
	"Not Started": "\x1b[90m○\x1b[0m",
	"In Progress": "\x1b[34m◉\x1b[0m",
};

// ── Notion property extractors ────────────────────────────────────────────────
type NotionRichText = { plain_text: string }[];
type NotionSelect = { select: { name: string } | null };

const text = (arr?: NotionRichText): string =>
	arr?.map((t) => t.plain_text).join("") ?? "";

const sel = (prop?: NotionSelect): string | null => prop?.select?.name ?? null;

// ── Types ─────────────────────────────────────────────────────────────────────
interface Task {
	taskId: string;
	task: string;
	status: string;
	priority: string;
	sprint: string;
	category: string;
}

// biome-ignore lint/suspicious/noExplicitAny: Notion API response is untyped
function parsePage(page: any): Task {
	const p = page.properties;
	return {
		taskId: text(p["Task ID"]?.rich_text),
		task: text(p.Task?.title),
		status: sel(p.Status) ?? "Not Started",
		priority: sel(p.Priority) ?? "—",
		sprint: sel(p.Sprint) ?? "Unscheduled",
		category: sel(p.Category) ?? "—",
	};
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
	const result = (await callOnce({
		server: "notion",
		toolName: "API-query-data-source",
		args: {
			data_source_id: DATA_SOURCE_ID,
			filter: { property: "Status", select: { does_not_equal: "Done" } },
			sorts: [{ property: "Sort Order", direction: "ascending" }],
		},
	})) as { content: { text: string }[] };

	const data = JSON.parse(result.content[0].text) as { results: unknown[] };
	const tasks = data.results.map(parsePage);

	if (!tasks.length) {
		console.log(`\n  ${BOLD}All tasks done!${RESET}\n`);
		return;
	}

	const inProgress = tasks.filter((t) => t.status === "In Progress").length;
	const notStarted = tasks.length - inProgress;

	console.log(
		`\n  ${BOLD}AI Nexus Tasks${RESET}  ${DIM}${tasks.length} open (${inProgress} in progress, ${notStarted} not started)${RESET}\n`,
	);

	// Group by sprint
	const sprints = new Map<string, Task[]>();
	for (const t of tasks) {
		const s = t.sprint;
		sprints.set(s, [...(sprints.get(s) ?? []), t]);
	}

	for (const [sprint, items] of sprints) {
		const bar = "─".repeat(Math.max(0, 56 - sprint.length));
		console.log(`  ${CYAN}${BOLD}${sprint}${RESET} ${DIM}${bar}${RESET}`);

		for (const t of items) {
			const status = STATUS_ICON[t.status] ?? STATUS_ICON["Not Started"];
			const priority = PRIORITY_ICON[t.priority] ?? "·";
			const id = `#${t.taskId}`.padEnd(5);
			const cat = `[${t.category}]`.padEnd(14);
			console.log(
				`    ${status} ${priority} ${DIM}${id}${RESET} ${DIM}${cat}${RESET} ${t.task}`,
			);
		}
		console.log();
	}
}

main().catch((err) => {
	console.error(`\n  Failed to fetch tasks: ${err.message}\n`);
	if (err.message.includes("401") || err.message.includes("unauthorized")) {
		console.error(
			`  ${DIM}Check that NOTION_TOKEN in .env is valid.${RESET}\n`,
		);
	}
	process.exit(1);
});
