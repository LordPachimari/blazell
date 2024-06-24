import Placeholder from "@tiptap/extension-placeholder";
import {
	CharacterCount,
	CodeBlockLowlight,
	GlobalDragHandle,
	HorizontalRule,
	StarterKit,
	TaskItem,
	TaskList,
	TiptapLink,
} from "./extensions/extensions";
import { cx } from "class-variance-authority";
import { common, createLowlight } from "lowlight";

const placeholder = Placeholder.configure({
	placeholder: "Write description...",
	emptyEditorClass: "text-black",
});
const tiptapLink = TiptapLink.configure({
	HTMLAttributes: {
		class: cx(
			"text-muted-foreground underline underline-offset-[3px] hover:text-primary transition-colors cursor-pointer",
		),
	},
});

const taskList = TaskList.configure({
	HTMLAttributes: {
		class: cx("not-prose pl-2 "),
	},
});
const taskItem = TaskItem.configure({
	HTMLAttributes: {
		class: cx("flex gap-2 items-start my-4"),
	},
	nested: true,
});

const horizontalRule = HorizontalRule.configure({
	HTMLAttributes: {
		class: cx("mt-4 mb-6 border-t border-muted-foreground"),
	},
});

const starterKit = StarterKit.configure({
	paragraph: {
		HTMLAttributes: {
			class: cx("leading-6 m-0"),
		},
	},
	bulletList: {
		HTMLAttributes: {
			class: cx("list-disc list-outside leading-3 -mt-2"),
		},
	},
	orderedList: {
		HTMLAttributes: {
			class: cx("list-decimal list-outside leading-3 -mt-2"),
		},
	},
	listItem: {
		HTMLAttributes: {
			class: cx("leading-normal items-center -mb-2"),
		},
	},
	blockquote: {
		HTMLAttributes: {
			class: cx("border-l-4 border-primary"),
		},
	},
	codeBlock: {
		HTMLAttributes: {
			class: cx(
				"rounded-md bg-muted text-muted-foreground border p-5 font-mono font-medium",
			),
		},
	},
	code: {
		HTMLAttributes: {
			class: cx("rounded-md bg-muted  px-1.5 py-1 font-mono font-medium"),
			spellcheck: "false",
		},
	},
	horizontalRule: false,
	dropcursor: {
		color: "#DBEAFE",
		width: 4,
	},
	gapcursor: false,
});

const codeBlockLowlight = CodeBlockLowlight.configure({
	// configure lowlight: common /  all / use highlightJS in case there is a need to specify certain language grammars only
	// common: covers 37 language grammars which should be good enough in most cases
	lowlight: createLowlight(common),
});

const characterCount = CharacterCount.configure();

export const defaultExtensions = [
	starterKit,
	placeholder,
	tiptapLink,
	taskList,
	taskItem,
	horizontalRule,
	codeBlockLowlight,
	characterCount,
	GlobalDragHandle,
];
