import { useCallback } from "react";
import {
	EditorCommand,
	EditorCommandEmpty,
	EditorCommandItem,
	EditorCommandList,
	EditorContent,
	EditorRoot,
	type EditorInstance,
} from "./editor";
import { defaultExtensions } from "./extensions";

import debounce from "lodash.debounce";
import { slashCommand, suggestionItems } from "./slash-command";

import hljs from "highlight.js";
import { UpperMenu } from "./editor/upper-menu";
import { handleCommandNavigation } from "./extensions/slash-command";

const extensions = [...defaultExtensions, slashCommand];

const TextEditor = ({
	content,
	onUpdate,
}: {
	content: string | null | undefined;
	onUpdate: (value: string) => Promise<void>;
}) => {
	const highlightCodeblocks = (content: string) => {
		const doc = new DOMParser().parseFromString(content, "text/html");
		const codeBlocks = doc.querySelectorAll("pre code");
		for (const el of codeBlocks) {
			// @ts-ignore
			// https://highlightjs.readthedocs.io/en/latest/api.html?highlight=highlightElement#highlightelement
			hljs.highlightElement(el);
		}
		return new XMLSerializer().serializeToString(doc);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const debouncedUpdates = useCallback(
		debounce(async (editor: EditorInstance) => {
			await onUpdate(editor.storage.markdown.getMarkdown());
		}, 500),
		[highlightCodeblocks],
	);

	return (
		<div className="relative w-full max-w-screen-lg">
			<EditorRoot>
				<EditorContent
					extensions={extensions}
					{...(content && { initialContent: content })}
					className="relative w-full pb-4 px-4 py-16 min-h-[150px] border border-t-0 border-mauve-5 dark:border-mauve-7 rounded-b-lg rounded-t-lg"
					editorProps={{
						handleDOMEvents: {
							keydown: (_view, event) => handleCommandNavigation(event),
						},
						attributes: {
							class:
								"prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
						},
					}}
					onUpdate={({ editor }) => {
						debouncedUpdates(editor);
					}}
				>
					<UpperMenu />
					<EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
						<EditorCommandEmpty className="px-2 text-muted-foreground">
							No results
						</EditorCommandEmpty>
						<EditorCommandList>
							{suggestionItems.map((item) => (
								<EditorCommandItem
									value={item.title}
									onCommand={(val) => item.command?.(val)}
									className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
									key={item.title}
								>
									<div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
										{item.icon}
									</div>
									<div>
										<p className="font-medium">{item.title}</p>
										<p className="text-xs text-muted-foreground">
											{item.description}
										</p>
									</div>
								</EditorCommandItem>
							))}
						</EditorCommandList>
					</EditorCommand>
				</EditorContent>
			</EditorRoot>
		</div>
	);
};

export { TextEditor };
