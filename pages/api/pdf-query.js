import { llmService } from '../services/llm.service'
export default async function handler(req, res) {
	try {
		if (req.method !== 'POST') {
			throw new Error('Method not allowed')
		}

		console.log('Query PDF')

		// Grab the user prompt
		const { input } = req.body

		if (!input) {
			throw new Error('No input')
		}

		const response = await llmService.query(input, req)

		return res.status(200).json({ result: response })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: error.message })
	}
}
