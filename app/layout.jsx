import './globals.css'
import Navbar from './Navbar'
import { instrumentSans } from './styles/fonts'

export const metadata = {
	title: 'Langchain JavaScript',
	description: 'Learn  the latest AI technologies from Shawn Esquivel.',
}

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body className={`${instrumentSans.className} overflow-x-hidden`}>
				<Navbar />
				<main className="flex flex-col pt-5 md:pt-10 lg:pt-20 px-5 md:px-10 lg:px-20">{children}</main>
			</body>
		</html>
	)
}
