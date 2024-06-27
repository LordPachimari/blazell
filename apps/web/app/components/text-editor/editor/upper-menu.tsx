import { cn } from "@blazell/ui";
import { Icons } from "@blazell/ui/icons";
import { useCurrentEditor } from "@tiptap/react";

export const UpperMenu = () => {
	const { editor } = useCurrentEditor();
	if (!editor) {
		return null;
	}
	const commonClass =
		"bg-component border border-border hidden sm:flex size-9 p-2 justify-center items-center hover:bg-mauve-2 cursor-pointer rounded-lg text-mauve-11 hover:text-mauve-black focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2";
	return (
		<div className="border-t border-border w-full top-0 left-0 border-b bg-mauve-a-2 px-4 py-2 rounded-t-lg flex gap-2 mb-4 absolute">
			<button
				type="button"
				onClick={() => editor?.chain().focus().undo().run()}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						e.stopPropagation();
						editor?.chain().focus().undo().run();
					}
				}}
				disabled={!editor?.can().chain().focus().undo().run()}
				className={commonClass}
			>
				<Icons.Undo className="size-4" />
			</button>
			<button
				type="button"
				onClick={() => editor?.chain().focus().redo().run()}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						e.stopPropagation();
						editor?.chain().focus().redo().run();
					}
				}}
				disabled={!editor?.can().chain().focus().redo().run()}
				className={commonClass}
			>
				<Icons.Redo className="size-4" />
			</button>
			<button
				type="button"
				onClick={() => editor?.chain().focus().toggleBold().run()}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						e.stopPropagation();
						editor?.chain().focus().toggleBold().run();
					}
				}}
				disabled={!editor?.can().chain().focus().toggleBold().run()}
				className={cn(commonClass, {
					"bg-brand-3 text-brand-9 hover:bg-brand-4 hover:text-brand-11 border-brand-9":
						editor?.isActive("bold"),
				})}
			>
				<Icons.Bold className="size-4" />
			</button>
			<button
				type="button"
				onClick={() => editor?.chain().focus().toggleItalic().run()}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						e.stopPropagation();
						editor?.chain().focus().toggleItalic().run();
					}
				}}
				disabled={!editor?.can().chain().focus().toggleItalic().run()}
				className={cn(commonClass, {
					"bg-brand-3 text-brand-9 hover:bg-brand-4 hover:text-brand-11 border-brand-9":
						editor?.isActive("italic"),
				})}
			>
				<Icons.Italic className="size-4" />
			</button>
			<button
				type="button"
				onClick={() => editor?.chain().focus().toggleStrike().run()}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						e.stopPropagation();
						editor?.chain().focus().toggleStrike().run();
					}
				}}
				disabled={!editor?.can().chain().focus().toggleStrike().run()}
				className={cn(commonClass, {
					"bg-brand-3 text-brand-9 hover:bg-brand-4 hover:text-brand-11 border-brand-9":
						editor?.isActive("strike"),
				})}
			>
				<Icons.Strikethrough className="size-4" />
			</button>
			<button
				type="button"
				onClick={() => editor?.chain().focus().toggleCode().run()}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						e.stopPropagation();
						editor?.chain().focus().toggleCode().run();
					}
				}}
				disabled={!editor?.can().chain().focus().toggleCode().run()}
				className={cn(commonClass, {
					"bg-brand-3 text-brand-9 hover:bg-brand-4 hover:text-brand-11 border-brand-9":
						editor?.isActive("code"),
				})}
			>
				<Icons.Code className="size-4" />
			</button>

			<button
				type="button"
				onClick={() =>
					editor?.chain().focus().toggleHeading({ level: 1 }).run()
				}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						e.stopPropagation();
						editor?.chain().focus().toggleHeading({ level: 1 }).run();
					}
				}}
				className={cn(commonClass, {
					"bg-brand-3 text-brand-9 hover:bg-brand-4 hover:text-brand-11 border-brand-9":
						editor?.isActive("heading", { level: 1 }),
				})}
			>
				H1
			</button>
			<button
				type="button"
				onClick={() =>
					editor?.chain().focus().toggleHeading({ level: 2 }).run()
				}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						e.stopPropagation();
						editor?.chain().focus().toggleHeading({ level: 2 }).run();
					}
				}}
				className={cn(commonClass, {
					"bg-brand-3 text-brand-9 hover:bg-brand-4 hover:text-brand-11 border-brand-9":
						editor?.isActive("heading", { level: 2 }),
				})}
			>
				H2
			</button>
			<button
				type="button"
				onClick={() =>
					editor?.chain().focus().toggleHeading({ level: 3 }).run()
				}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						e.stopPropagation();
						editor?.chain().focus().toggleHeading({ level: 3 }).run();
					}
				}}
				className={cn(commonClass, {
					"bg-brand-3 text-brand-9 hover:bg-brand-4 hover:text-brand-11 border-brand-9":
						editor?.isActive("heading", { level: 3 }),
				})}
			>
				H3
			</button>
			<button
				type="button"
				onClick={() =>
					editor?.chain().focus().toggleHeading({ level: 4 }).run()
				}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						e.stopPropagation();
						editor?.chain().focus().toggleHeading({ level: 4 }).run();
					}
				}}
				className={cn(commonClass, {
					"bg-brand-3 text-brand-9 hover:bg-brand-4 hover:text-brand-11 border-brand-9":
						editor?.isActive("heading", { level: 4 }),
				})}
			>
				H4
			</button>

			<button
				type="button"
				onClick={() => editor?.chain().focus().toggleBulletList().run()}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						e.stopPropagation();
						editor?.chain().focus().toggleBulletList().run();
					}
				}}
				className={cn(commonClass, {
					"bg-brand-3 text-brand-9 hover:bg-brand-4 hover:text-brand-11 border-brand-9":
						editor?.isActive("bulletList"),
				})}
			>
				*
			</button>
			<button
				type="button"
				onClick={() => editor?.chain().focus().toggleOrderedList().run()}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						e.stopPropagation();
						editor?.chain().focus().toggleOrderedList().run();
					}
				}}
				className={cn(commonClass, {
					"bg-brand-3 text-brand-9 hover:bg-brand-4 hover:text-brand-11 border-brand-9":
						editor?.isActive("orderedList"),
				})}
			>
				<Icons.OrderedList className="size-4" />
			</button>
			<button
				type="button"
				onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						e.stopPropagation();
						editor?.chain().focus().toggleCodeBlock().run();
					}
				}}
				className={cn(commonClass, {
					"bg-brand-3 text-brand-9 hover:bg-brand-4 hover:text-brand-11 border-brand-9":
						editor?.isActive("codeBlock"),
				})}
			>
				<Icons.Code className="size-4" />
			</button>

			<button
				type="button"
				onClick={() => editor?.chain().focus().setHorizontalRule().run()}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						e.stopPropagation();
						editor?.chain().focus().setHorizontalRule().run();
					}
				}}
				className={cn(commonClass, {
					"bg-brand-3 text-brand-9 hover:bg-brand-4 hover:text-brand-11 border-brand-9":
						editor?.isActive("horizontal"),
				})}
			>
				<Icons.Horizontal className="size-4" />
			</button>
		</div>
	);
};
