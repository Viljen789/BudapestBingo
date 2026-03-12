import {useState} from "react";
import {NavLink, useNavigate} from "react-router-dom";
import {Menu, X, LogOut, Map, LayoutGrid, Users, Target} from "lucide-react";
import {useStore} from "../store/useStore";
import {auth} from "../firebase";
import {signOut} from "firebase/auth";
import clsx from "clsx";

export default function Navbar() {
	const [isOpen, setIsOpen] = useState(false);
	const {currentUser} = useStore();
	const navigate = useNavigate();

	if (!currentUser) return null;

	const handleLogout = async () => {
		try {
			await signOut(auth);
			navigate("/");
		} catch (error) {
			console.error("Logout failed", error);
		}
	};

	const navLinks =
		currentUser.role === "admin" ?
			[
				{name: "Users", path: "/admin/users", icon: Users},
				{name: "Challenges", path: "/admin/challenges", icon: Target},
				{name: "Secrets", path: "/admin/secrets", icon: Map},
				{name: "Leaderboard", path: "/leaderboard", icon: Target},
			]
		:	[
				{name: "Challenges", path: "/user/challenges", icon: LayoutGrid},
				{name: "Secrets", path: "/user/secrets", icon: Map},
				{name: "Leaderboard", path: "/leaderboard", icon: Target},
			];

	return (
		<nav className="bg-budapest-red text-white shadow-lg sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					<div className="flex items-center">
						<span className="font-bold text-xl tracking-wider">
							Budapest Bingo 🇭🇺
						</span>
					</div>

					{/* Desktop Menu */}
					<div className="hidden md:block">
						<div className="ml-10 flex items-center space-x-4">
							{navLinks.map((link) => {
								const Icon = link.icon;
								return (
									<NavLink
										key={link.name}
										to={link.path}
										className={({isActive}) =>
											clsx(
												"flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
												isActive ?
													"bg-budapest-green text-white"
												:	"hover:bg-red-800 hover:text-white",
											)
										}
									>
										<Icon size={18} />
										<span>{link.name}</span>
									</NavLink>
								);
							})}
						</div>
					</div>

					<div className="hidden md:flex items-center space-x-4">
						<div className="text-sm border border-red-400 px-3 py-1 rounded-full bg-red-800/50">
							{currentUser.name}
						</div>
						<button
							onClick={handleLogout}
							className="p-2 rounded-md hover:bg-red-800 transition-colors"
							title="Logout"
						>
							<LogOut size={20} />
						</button>
					</div>

					{/* Mobile menu button */}
					<div className="md:hidden flex items-center">
						<button
							onClick={() => setIsOpen(!isOpen)}
							className="inline-flex items-center justify-center p-2 rounded-md hover:bg-red-800 focus:outline-none"
						>
							{isOpen ?
								<X size={24} />
							:	<Menu size={24} />}
						</button>
					</div>
				</div>
			</div>

			{/* Mobile Menu */}
			{isOpen && (
				<div className="md:hidden bg-budapest-red border-t border-red-800">
					<div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
						{navLinks.map((link) => {
							const Icon = link.icon;
							return (
								<NavLink
									key={link.name}
									to={link.path}
									onClick={() => setIsOpen(false)}
									className={({isActive}) =>
										clsx(
											"flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium transition-colors",
											isActive ?
												"bg-budapest-green text-white"
											:	"hover:bg-red-800 hover:text-white",
										)
									}
								>
									<Icon size={20} />
									<span>{link.name}</span>
								</NavLink>
							);
						})}

						<div className="pt-4 mt-2 border-t border-red-800">
							<div className="flex items-center px-3 mb-2">
								<div className="text-sm font-medium text-red-100">
									Logged in as: {currentUser.name}
								</div>
							</div>
							<button
								onClick={handleLogout}
								className="flex items-center space-x-3 w-full text-left px-3 py-3 rounded-md text-base font-medium hover:bg-red-800 hover:text-white transition-colors text-red-100"
							>
								<LogOut size={20} />
								<span>Logout</span>
							</button>
						</div>
					</div>
				</div>
			)}
		</nav>
	);
}
