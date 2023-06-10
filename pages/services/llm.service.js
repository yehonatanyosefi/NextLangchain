import { VectorDBQAChain, ConversationChain, ConversationalRetrievalQAChain } from 'langchain/chains'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { dbService } from './db.service'
import { BufferMemory } from 'langchain/memory'
import { utilService } from './util.service'
import SSE from 'express-sse'

const sse = new SSE()

const LLM_MODEL = 'gpt-3.5-turbo'
const MEMORY_TYPE = new BufferMemory()

let gModel = null
let gMemory = null
let gChain = null
let gOptions = null
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
		if (gOptions?.streaming) sse.send(null, 'end')
		return response
	} catch (error) {
		console.error('An error occurred while querying:', error)
		throw error
	}
}

async function getConversationalRetrievalChain() {
	try {
		const vectorStore = await dbService.getVectorStore(gMemory ? true : false)
		gCallType = 'question'
		return ConversationalRetrievalQAChain.fromLLM(gModel, vectorStore.asRetriever(), {
			verbose: false,
		})
	} catch (error) {
		console.error('An error occurred while getting conversational retrieval chain:', error)
		throw error
	}
}
async function getVectorChain() {
	try {
		const vectorStore = await dbService.getVectorStore(memoryOption)
		const vectorOptions = {
			k: 1,
			returnSourceDocuments: true,
			memory: !gMemory ? undefined : gMemory,
		}
		return VectorDBQAChain.fromLLM(gModel, vectorStore, vectorOptions)
	} catch (error) {
		console.error('An error occurred while getting vector chain:', error)
		throw error
	}
}

function getLLMChain() {
	gCallType = 'query'
	return new ConversationChain({
		llm: gModel,
		memory: !gMemory ? undefined : gMemory,
	})
}

async function initializeVars(
	temperature = 0,
	streaming = false,
	queryVector = false,
	memoryOption = false
) {
	const newOptions = { temperature, streaming, queryVector, memoryOption }

	if (utilService.shallowEqual(gOptions, newOptions)) return

	gOptions = newOptions

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
	gMemory = !memoryOption ? null : MEMORY_TYPE
	gModel = new ChatOpenAI(llmOptions)
	gChain = !queryVector ? getLLMChain() : await getConversationalRetrievalChain()
}
