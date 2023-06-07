import jwt from 'jsonwebtoken'
import nextConnect from 'next-connect'
import cookie from 'cookie'

const handler = nextConnect()

handler.post(async (req, res) => {
	const token = jwt.sign({ id: 'userId' }, 'yourSecret', { expiresIn: '1h' })

	res.setHeader(
		'Set-Cookie',
		cookie.serialize('auth', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV !== 'development',
			sameSite: 'strict',
			maxAge: 3600,
			path: '/',
		})
	)
	res.status(200).json({ message: 'Logged in' })
})

export default handler
