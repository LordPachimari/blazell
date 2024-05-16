import { XIcon } from "lucide-react";
import { Action, type ActionProps } from "../Action";

export function Remove(props: ActionProps) {
	return (
		<Action
			{...props}
			active={{
				fill: "rgba(255, 70, 70, 0.95)",
				background: "rgba(255, 70, 70, 0.1)",
			}}
		>
			<XIcon
				className="text-red-500 dark:text-red-500 font-bold"
				fontSize={26}
			/>
		</Action>
	);
}
