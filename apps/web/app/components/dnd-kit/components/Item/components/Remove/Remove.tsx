import { Action, type ActionProps } from "../Action";
import { Icons } from "@blazell/ui/icons";

export function Remove(props: ActionProps) {
	return (
		<Action
			{...props}
			active={{
				fill: "rgba(255, 70, 70, 0.95)",
				background: "rgba(255, 70, 70, 0.1)",
			}}
		>
			<Icons.Close className="text-ruby-9 font-bold" size={20} />
		</Action>
	);
}
