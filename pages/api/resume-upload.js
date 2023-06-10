import { DirectoryLoader } from 'langchain/document_loaders/fs/directory'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { CharacterTextSplitter } from 'langchain/text_splitter'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { PineconeClient } from '@pinecone-database/pinecone'
import { loadSummarizationChain } from 'langchain/chains'
import { OpenAI } from 'langchain/llms/openai'

export default async function handler(req, res) {
	try {
		const loader = new DirectoryLoader('C:/dev_ai/Langchain/NextLangchain-main/data/resumes', {
			'.pdf': (path) => new PDFLoader(path, '/pdf'),
		})

		const docs = await loader.load()

		const splitter = new CharacterTextSplitter({
			separator: ' ',
			chunkSize: 200,
			chunkOverlap: 20,
		})

		const splitDocs = await splitter.splitDocuments(docs)

		const reducedDocs = splitDocs.map((doc) => {
			const fileName = doc.metadata.source.split('/').pop()
			// ["resume", "aubrey", "graham.pdf"]
			const [_, firstName, lastName] = fileName.split('_')

			return {
				...doc,
				metadata: {
					first_name: firstName,
					last_name: lastName.slice(0, -4),
					docType: 'resume',
				},
			}
		})

		let summaries = []
		const model = new OpenAI({ temperature: 0 })
		const summarizeAllChain = loadSummarizationChain(model, {
			type: 'map_reduce',
		})

		// raw documents
		const summarizeRes = await summarizeAllChain.call({
			input_documents: docs,
		})
		summaries.push({ summary: summarizeRes.text })

		/** Summarize each candidate */
		for (let doc of docs) {
			const summarizeOneChain = loadSummarizationChain(model, {
				type: 'map_reduce',
			})
			const summarizeOneRes = await summarizeOneChain.call({
				input_documents: [doc],
			})

			console.log({ summarizeOneRes })
			summaries.push({ summary: summarizeOneRes.text })
		}

		/** Upload the reducedDocs */
		const client = new PineconeClient()
		await client.init({
			apiKey: process.env.PINECONE_API_KEY,
			environment: process.env.PINECONE_ENVIRONMENT,
		})

		const pineconeIndex = client.Index(process.env.PINECONE_INDEX)

		await PineconeStore.fromDocuments(reducedDocs, new OpenAIEmbeddings(), {
			pineconeIndex,
		})

		console.log('Uploaded to Pinecone')

		console.log({ summaries })
		// [{summary: 'gdajkljgadkl'}, {summary: 'gdjaklgkadl'}]
		const summaryStr = JSON.stringify(summaries, null, 2)

		return res.status(200).json({ output: summaryStr })
	} catch (err) {
		// If we have an error

		console.error(err)
		return res.status(500).json({ error: err })
	}
}
