import { cn } from "@blazell/ui";
import { toast } from "@blazell/ui/toast";
import { formatBytes, generateID } from "@blazell/utils";
import type { Image } from "@blazell/validators";
import { UploadIcon } from "@radix-ui/react-icons";
import * as base64 from "base64-arraybuffer";
import { Console, Effect } from "effect";
import { useCallback } from "react";
import Dropzone, {
	type DropzoneProps,
	type FileRejection,
} from "react-dropzone";
import { ClientOnly } from "remix-utils/client-only";
//Shout out to sadman7
interface FileUploaderProps extends React.HTMLAttributes<HTMLDivElement> {
	/**
	 * Value of the uploader.
	 * @type File[]
	 * @default undefined
	 * @example value={files}
	 */
	files: Image[] | undefined;

	/**
	 * Function to be called when the value changes.
	 * @type React.Dispatch<React.SetStateAction<File[]>>
	 * @default undefined
	 * @example onValueChange={(files) => setFiles(files)}
	 */
	onFilesChange: (props: Image[]) => Promise<void>;

	onUploadCompleted?: () => Promise<void>;

	/**
	 * Progress of the uploaded files.
	 * @type Record<string, number> | undefined
	 * @default undefined
	 * @example progresses={{ "file1.png": 50 }}
	 */
	progresses?: Record<string, number>;

	/**
	 * Accepted file types for the uploader.
	 * @type { [key: string]: string[]}
	 * @default
	 * ```ts
	 * { "image/*": [] }
	 * ```
	 * @example accept={["image/png", "image/jpeg"]}
	 */
	accept?: DropzoneProps["accept"];

	/**
	 * Maximum file size for the uploader.
	 * @type number | undefined
	 * @default 1024 * 1024 * 2 // 2MB
	 * @example maxSize={1024 * 1024 * 2} // 2MB
	 */
	maxSize?: DropzoneProps["maxSize"];

	/**
	 * Maximum number of files for the uploader.
	 * @type number | undefined
	 * @default 1
	 * @example maxFiles={5}
	 */
	maxFiles?: DropzoneProps["maxFiles"];

	/**
	 * Whether the uploader should accept multiple files.
	 * @type boolean
	 * @default false
	 * @example multiple
	 */
	multiple?: boolean;

	/**
	 * Whether the uploader is disabled.
	 * @type boolean
	 * @default false
	 * @example disabled
	 */
	disabled?: boolean;
}

export function FileUpload(props: FileUploaderProps) {
	const {
		files,
		onFilesChange,
		progresses,
		accept = { "image/*": [] },
		maxSize = 1024 * 1024 * 2,
		maxFiles = 1,
		multiple = false,
		disabled = false,
		className,
		onUploadCompleted,
		...dropzoneProps
	} = props;

	const onDrop = useCallback(
		async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
			const effect = Effect.gen(function* () {
				if (!multiple && maxFiles === 1 && acceptedFiles.length > 1) {
					toast.error("Cannot upload more than 1 file at a time");
					return;
				}

				if ((files?.length ?? 0) + acceptedFiles.length > maxFiles) {
					toast.error(`Cannot upload more than ${maxFiles} files`);
					return;
				}

				const dbImages = (yield* Effect.forEach(
					acceptedFiles,
					(file, index) =>
						Effect.tryPromise(() => {
							return new Promise<Image>((resolve, reject) => {
								const fileReader = new FileReader();
								fileReader.onloadend = () => {
									if (fileReader.result instanceof ArrayBuffer) {
										const imageKey = generateID({ prefix: "img" });
										const base64String = base64.encode(fileReader.result);

										const image: Image = {
											id: imageKey,
											name: file.name,
											order: files?.length ?? 0 + index + 1,
											url: "",
											uploaded: false,
											base64: base64String,
											fileType: file.type,
										};

										resolve(image);
									} else {
										reject(new Error("Failed to read file as ArrayBuffer"));
									}
								};

								fileReader.readAsArrayBuffer(file);
							});
						}),
					{ concurrency: "unbounded" },
				).pipe(
					Effect.tap((images) => Console.log("Images", images)),
				)) as Image[];

				yield* Effect.tryPromise(() => onFilesChange(dbImages));

				if (rejectedFiles.length > 0) {
					for (const file of rejectedFiles) {
						toast.error(`File ${file.file.name} was rejected`);
					}
				}
			}).pipe(Effect.orDie);
			await Effect.runPromise(effect);
			await onUploadCompleted?.();
		},

		[files, maxFiles, multiple, onFilesChange, onUploadCompleted],
	);

	const isDisabled = disabled || (files?.length ?? 0) >= maxFiles;

	return (
		<div className="relative flex flex-col gap-6 overflow-hidden">
			<ClientOnly>
				{() => (
					<Dropzone
						onDrop={onDrop}
						accept={accept}
						maxSize={maxSize}
						maxFiles={maxFiles}
						multiple={maxFiles > 1 || multiple}
						disabled={isDisabled}
					>
						{({ getRootProps, getInputProps, isDragActive }) => (
							<div
								{...getRootProps()}
								className={cn(
									"group relative grid h-[10rem] w-full cursor-pointer place-items-center border-t border-border  px-5 py-2.5 text-center transition hover:bg-slate-2",
									"ring-offset-background focus-visible:outline outline-none focus:border-ring focus:border focus:rounded-lg  focus-visible:ring-1 outline-2 focus-visible:ring-ring  ",
									isDragActive && "border-slate-3",
									isDisabled && "pointer-events-none opacity-60",
									{ "border-b": files ? files.length > 0 : false },
									className,
								)}
								{...dropzoneProps}
							>
								<input {...getInputProps()} />
								{isDragActive ? (
									<div className="flex flex-col items-center justify-center gap-4 sm:px-5">
										<div className="rounded-full border border-dashed p-3">
											<UploadIcon
												className="size-5 text-muted-foreground"
												aria-hidden="true"
											/>
										</div>
										<p className="text-sm font-medium text-muted-foreground">
											Drop the files here
										</p>
									</div>
								) : (
									<div className="flex flex-col items-center justify-center gap-4 sm:px-5">
										<div className="rounded-full border border-dashed p-3">
											<UploadIcon
												className="size-5 text-muted-foreground"
												aria-hidden="true"
											/>
										</div>
										<div className="space-y-px">
											<p className="font-medium text-sm text-muted-foreground">
												Drag {`'n'`} drop files here, or click to select files
											</p>
											<p className="text-sm text-muted-foreground/70">
												You can upload
												{maxFiles > 1
													? ` ${
															maxFiles === Number.POSITIVE_INFINITY
																? "multiple"
																: maxFiles
														}
                      files (up to ${formatBytes(maxSize)} each)`
													: ` a file with ${formatBytes(maxSize)}`}
											</p>
										</div>
									</div>
								)}
							</div>
						)}
					</Dropzone>
				)}
			</ClientOnly>
		</div>
	);
}
