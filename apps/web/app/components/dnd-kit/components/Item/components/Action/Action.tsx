import type React from "react";
import { forwardRef, type CSSProperties } from "react";

import styles from "./Action.module.css";
import { Button } from "@pachi/ui/button";
import { cn } from "@pachi/ui";

export interface Props extends React.HTMLAttributes<HTMLButtonElement> {
	active?: {
		fill: string;
		background: string;
	};
	cursor?: CSSProperties["cursor"];
}
export const Action = forwardRef<HTMLButtonElement, Props>(
	({ active, className, cursor, style, ...props }, ref) => {
		return (
			<Button
				variant="ghost"
				type="button"
				ref={ref}
				{...props}
				className={cn(styles.Action, className)}
				tabIndex={0}
				style={
					{
						...style,
						cursor,
						"--fill": active?.fill,
						"--background": active?.background,
					} as CSSProperties
				}
			/>
		);
	},
);
Action.displayName = "Action";
