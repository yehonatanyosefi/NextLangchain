import { VectorDBQAChain } from 'langchain/chains'
import { OpenAI } from 'langchain/llms/openai'
import { dbService } from './db.service'

export const llmService = {
	query,
}

async function query(input) {
	const vectorStore = await dbService.getVectorStore()
	const model = new OpenAI()
	const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
		k: 1,
		returnSourceDocuments: true,
	})
	const response = await chain.call({ query: input })
	return response
}
