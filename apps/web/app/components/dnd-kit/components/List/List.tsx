import type React from "react";
import { forwardRef } from "react";

import { cn } from "@pachi/ui";

import styles from "./List.module.css";

export interface Props {
	children: React.ReactNode;
	columns?: number;
	style?: React.CSSProperties;
	horizontal?: boolean;
}
export const List = forwardRef<HTMLUListElement, Props>(
	({ children, columns = 1, horizontal, style }: Props, ref) => {
		return (
			<ul
				ref={ref}
				style={
					{
						...style,
						"--columns": columns,
					} as React.CSSProperties
				}
				className={cn(styles.List, horizontal && styles.horizontal)}
			>
				{children}
			</ul>
		);
	},
);
List.displayName = "List";
