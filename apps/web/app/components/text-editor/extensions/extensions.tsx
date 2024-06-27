import { InputRule } from "@tiptap/core";
import Highlight from "@tiptap/extension-highlight";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import TiptapLink from "@tiptap/extension-link";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import TiptapUnderline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";

import CharacterCount from "@tiptap/extension-character-count";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import GlobalDragHandle from "tiptap-extension-global-drag-handle";

const simpleExtensions = [
	TiptapUnderline,
	Highlight.configure({
		multicolor: true,
	}),

	Markdown.configure({
		html: false,
		transformCopiedText: true,
	}),
] as const;

const Horizontal = HorizontalRule.extend({
	addInputRules() {
		return [
			new InputRule({
				find: /^(?:---|—-|___\s|\*\*\*\s)$/u,
				handler: ({ state, range }) => {
					const attributes = {};

					const { tr } = state;
					const start = range.from;
					const end = range.to;

					tr.insert(start - 1, this.type.create(attributes)).delete(
						tr.mapping.map(start),
						tr.mapping.map(end),
					);
				},
			}),
		];
	},
});

export {
	CodeBlockLowlight,
	Horizontal as HorizontalRule,
	InputRule,
	StarterKit,
	TaskItem,
	TaskList,
	TiptapLink,
	simpleExtensions,
	CharacterCount,
	GlobalDragHandle,
};
