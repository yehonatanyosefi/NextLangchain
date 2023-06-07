import { ChatOpenAI } from 'langchain/chat_models/openai'
import { HumanChatMessage } from 'langchain/schema'

// create instance of chatOpenAI

export default async function handler(req, res) {
	if (req.method === 'POST') {
		const { input } = req.body

		if (!input) {
			throw new Error('No input')
		}

		const chat = new ChatOpenAI({ temperature: 0, modelName: 'gpt-3.5-turbo' })
		const response = await chat.call([new HumanChatMessage(`How do I write a for loop in ${input}?`)])
		return res.status(200).json({ result: response })
	} else {
		res.status(405).json({ message: 'Method not allowed' })
	}
}
