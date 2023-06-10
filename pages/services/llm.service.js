import { VectorDBQAChain, ConversationChain, ConversationalRetrievalQAChain } from 'langchain/chains'
import { OpenAI } from 'langchain/llms/openai'
import { dbService } from './db.service'
import { BufferMemory } from 'langchain/memory'

import SSE from 'express-sse'

const sse = new SSE()

const LLM_MODEL = 'gpt-3.5-turbo'
const MEMORY_TYPE = new BufferMemory()

let gModel = null
let gMemory = null
let gChain = null
let gCallType = 'query'
const gChatHistory = []

export const llmService = {
	query,
	initializeVars,
}

async function query(prompt) {
	try {
		gChatHistory.push({ user: prompt })
		// const augmentedPrompt = !gMemory ? prompt : `History:${gChatHistory}\n${prompt}`
		const response = await gChain.call({ [gCallType]: prompt, chat_history: gChatHistory })
		gChatHistory.push({ assistant: response.text })
		sse.send(null, 'end')
		return response
	} catch (error) {
		console.error('An error occurred while querying:', error)
		throw error
	}
}

async function getConversationalRetrievalChain(model, memoryOption = false) {
	try {
		const vectorStore = await dbService.getVectorStore(memoryOption)
		gCallType = 'question'
		return ConversationalRetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
			verbose: false,
		})
	} catch (error) {
		console.error('An error occurred while getting conversational retrieval chain:', error)
		throw error
	}
}
async function getVectorChain(model, memoryOption = false) {
	try {
		const vectorStore = await dbService.getVectorStore(memoryOption)
		const vectorOptions = {
			k: 1,
			returnSourceDocuments: true,
			memory: memoryOption ? gMemory : undefined,
		}
		return VectorDBQAChain.fromLLM(model, vectorStore, vectorOptions)
	} catch (error) {
		console.error('An error occurred while getting vector chain:', error)
		throw error
	}
}

function getLLMChain(model, memoryOption = false) {
	return new ConversationChain({ llm: model, memory: memoryOption ? gMemory : undefined })
}

async function initializeVars(
	temperature = 0,
	streaming = false,
	queryVector = false,
	memoryOption = false
) {
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
	gMemory = !memoryOption ? false : MEMORY_TYPE
	gModel = new OpenAI(llmOptions)
	gChain = !queryVector
		? getLLMChain(gModel, memoryOption)
		: await getConversationalRetrievalChain(gModel, memoryOption)
}
