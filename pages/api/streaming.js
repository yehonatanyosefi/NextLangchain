import { OpenAI } from 'langchain/llms/openai'
import { aiController } from '../contollers/ai.controller'
import SSE from 'express-sse'

const sse = new SSE()

export default async function handler(req, res) {
	if (req.method === 'POST') {
		const { input, options } = req.body

		if (!input) {
			throw new Error('No input')
		}
		const { streaming } = options
		const chat = new OpenAI({
			streaming,
			callbacks: !streaming
				? []
				: [
						{
							handleLLMNewToken(token) {
								sse.send(token, 'newToken')
							},
						},
				  ],
		})
		// await aiController.initializeVars(options)

		const prompt = `Create me a short rap about my name and city. Make it funny and punny. Name: ${input}`

		// const response = await aiController.query(prompt)
		// return res.status(200).json({ response })

		chat.call(prompt).then(() => {
			sse.send(null, 'end')
		})

		return res.status(200).json({ result: 'Streaming complete' })
	} else if (req.method === 'GET') {
		sse.init(req, res)
	} else {
		res.status(405).json({ message: 'Method not allowed' })
	}
}
