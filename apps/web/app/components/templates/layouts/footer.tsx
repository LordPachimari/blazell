export default function Footer() {
	return (
		<footer className="bg-component w-full border-t border-mauve-5 dark:border-mauve-7">
			<div className="max-w-screen-xl p-4 py-6 mx-auto lg:py-16 md:p-8 lg:p-10">
				<div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
					<div>
						<h3 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">
							Company
						</h3>
						<ul className="text-gray-500 dark:text-gray-400">
							<li className="mb-4">
								<a href="/" className="hover:underline">
									About
								</a>
							</li>
							<li className="mb-4">
								<a href="/" className="hover:underline">
									Careers
								</a>
							</li>
							<li className="mb-4">
								<a href="/" className="hover:underline">
									Brand Center
								</a>
							</li>
							<li className="mb-4">
								<a href="/" className="hover:underline">
									Blog
								</a>
							</li>
						</ul>
					</div>
					<div>
						<h3 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">
							Help Center
						</h3>
						<ul className="text-gray-500 dark:text-gray-400">
							<li className="mb-4">
								<a href="/" className="hover:underline">
									Contact Us
								</a>
							</li>
						</ul>
					</div>
					<div>
						<h3 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">
							Legal
						</h3>
						<ul className="text-gray-500 dark:text-gray-400">
							<li className="mb-4">
								<a href="/" className="hover:underline">
									Privacy Policy
								</a>
							</li>
							<li className="mb-4">
								<a href="/" className="hover:underline">
									Licensing
								</a>
							</li>
							<li className="mb-4">
								<a href="/" className="hover:underline">
									Terms
								</a>
							</li>
						</ul>
					</div>
					<div>
						<h3 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">
							Community
						</h3>
						<ul className="text-gray-500 dark:text-gray-400">
							<li className="mb-4">
								<a href="/" className="hover:underline">
									Discord
								</a>
							</li>
							<li className="mb-4">
								<a href="/" className="hover:underline">
									Twitter
								</a>
							</li>
							<li className="mb-4">
								<a href="/" className="hover:underline">
									Instagram
								</a>
							</li>
							<li className="mb-4">
								<a href="/" className="hover:underline">
									Tiktok
								</a>
							</li>
						</ul>
					</div>
				</div>

				<hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
				<div className="text-center">
					<span className="block text-sm text-center text-gray-500 dark:text-gray-400">
						© 2024 Blazell™. All Rights Reserved. Built by
						<a
							href="https://github.com/LordPachi"
							target="_blank"
							rel="noopener noreferrer"
							className="text-brand-9 pl-1 font-bold"
						>
							LordPachi
						</a>
						.
					</span>
					<ul className="flex justify-center mt-5 space-x-5">
						{/* SVG icons here for social media links */}
					</ul>
				</div>
			</div>
		</footer>
	);
}
