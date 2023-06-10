import { ChatOpenAI } from 'langchain/chat_models/openai'
import { ConversationalRetrievalQAChain } from 'langchain/chains'
import { HNSWLib } from 'langchain/vectorstores/hnswlib'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { aiController } from '../contollers/ai.controller'

let gChain = null
let gChatHistory = []
let gFirstMsg = true

export default async function handler(req, res) {
	if (req.method === 'POST') {
		let { prompt } = req.body
		try {
			if (gFirstMsg) {
				const transcript = await aiController.transcribeVideo(prompt)
				prompt = `Give me a summary of the transcript: '''${transcript}'''`
				const queryOptions = {
					queryVector: true,
					memoryOption: true,
					temperature: 0,
					streaming: false,
				}
				await aiController.initializeVars(queryOptions)
				gFirstMsg = false
			}
			gChatHistory.push({
				role: 'user',
				content: prompt,
			})
			const response = await aiController.query(prompt)
			gChatHistory.push({
				role: 'assistant',
				content: response.text,
			})
			res.status(200).json({ output: response, gChatHistory })
		} catch (err) {
			console.error(err)
			return res.status(500).json({ error: 'An error occurred while fetching transcript' })
		}
	}
}

// const LOCAL_VECTOR_STORE_DIRECTORY = 'C:/dev_ai/Langchain/NextLangchain/data/vectors'
// async function uploadToStore(transcript) {
// 	try {
// 		const vectorStore = await HNSWLib.fromDocuments(
// 			[{ pageContent: transcript }],
// 			new OpenAIEmbeddings()
// 		)
// 		await vectorStore.save(LOCAL_VECTOR_STORE_DIRECTORY)
// 	} catch (error) {
// 		console.error(error)
// 		throw error
// 	}
// }

// async function callGPT(prompt) {
// 	try {
// 		return await gChain.call({ question: prompt, chat_history: gChatHistory })
// 	} catch (error) {
// 		console.error(error)
// 		throw error
// 	}
// }

// async function initializeChain() {
// 	try {
// 		const model = new ChatOpenAI({
// 			temperature: 0.1,
// 			model: 'gpt-3.5-turbo',
// 		})
// 		gChain = ConversationalRetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
// 			verbose: false,
// 		})
// 	} catch (error) {
// 		console.error(error)
// 		throw error
// 	}
// }

// async function loadLocalStore() {
// 	return await HNSWLib.load(LOCAL_VECTOR_STORE_DIRECTORY, new OpenAIEmbeddings())
// }
