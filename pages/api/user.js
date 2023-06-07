import jwt from 'jsonwebtoken'
import nextConnect from 'next-connect'
import cookie from 'cookie'

const handler = nextConnect()

handler.get(async (req, res) => {
	if (!req.headers.cookie) {
		res.status(401).json({ message: 'Unauthorized' })
		return
	}

	const cookies = cookie.parse(req.headers.cookie)

	try {
		const decoded = jwt.verify(cookies.auth, process.env.JWT_SECRET)
		res.status(200).json({ userId: decoded.id })
	} catch (error) {
		res.status(401).json({ message: 'Unauthorized' })
	}
})

export default handler
