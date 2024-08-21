import { Avatar, AvatarFallback, AvatarImage } from "@blazell/ui/avatar";
import { Button } from "@blazell/ui/button";
import { Card, CardContent, CardHeader } from "@blazell/ui/card";
import { Icons } from "@blazell/ui/icons";
import { Input } from "@blazell/ui/input";
import { Label } from "@blazell/ui/label";
import { Select, SelectTrigger } from "@blazell/ui/select";
import { useRequestInfo } from "~/hooks/use-request-info";

export default function General() {
	const { userContext } = useRequestInfo();
	const { authUser } = userContext;
	return (
		<div className="h-screen pt-16 lg:p-20 p-2 flex flex-col">
			<div className="p-4 h-20 border-b border-border w-full">
				<h1 className="text-4xl font-freeman">General</h1>
			</div>
			<section className="w-full flex">
				<div className="w-1/4 sm:w-full p-4 font-bold text-slate-11 text-xl">
					<h2>Details</h2>
				</div>
				<div className="w-3/4 sm:w-full p-4 sm:min-w-[350px]">
					<Card className="p-0">
						<CardHeader className="p-4 border-b border-border">
							<div className="flex gap-2">
								<Avatar className="size-9 rounded-lg">
									<AvatarImage
										className="rounded-lg"
										src={authUser?.avatar ?? undefined}
									/>
									<AvatarFallback className="rounded-lg">
										{authUser?.username?.slice(0, 2).toUpperCase() ??
											authUser?.fullName?.slice(0, 2).toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<Button variant={"outline"}>Upload image</Button>
							</div>
						</CardHeader>
						<CardContent className="p-0">
							<section className="p-4 w-full border-b border-border">
								<div className="flex w-full gap-2 ">
									<div className="w-full flex flex-col gap-2">
										<Label>First name</Label>
										<Input />
									</div>
									<div className="w-full flex flex-col gap-2">
										<Label>First name</Label>
										<Input />
									</div>
								</div>
								<p className="text-slate-11 text-sm py-3">
									Use your first and last name as they appear on your
									government-issued ID.
								</p>
							</section>
							<section className="p-4 w-full border-b border-border">
								<div className="flex w-full justify-between items-center">
									<div className=" flex flex-col gap-2">
										<Label className="text-sm text-slate-11">Email</Label>
										<p className="text-sm">{authUser?.email}</p>
									</div>
									<div className="flex flex-col gap-1">
										<Label className="text-sm text-slate-11">Verified</Label>
										<span className="w-full flex justify-center items-start">
											<Icons.CircleCheck className="text-jade-9" />
										</span>
									</div>
									<div className=" flex flex-col gap-2">
										<Button
											variant={"ghost"}
											className="rounded-lg size-9 p-0 border-transparent hover:border-border hover:bg-slate-3"
										>
											<Icons.Edit className="min-w-4 text-slate-10" />
										</Button>
									</div>
								</div>
							</section>
							<section className="p-4 w-full">
								<div className="flex w-full justify-between items-center">
									<div className=" flex flex-col gap-2">
										<Label className="text-sm text-slate-11">
											{"Phone number (optional)"}{" "}
										</Label>
										<p className="text-sm">
											{authUser?.phone ?? "No phone number"}
										</p>
									</div>
									{authUser?.phone && (
										<div className="flex flex-col gap-1">
											<Label className="text-sm text-slate-11">Verified</Label>
											<span className="w-full flex justify-center items-start">
												<Icons.CircleCheck className="text-jade-9" />
											</span>
										</div>
									)}
									<div className=" flex flex-col gap-2">
										<Button
											variant={"ghost"}
											className="rounded-lg size-9 p-0 border-transparent hover:border-border hover:bg-slate-3"
										>
											<Icons.Edit className="min-w-4 text-slate-10" />
										</Button>
									</div>
								</div>
							</section>
						</CardContent>
					</Card>
				</div>
			</section>

			<section className="w-full flex border-t">
				<div className="w-1/4 sm:w-full p-4 font-bold text-slate-11 text-xl">
					<h2>Stores</h2>
				</div>
				<div className="w-3/4 sm:w-full p-4 sm:min-w-[350px]" />
			</section>
			<section className="w-full flex border-t">
				<div className="w-1/4 sm:w-full p-4 font-bold text-slate-11 text-xl">
					<h2>Preferred language</h2>
				</div>
				<div className="w-3/4 sm:w-full p-4 sm:min-w-[350px]">
					<Card className="p-0">
						<CardContent className="p-0">
							<section className="p-4 w-full border-b border-border">
								<div className="w-full flex flex-col gap-2">
									<Label>Language</Label>
									<Select>
										<SelectTrigger />
									</Select>
								</div>
							</section>

							<section className="p-4 w-full border-b border-border">
								<h2 className="font-bold">Regional format</h2>
								<p className="text-sm text-slate-11 py-2">
									Your number, time, date, and currency formats are set for
									American English. Change regional format.
								</p>
							</section>
						</CardContent>
					</Card>
				</div>
			</section>
			<section className="w-full flex border-t">
				<div className="w-1/4 sm:w-full p-4 font-bold text-slate-11 text-xl">
					<h2>Timezone</h2>
				</div>
				<div className="w-3/4 sm:w-full p-4 sm:min-w-[350px]">
					<Card className="p-0">
						<CardContent className="p-0">
							<section className="p-4 w-full border-b border-border">
								<div className="w-full flex flex-col gap-2">
									<Label>Timezone</Label>
									<Select>
										<SelectTrigger />
									</Select>
									<p className="text-sm text-slate-11 py-2">
										Your number, time, date, and currency formats are set for
										American English. Change regional format.
									</p>
								</div>
							</section>
						</CardContent>
					</Card>
				</div>
			</section>
		</div>
	);
}
