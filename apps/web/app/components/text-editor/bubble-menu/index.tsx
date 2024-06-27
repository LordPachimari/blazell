import { BubbleMenu, useCurrentEditor } from "@tiptap/react";
import type { ReactNode } from "react";

interface GenerativeMenuSwitchProps {
	children: ReactNode;
}
const EditorBubbleMenu = ({ children }: GenerativeMenuSwitchProps) => {
	const { editor } = useCurrentEditor();
	return (
		<BubbleMenu
			editor={editor}
			className="flex w-fit max-w-[90vw] overflow-hidden rounded-md border border-muted bg-background shadow-xl"
		>
			{children}
		</BubbleMenu>
	);
};

export { EditorBubbleMenu };
