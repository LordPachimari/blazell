import { cn } from "@pachi/ui";
import type { RefObject } from "react";
import ReactCrop, {
	centerCrop,
	makeAspectCrop,
	type Crop,
	type PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Image } from "~/components/image";

const CropImage = ({
	src,
	setCompletedCrop,
	imgRef,
	isCropOpen,
	crop,
	setCrop,
}: {
	src: string | null;
	setCompletedCrop: (crop: PixelCrop) => void;
	imgRef: RefObject<HTMLImageElement>;
	isCropOpen: boolean;
	crop: Crop | undefined;
	setCrop: (crop: Crop) => void;
}) => {
	return (
		<div
			className={cn("w-[590px border-2 border-dashed border-mauve-7 m-2]", {
				hidden: !isCropOpen,
			})}
		>
			{src && (
				<ReactCrop
					{...(crop && { crop })}
					ruleOfThirds
					onChange={(_, percentCrop) => setCrop(percentCrop)}
					onComplete={(c) => setCompletedCrop(c)}
					aspect={3 / 1}
					minHeight={100}
				>
					<Image
						src={src}
						ref={imgRef}
						alt="image for crop"
						width={597}
						height={200}
					/>
				</ReactCrop>
			)}
		</div>
	);
};

export default CropImage;
