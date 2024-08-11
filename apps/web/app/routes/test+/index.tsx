import { Button } from "@blazell/ui/button";
import { LoadingSpinner } from "@blazell/ui/loading";

const Test = () => {
	return (
		<div className="w-screen h-screen flex justify-center items-center">
			<Button>
				<LoadingSpinner className="text-white size-4 mr-2" />
				Pending
			</Button>
		</div>
	);
};
export default Test;
