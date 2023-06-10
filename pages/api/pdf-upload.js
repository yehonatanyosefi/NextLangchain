import { aiController } from '../contollers/ai.controller'

// Example: https://js.langchain.com/docs/modules/indexes/document_loaders/examples/file_loaders/pdf
export default async function handler(req, res) {
	if (req.method === 'GET') {
		try {
			const path = `C:/dev_ai/Langchain/NextLangchain-main/data/document_loaders/naval-ravikant-book.pdf`
			await aiController.uploadPdf(path)
			console.log(`uploaded success`)
			// upload documents to Pinecone
			return res.status(200).json({ result: docs })
		} catch (err) {
			res.status(404).json({ message: 'Document not found' })
		}
	} else {
		res.status(405).json({ message: 'Method not allowed' })
	}
}
