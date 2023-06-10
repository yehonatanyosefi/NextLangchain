'use client'
import HamburgerMenu from './components/HamburgerMenu'
const Navbar = () => {
	return (
		<nav className="z-10 top-0 bg-gray-50 text-gray-800 w-full p-4 grid grid-cols-3 items-center">
			<a href="/" className={`text-center`}>
				LangchainJS Service Starter
			</a>
			<HamburgerMenu />
			<p className={`text-center`}></p>
		</nav>
	)
}

export default Navbar
