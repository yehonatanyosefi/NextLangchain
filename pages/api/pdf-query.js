import { aiController } from '../contollers/ai.controller'

let gFirstMsg = true

export default async function handler(req, res) {
	try {
		if (req.method !== 'POST') {
			throw new Error('Method not allowed')
		}

		// Grab the user prompt
		const { input } = req.body

		if (!input) {
			throw new Error('No input')
		}

		if (gFirstMsg) {
			const queryOptions = {
				queryVector: true,
				memoryOption: false,
				temperature: 0.1,
				streaming: false,
			}
			await aiController.initializeVars(queryOptions)
			gFirstMsg = false
		}

		const response = await aiController.query(input)

		return res.status(200).json({ result: response })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: error.message })
	}
}
