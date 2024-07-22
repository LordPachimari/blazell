import { Radio, RadioGroup } from "@headlessui/react";
import { cn } from "@blazell/ui";
import { useState } from "react";

const payments = ["stripe"];
export const PaymentInfo = () => {
	const [selected, setSelected] = useState<string | undefined>(undefined);
	return (
		<section>
			<h1 className="text-xl text-slate-10 my-2">Payment</h1>
			<div className="flex my-2">
				<RadioGroup
					value={selected}
					onChange={setSelected}
					aria-label="Server size"
				>
					{payments.map((payment) => {
						return (
							<Radio
								key={payment}
								className="group relative flex cursor-pointer rounded-lg"
								value={payment}
							>
								<div
									className={cn(
										"flex items-center border group-data-[checked]:border-brand-3 border-slate-6 p-2 rounded-lg gap-2",
										{
											"group-data-[checked]:border-violet-400":
												payment === "stripe",
										},
									)}
								>
									<div className="text-sm/6">
										<p
											className={cn("font-semibold text-white", {
												"text-jade-9": payment === "stripe",
											})}
										>
											{payment}
										</p>
									</div>
								</div>
							</Radio>
						);
					})}
				</RadioGroup>
			</div>
		</section>
	);
};
