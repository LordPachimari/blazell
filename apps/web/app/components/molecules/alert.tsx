import type { SetStateAction } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@blazell/ui/alert-dialog";

interface AlertDialogProps {
	title: string;
	description?: string;
	open: boolean;
	setIsOpen: (value: SetStateAction<boolean>) => void;
	onContinue?: () => Promise<void>;
}
export function AlertDialogComponent({
	title,
	description,
	open,
	setIsOpen,
	onContinue,
}: AlertDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={setIsOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={onContinue} type="submit">
						Continue
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
