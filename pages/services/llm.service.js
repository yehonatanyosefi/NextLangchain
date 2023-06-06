import { VectorDBQAChain, ConversationChain } from 'langchain/chains'
import { OpenAI } from 'langchain/llms/openai'
import { dbService } from './db.service'
import { BufferMemory } from 'langchain/memory'

import express from 'express'
import session from 'express-session'
import SSE from 'express-sse'

const sse = new SSE()

const LLM_MODEL = 'gpt-3.5-turbo'

const app = express()

app.use(
	session({
		secret: process.env.SESSION_KEY,
		resave: false,
		saveUninitialized: true,
	})
)

export const llmService = {
	query,
}

async function query(
	prompt,
	req,
	queryVector = false,
	memoryOption = false,
	temperature = 0.1,
	streaming = false
) {
	try {
		const llmOptions = {
			modelName: LLM_MODEL,
			temperature,
			streaming,
			callbacks: !streaming
				? undefined
				: [
						{
							handleLLMNewToken(token) {
								sse.send(token, 'newToken')
							},
						},
				  ],
		}
		const model = new OpenAI(llmOptions)
		const chain = !queryVector
			? getLLMChain(model, memoryOption)
			: await getVectorChain(model, memoryOption)
		const response = await chain.call({ query: prompt })
		sse.send(null, 'end')
		return response
	} catch (error) {
		console.error('An error occurred while querying:', error)
		throw error
	}
}

async function getVectorChain(model, req, memoryOption = false) {
	try {
		const { vectorStore, memory: vectorMemory } = await dbService.getVectorStore(memoryOption)
		if (!req.session.vectorMemory) {
			req.session.vectorMemory = vectorMemory
		}
		const vectorSesMemory = req.session.vectorMemory
		const vectorOptions = {
			k: 1,
			returnSourceDocuments: true,
			memory: memoryOption ? vectorSesMemory : undefined,
		}
		return VectorDBQAChain.fromLLM(model, vectorStore, vectorOptions)
	} catch (error) {
		console.error('An error occurred while getting vector chain:', error)
		throw error
	}
}

function getLLMChain(model, req, memoryOption = false) {
	if (!req.session.memory) {
		req.session.memory = new BufferMemory()
	}
	const memory = req.session.memory
	return new ConversationChain({ llm: model, memory: memoryOption ? memory : undefined })
}
