import { DotsHorizontalIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import {
	AlignCenter,
	AlignJustify,
	AlignLeft,
	AlignRight,
	ArrowLeft,
	BadgeDollarSign,
	Bell,
	Bold,
	Bookmark,
	Check,
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
	CircleCheck,
	CircleUserRound,
	CircleX,
	Code,
	Contact,
	Copy,
	CopyCheck,
	CreditCard,
	Earth,
	Flame,
	GalleryThumbnails,
	Info,
	Italic,
	Laptop,
	ListOrdered,
	LoaderCircle,
	LogOut,
	Menu,
	Minus,
	MinusCircle,
	Moon,
	PackageOpen,
	PanelLeftClose,
	PanelRightClose,
	Plus,
	PlusCircle,
	Quote,
	RectangleEllipsis,
	Redo,
	Rocket,
	Search,
	Settings,
	ShoppingBag,
	ShoppingCart,
	SquareCheckBig,
	SquarePen,
	SquareUserRound,
	SquareX,
	Star,
	Store,
	Strikethrough,
	Sun,
	Trash,
	Underline,
	Undo,
	WalletCards,
	X,
	Youtube,
	type LucideIcon,
	type LucideProps,
} from "lucide-react";

export type Icon = LucideIcon;
export const strokeWidth = 1.5;
export const Icons = {
	Search,
	Store: Store,
	Product: PackageOpen,
	Order: ShoppingBag,
	Billing: WalletCards,
	Customer: Contact,
	User: CircleUserRound,
	Dashboard: Rocket,
	Marketplace: Earth,
	Settings: Settings,
	Sun: Sun,
	Moon: Moon,
	Left: ChevronLeft,
	DoubleLeft: ChevronsLeft,
	Right: ChevronRight,
	DoubleRight: ChevronsRight,
	CreditCard: CreditCard,
	Close: X,
	Edit: SquarePen,
	Copy: Copy,
	CopyCheck: CopyCheck,
	Minus: Minus,
	MinusCircle: MinusCircle,
	Plus: Plus,
	PlusCircle: PlusCircle,
	Menu: Menu,
	Trash: Trash,
	Laptop: Laptop,
	Loader: LoaderCircle,
	CircleCheck: CircleCheck,
	CircleError: CircleX,
	CircleInfo: Info,
	Star,
	Bookmark,
	ShoppingCart,
	MagnifyingGlassIcon: MagnifyingGlassIcon,
	Notification: Bell,
	ArrowLeft: ArrowLeft,
	Undo: Undo,
	Redo: Redo,
	Bold: Bold,
	Italic: Italic,
	Underline: Underline,
	Strikethrough: Strikethrough,
	AlignLeft,
	AlignRight,
	AlignCenter,
	AlignJustify,
	Code,
	OrderedList: ListOrdered,
	Quote,
	Horizontal: Minus,
	BadgeDollarSign,
	Check,
	Youtube,
	PanelRightClose,
	PanelLeftClose,
	Dots: DotsHorizontalIcon,
	Logout: LogOut,
	Thumbnail: GalleryThumbnails,
	SquareCheck: SquareCheckBig,
	Cancel: SquareX,
	Pending: RectangleEllipsis,
	SquareUser: SquareUserRound,
	Flame,
	UPC: (props: LucideProps) => (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" {...props}>
			<g clipPath="url(#a)">
				<title>UPC</title>
				<path fill="#300" d="M0 0h18v18H0V0Z" />
				<g clipPath="url(#b)">
					<path
						fill="#300"
						d="M5.488 13.333c-.845-.692-1.292-1.688-1.292-2.878V4.8C5.531 4.092 7.147 3.734 9 3.734c1.853 0 3.47.358 4.804 1.066v5.655c0 1.19-.447 2.185-1.292 2.878-.773.633-3.23 1.711-3.512 1.834-.282-.123-2.739-1.2-3.512-1.834Z"
					/>
					<path
						fill="#FFBE00"
						d="M13.54 4.733a20.707 20.707 0 0 0-1.912-.095c-2.423 0-5.02.521-7.169 2.49v3.368c0 1.096.406 2.012 1.177 2.64.68.554 2.774 1.502 3.364 1.763.583-.257 2.671-1.193 3.364-1.763.775-.639 1.176-1.533 1.176-2.64V4.733Zm-8.637 5.413V7.41h.87v2.773c0 .247.06.612.458.612a.729.729 0 0 0 .411-.107V7.411h.868v3.774a2.314 2.314 0 0 1-1.31.35c-.861 0-1.298-.468-1.298-1.39m3.926 3.157h-.87v-5.67c.352-.216.76-.323 1.172-.309 1.039 0 1.61.788 1.61 2.056s-.554 2.14-1.52 2.14a1.377 1.377 0 0 1-.392-.05v1.833Zm0-2.543c.09.034.186.051.282.052.5 0 .74-.459.74-1.41 0-.975-.21-1.378-.714-1.378a.759.759 0 0 0-.309.063v2.673Zm2.108-2.302a1.155 1.155 0 0 1 1.168-1.134 1.49 1.49 0 0 1 .954.283v.756a1.165 1.165 0 0 0-.779-.357c-.246-.002-.503.106-.511.416-.009.316.247.441.57.632.728.427.868.81.851 1.318-.016.556-.4 1.164-1.26 1.164a1.903 1.903 0 0 1-.955-.27v-.802c.23.208.522.333.831.354.32.002.53-.18.522-.484-.007-.273-.161-.422-.544-.647-.717-.42-.846-.767-.847-1.23m-5.592 5.035C4.464 12.77 4 11.734 4 10.496V4.61C5.39 3.873 7.071 3.5 9 3.5c1.929 0 3.61.373 5 1.11v5.886c0 1.238-.464 2.274-1.345 2.995-.804.66-3.361 1.782-3.655 1.91-.294-.128-2.85-1.25-3.656-1.91Zm6.848 1.234v.51h.092v-.213h.013l.138.213h.112l-.154-.224a.135.135 0 0 0 .113-.135.148.148 0 0 0-.17-.15l-.144-.001Zm.134.074c.078 0 .09.039.09.072 0 .048-.021.08-.12.08h-.012v-.152h.042Zm.36.182a.346.346 0 1 1-.69 0 .346.346 0 0 1 .69 0Zm-.347-.42a.42.42 0 1 0 .001.838.42.42 0 0 0 0-.838Z"
					/>
				</g>
			</g>
			<defs>
				<clipPath id="a">
					<path fill="#fff" d="M0 0h18v18H0z" />
				</clipPath>
				<clipPath id="b">
					<path fill="#fff" d="M4 3.5h10v11.901H4z" />
				</clipPath>
			</defs>
		</svg>
	),
	FedEx: (props: LucideProps) => (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" {...props}>
			<title>FedEx</title>
			<g clipPath="url(#a)">
				<path fill="#2A007C" d="M0 0h18v18H0V0Z" />
				<path
					fill="#FF5900"
					d="m14.24 8.371.62.684.598-.684h1.275l-1.246 1.402 1.263 1.413h-1.327l-.614-.69-.61.69h-1.28l1.252-1.407-1.252-1.408h1.32Zm-1.322-.001v.95H11.5v.873h1.418v.991h-2.461V6.75h2.461v.988H11.5v.631h1.418Z"
				/>
				<path
					fill="#fff"
					d="M9.42 6.75v1.815h-.012c-.23-.265-.517-.356-.85-.356-.683 0-1.197.464-1.378 1.077-.206-.676-.737-1.09-1.524-1.09-.639 0-1.144.287-1.407.754v-.58H2.928v-.632H4.37V6.75H1.75v4.434h1.178V9.32h1.174a1.767 1.767 0 0 0-.054.439c0 .924.707 1.574 1.608 1.574.759 0 1.258-.357 1.523-1.005h-1.01c-.136.195-.24.253-.513.253a.606.606 0 0 1-.59-.604h2.056c.09.735.662 1.368 1.447 1.368.339 0 .649-.166.838-.448h.012v.287h1.038V6.75H9.419ZM5.1 9.333c.065-.281.284-.465.557-.465.3 0 .507.178.562.465h-1.12Zm3.689 1.176c-.383 0-.62-.357-.62-.729 0-.398.206-.78.62-.78.429 0 .6.382.6.78 0 .377-.181.729-.6.729Z"
				/>
			</g>
			<defs>
				<clipPath id="a">
					<path fill="#fff" d="M0 0h18v18H0z" />
				</clipPath>
			</defs>
		</svg>
	),
	Paypal: (props: LucideProps) => (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" {...props}>
			<title>Paypal</title>
			<g clipPath="url(#a)">
				<path fill="#003087" d="M0 0h18v18H0V0Z" />
				<path
					fill="#B5C0D9"
					d="M12.493 6.455c.027-1.391-1.121-2.46-2.7-2.46H6.53a.32.32 0 0 0-.316.27L4.905 12.44a.26.26 0 0 0 .256.3h1.935l-.303 1.893a.26.26 0 0 0 .256.3h1.576a.305.305 0 0 0 .202-.077c.057-.05.067-.118.079-.193l.462-2.722a.395.395 0 0 1 .108-.222.263.263 0 0 1 .184-.076h.965a3.112 3.112 0 0 0 3.097-2.627c.17-1.085-.295-2.072-1.229-2.561Z"
				/>
				<path
					fill="#0070E0"
					d="m7.514 9.725-.482 3.055-.302 1.916a.26.26 0 0 0 .256.3h1.668a.32.32 0 0 0 .315-.27l.44-2.785a.32.32 0 0 1 .315-.27h.982a3.137 3.137 0 0 0 3.097-2.655c.17-1.085-.377-2.072-1.31-2.561-.002.115-.013.23-.03.345a3.137 3.137 0 0 1-3.098 2.656H7.83a.32.32 0 0 0-.315.269Z"
				/>
				<path
					fill="#fff"
					d="M7.032 12.78h-1.94a.258.258 0 0 1-.256-.3l1.308-8.295a.32.32 0 0 1 .315-.27h3.335c1.578 0 2.726 1.149 2.699 2.54a2.914 2.914 0 0 0-1.36-.324h-2.78a.32.32 0 0 0-.315.27l-.524 3.324-.482 3.055Z"
				/>
			</g>
			<defs>
				<clipPath id="a">
					<path fill="#fff" d="M0 0h18v18H0z" />
				</clipPath>
			</defs>
		</svg>
	),
	Mastercard: (props: LucideProps) => (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" {...props}>
			<title>Mastercard</title>
			<path d="M0 0h18v18H0V0Z" />
			<path
				fill="#EB001B"
				d="M6.8 12.3a3.3 3.3 0 1 0 0-6.6 3.3 3.3 0 0 0 0 6.6Z"
			/>
			<path
				fill="#F79E1B"
				d="M11.2 12.3a3.3 3.3 0 1 0 0-6.6 3.3 3.3 0 0 0 0 6.6Z"
			/>
			<path
				fill="#FF5F00"
				d="M9 11.46A3.29 3.29 0 0 0 10.1 9 3.29 3.29 0 0 0 9 6.54 3.293 3.293 0 0 0 7.9 9 3.29 3.29 0 0 0 9 11.46Z"
			/>
		</svg>
	),
	Visa: (props: LucideProps) => (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" {...props}>
			<title>Visa</title>
			<g clipPath="url(#a)">
				<mask
					id="b"
					width="18"
					height="18"
					x="0"
					y="0"
					maskUnits="userSpaceOnUse"
				>
					<path fill="#fff" d="M0 0h18v18H0V0Z" />
				</mask>
				<g mask="url(#b)">
					<path fill="#1C33C3" d="M0 0h18v18H0V0Z" />
					<path
						fill="url(#c)"
						d="m10.921 5-2.079 5.371L7.976 5.8c-.116-.514-.52-.8-.924-.8H4.058L4 5.229c.693.171 1.214.342 1.676.571.144.072.264.2.337.743L7.514 13H9.65L13 5h-2.079Z"
					/>
				</g>
			</g>
			<defs>
				<linearGradient
					id="c"
					x1="76.693"
					x2="78.251"
					y1="108.504"
					y2="45.982"
					gradientUnits="userSpaceOnUse"
				>
					<stop offset="1" stopColor="#fff" />
				</linearGradient>
				<clipPath id="a">
					<path fill="#fff" d="M0 0h18v18H0z" />
				</clipPath>
			</defs>
		</svg>
	),

	GitHub: (props: LucideProps) => (
		<svg viewBox="0 0 438.549 438.549" {...props}>
			<title>Github</title>
			<path
				fill="currentColor"
				d="M409.132 114.573c-19.608-33.596-46.205-60.194-79.798-79.8-33.598-19.607-70.277-29.408-110.063-29.408-39.781 0-76.472 9.804-110.063 29.408-33.596 19.605-60.192 46.204-79.8 79.8C9.803 148.168 0 184.854 0 224.63c0 47.78 13.94 90.745 41.827 128.906 27.884 38.164 63.906 64.572 108.063 79.227 5.14.954 8.945.283 11.419-1.996 2.475-2.282 3.711-5.14 3.711-8.562 0-.571-.049-5.708-.144-15.417a2549.81 2549.81 0 01-.144-25.406l-6.567 1.136c-4.187.767-9.469 1.092-15.846 1-6.374-.089-12.991-.757-19.842-1.999-6.854-1.231-13.229-4.086-19.13-8.559-5.898-4.473-10.085-10.328-12.56-17.556l-2.855-6.57c-1.903-4.374-4.899-9.233-8.992-14.559-4.093-5.331-8.232-8.945-12.419-10.848l-1.999-1.431c-1.332-.951-2.568-2.098-3.711-3.429-1.142-1.331-1.997-2.663-2.568-3.997-.572-1.335-.098-2.43 1.427-3.289 1.525-.859 4.281-1.276 8.28-1.276l5.708.853c3.807.763 8.516 3.042 14.133 6.851 5.614 3.806 10.229 8.754 13.846 14.842 4.38 7.806 9.657 13.754 15.846 17.847 6.184 4.093 12.419 6.136 18.699 6.136 6.28 0 11.704-.476 16.274-1.423 4.565-.952 8.848-2.383 12.847-4.285 1.713-12.758 6.377-22.559 13.988-29.41-10.848-1.14-20.601-2.857-29.264-5.14-8.658-2.286-17.605-5.996-26.835-11.14-9.235-5.137-16.896-11.516-22.985-19.126-6.09-7.614-11.088-17.61-14.987-29.979-3.901-12.374-5.852-26.648-5.852-42.826 0-23.035 7.52-42.637 22.557-58.817-7.044-17.318-6.379-36.732 1.997-58.24 5.52-1.715 13.706-.428 24.554 3.853 10.85 4.283 18.794 7.952 23.84 10.994 5.046 3.041 9.089 5.618 12.135 7.708 17.705-4.947 35.976-7.421 54.818-7.421s37.117 2.474 54.823 7.421l10.849-6.849c7.419-4.57 16.18-8.758 26.262-12.565 10.088-3.805 17.802-4.853 23.134-3.138 8.562 21.509 9.325 40.922 2.279 58.24 15.036 16.18 22.559 35.787 22.559 58.817 0 16.178-1.958 30.497-5.853 42.966-3.9 12.471-8.941 22.457-15.125 29.979-6.191 7.521-13.901 13.85-23.131 18.986-9.232 5.14-18.182 8.85-26.84 11.136-8.662 2.286-18.415 4.004-29.263 5.146 9.894 8.562 14.842 22.077 14.842 40.539v60.237c0 3.422 1.19 6.279 3.572 8.562 2.379 2.279 6.136 2.95 11.276 1.995 44.163-14.653 80.185-41.062 108.068-79.226 27.88-38.161 41.825-81.126 41.825-128.906-.01-39.771-9.818-76.454-29.414-110.049z"
			/>
		</svg>
	),
	Google: ({ ...props }: LucideProps) => (
		<svg
			aria-hidden="true"
			focusable="false"
			data-prefix="fab"
			data-icon="discord"
			role="img"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 488 512"
			{...props}
		>
			<title>google</title>
			<path
				fill="currentColor"
				d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
			/>
		</svg>
	),
	Facebook: ({ ...props }: LucideProps) => (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" {...props}>
			<title>facebook</title>
			<path
				fill="currentColor"
				d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"
			/>
		</svg>
	),
	Instagram: ({ ...props }: LucideProps) => (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" {...props}>
			<title>Instagram</title>
			<path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
		</svg>
	),
	Discord: ({ ...props }: LucideProps) => (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" {...props}>
			<title>discord</title>
			<path
				fill="currentColor"
				d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"
			/>
		</svg>
	),
	Pinterest: ({ ...props }: LucideProps) => (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18 " {...props}>
			<title>Pinterest</title>
			<g clipPath="url(#a)">
				<path fill="#fff" d="M0 0h18v18H0V0Z" />
				<path
					fill="#E60023"
					d="M9.004 3.5A5.5 5.5 0 0 0 3.5 8.996a5.498 5.498 0 0 0 3.498 5.119c-.05-.433-.091-1.103.018-1.577.099-.43.643-2.733.643-2.733s-.163-.33-.163-.814c0-.764.444-1.334.997-1.334.47 0 .697.352.697.773 0 .471-.299 1.176-.457 1.832-.132.547.276.995.815.995.979 0 1.731-1.032 1.731-2.514 0-1.317-.947-2.236-2.302-2.236-1.568 0-2.486 1.172-2.486 2.384 0 .47.18.977.407 1.254a.163.163 0 0 1 .036.157c-.04.173-.136.548-.154.625-.022.1-.081.121-.186.072-.688-.322-1.118-1.32-1.118-2.13 0-1.732 1.26-3.324 3.637-3.324 1.908 0 3.394 1.356 3.394 3.174 0 1.896-1.197 3.42-2.855 3.42-.557 0-1.082-.289-1.26-.633l-.344 1.307c-.122.48-.457 1.076-.684 1.443a5.539 5.539 0 0 0 3.737-.173 5.502 5.502 0 0 0 2.985-7.185A5.49 5.49 0 0 0 9.004 3.5Z"
				/>
			</g>
			<defs>
				<clipPath id="a">
					<path fill="#fff" d="M0 0h18v18H0z" />
				</clipPath>
			</defs>
		</svg>
	),
	Notion: () => (
		<svg
			width="100"
			height="100"
			viewBox="0 0 100 100"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<title>Notion</title>
			<path
				d="M6.017 4.313l55.333 -4.087c6.797 -0.583 8.543 -0.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277 -1.553 6.807 -6.99 7.193L24.467 99.967c-4.08 0.193 -6.023 -0.39 -8.16 -3.113L3.3 79.94c-2.333 -3.113 -3.3 -5.443 -3.3 -8.167V11.113c0 -3.497 1.553 -6.413 6.017 -6.8z"
				fill="#ffffff"
			/>
			<path
				d="M61.35 0.227l-55.333 4.087C1.553 4.7 0 7.617 0 11.113v60.66c0 2.723 0.967 5.053 3.3 8.167l13.007 16.913c2.137 2.723 4.08 3.307 8.16 3.113l64.257 -3.89c5.433 -0.387 6.99 -2.917 6.99 -7.193V20.64c0 -2.21 -0.873 -2.847 -3.443 -4.733L74.167 3.143c-4.273 -3.107 -6.02 -3.5 -12.817 -2.917zM25.92 19.523c-5.247 0.353 -6.437 0.433 -9.417 -1.99L8.927 11.507c-0.77 -0.78 -0.383 -1.753 1.557 -1.947l53.193 -3.887c4.467 -0.39 6.793 1.167 8.54 2.527l9.123 6.61c0.39 0.197 1.36 1.36 0.193 1.36l-54.933 3.307 -0.68 0.047zM19.803 88.3V30.367c0 -2.53 0.777 -3.697 3.103 -3.893L86 22.78c2.14 -0.193 3.107 1.167 3.107 3.693v57.547c0 2.53 -0.39 4.67 -3.883 4.863l-60.377 3.5c-3.493 0.193 -5.043 -0.97 -5.043 -4.083zm59.6 -54.827c0.387 1.75 0 3.5 -1.75 3.7l-2.91 0.577v42.773c-2.527 1.36 -4.853 2.137 -6.797 2.137 -3.107 0 -3.883 -0.973 -6.21 -3.887l-19.03 -29.94v28.967l6.02 1.363s0 3.5 -4.857 3.5l-13.39 0.777c-0.39 -0.78 0 -2.723 1.357 -3.11l3.497 -0.97v-38.3L30.48 40.667c-0.39 -1.75 0.58 -4.277 3.3 -4.473l14.367 -0.967 19.8 30.327v-26.83l-5.047 -0.58c-0.39 -2.143 1.163 -3.7 3.103 -3.89l13.4 -0.78z"
				fill="#000000"
				fillRule="evenodd"
				clipRule="evenodd"
			/>
		</svg>
	),
	OpenAi: () => (
		<svg
			width="100"
			height="100"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<title>OpenAI</title>
			<path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
		</svg>
	),
	WhatsApp: () => (
		<svg
			width="100"
			height="100"
			viewBox="0 0 175.216 175.552"
			xmlns="http://www.w3.org/2000/svg"
		>
			<title>WhatsApp</title>
			<defs>
				<linearGradient
					id="b"
					x1="85.915"
					x2="86.535"
					y1="32.567"
					y2="137.092"
					gradientUnits="userSpaceOnUse"
				>
					<stop offset="0" stopColor="#57d163" />
					<stop offset="1" stopColor="#23b33a" />
				</linearGradient>
				<filter
					id="a"
					width="1.115"
					height="1.114"
					x="-.057"
					y="-.057"
					colorInterpolationFilters="sRGB"
				>
					<feGaussianBlur stdDeviation="3.531" />
				</filter>
			</defs>
			<path
				d="m54.532 138.45 2.235 1.324c9.387 5.571 20.15 8.518 31.126 8.523h.023c33.707 0 61.139-27.426 61.153-61.135.006-16.335-6.349-31.696-17.895-43.251A60.75 60.75 0 0 0 87.94 25.983c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.312-6.179 22.558zm-40.811 23.544L24.16 123.88c-6.438-11.154-9.825-23.808-9.821-36.772.017-40.556 33.021-73.55 73.578-73.55 19.681.01 38.154 7.669 52.047 21.572s21.537 32.383 21.53 52.037c-.018 40.553-33.027 73.553-73.578 73.553h-.032c-12.313-.005-24.412-3.094-35.159-8.954zm0 0"
				fill="#b3b3b3"
				filter="url(#a)"
			/>
			<path
				d="m12.966 161.238 10.439-38.114a73.42 73.42 0 0 1-9.821-36.772c.017-40.556 33.021-73.55 73.578-73.55 19.681.01 38.154 7.669 52.047 21.572s21.537 32.383 21.53 52.037c-.018 40.553-33.027 73.553-73.578 73.553h-.032c-12.313-.005-24.412-3.094-35.159-8.954z"
				fill="#ffffff"
			/>
			<path
				d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.312-6.179 22.559 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.518 31.126 8.524h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.929z"
				fill="url(#linearGradient1780)"
			/>
			<path
				d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.313-6.179 22.558 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.517 31.126 8.523h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.928z"
				fill="url(#b)"
			/>
			<path
				d="M68.772 55.603c-1.378-3.061-2.828-3.123-4.137-3.176l-3.524-.043c-1.226 0-3.218.46-4.902 2.3s-6.435 6.287-6.435 15.332 6.588 17.785 7.506 19.013 12.718 20.381 31.405 27.75c15.529 6.124 18.689 4.906 22.061 4.6s10.877-4.447 12.408-8.74 1.532-7.971 1.073-8.74-1.685-1.226-3.525-2.146-10.877-5.367-12.562-5.981-2.91-.919-4.137.921-4.746 5.979-5.819 7.206-2.144 1.381-3.984.462-7.76-2.861-14.784-9.124c-5.465-4.873-9.154-10.891-10.228-12.73s-.114-2.835.808-3.751c.825-.824 1.838-2.147 2.759-3.22s1.224-1.84 1.836-3.065.307-2.301-.153-3.22-4.032-10.011-5.666-13.647"
				fill="#ffffff"
				fillRule="evenodd"
			/>
		</svg>
	),
	Messenger: () => (
		<svg
			width="100"
			height="100"
			viewBox="0 0 48 48"
			xmlns="http://www.w3.org/2000/svg"
		>
			<title>Messenger</title>
			<radialGradient
				id="8O3wK6b5ASW2Wn6hRCB5xa_YFbzdUk7Q3F8_gr1"
				cx="11.087"
				cy="7.022"
				r="47.612"
				gradientTransform="matrix(1 0 0 -1 0 50)"
				gradientUnits="userSpaceOnUse"
			>
				<stop offset="0" stopColor="#1292ff" />
				<stop offset=".079" stopColor="#2982ff" />
				<stop offset=".23" stopColor="#4e69ff" />
				<stop offset=".351" stopColor="#6559ff" />
				<stop offset=".428" stopColor="#6d53ff" />
				<stop offset=".754" stopColor="#df47aa" />
				<stop offset=".946" stopColor="#ff6257" />
			</radialGradient>
			<path
				fill="url(#8O3wK6b5ASW2Wn6hRCB5xa_YFbzdUk7Q3F8_gr1)"
				d="M44,23.5C44,34.27,35.05,43,24,43c-1.651,0-3.25-0.194-4.784-0.564	c-0.465-0.112-0.951-0.069-1.379,0.145L13.46,44.77C12.33,45.335,11,44.513,11,43.249v-4.025c0-0.575-0.257-1.111-0.681-1.499	C6.425,34.165,4,29.11,4,23.5C4,12.73,12.95,4,24,4S44,12.73,44,23.5z"
			/>
			<path
				d="M34.992,17.292c-0.428,0-0.843,0.142-1.2,0.411l-5.694,4.215	c-0.133,0.1-0.28,0.15-0.435,0.15c-0.15,0-0.291-0.047-0.41-0.136l-3.972-2.99c-0.808-0.601-1.76-0.918-2.757-0.918	c-1.576,0-3.025,0.791-3.876,2.116l-1.211,1.891l-4.12,6.695c-0.392,0.614-0.422,1.372-0.071,2.014	c0.358,0.654,1.034,1.06,1.764,1.06c0.428,0,0.843-0.142,1.2-0.411l5.694-4.215c0.133-0.1,0.28-0.15,0.435-0.15	c0.15,0,0.291,0.047,0.41,0.136l3.972,2.99c0.809,0.602,1.76,0.918,2.757,0.918c1.576,0,3.025-0.791,3.876-2.116l1.211-1.891	l4.12-6.695c0.392-0.614,0.422-1.372,0.071-2.014C36.398,17.698,35.722,17.292,34.992,17.292L34.992,17.292z"
				opacity=".05"
			/>
			<path
				d="M34.992,17.792c-0.319,0-0.63,0.107-0.899,0.31l-5.697,4.218	c-0.216,0.163-0.468,0.248-0.732,0.248c-0.259,0-0.504-0.082-0.71-0.236l-3.973-2.991c-0.719-0.535-1.568-0.817-2.457-0.817	c-1.405,0-2.696,0.705-3.455,1.887l-1.21,1.891l-4.115,6.688c-0.297,0.465-0.32,1.033-0.058,1.511c0.266,0.486,0.787,0.8,1.325,0.8	c0.319,0,0.63-0.107,0.899-0.31l5.697-4.218c0.216-0.163,0.468-0.248,0.732-0.248c0.259,0,0.504,0.082,0.71,0.236l3.973,2.991	c0.719,0.535,1.568,0.817,2.457,0.817c1.405,0,2.696-0.705,3.455-1.887l1.21-1.891l4.115-6.688c0.297-0.465,0.32-1.033,0.058-1.511	C36.051,18.106,35.531,17.792,34.992,17.792L34.992,17.792z"
				opacity=".07"
			/>
			<path
				fill="#ffffff"
				d="M34.394,18.501l-5.7,4.22c-0.61,0.46-1.44,0.46-2.04,0.01L22.68,19.74	c-1.68-1.25-4.06-0.82-5.19,0.94l-1.21,1.89l-4.11,6.68c-0.6,0.94,0.55,2.01,1.44,1.34l5.7-4.22c0.61-0.46,1.44-0.46,2.04-0.01	l3.974,2.991c1.68,1.25,4.06,0.82,5.19-0.94l1.21-1.89l4.11-6.68C36.434,18.901,35.284,17.831,34.394,18.501z"
			/>
		</svg>
	),
};
