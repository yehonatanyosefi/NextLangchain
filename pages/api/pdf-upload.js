import { aiController } from '../contollers/ai.controller'

export default async function handler(req, res) {
	if (req.method === 'GET') {
		try {
			const path = `C:/dev_ai/Langchain/NextLangchain-main/data/document_loaders/naval-ravikant-book.pdf`
			await aiController.uploadPdf(path)
			return res.status(200).json({ result: true })
		} catch (err) {
			res.status(404).json({ message: 'Document not found' })
		}
	} else {
		res.status(405).json({ message: 'Method not allowed' })
	}
}
