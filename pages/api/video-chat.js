// /pages/api/transcript.js
import { thirdPartyService } from '../services/thirdParty.service'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { ConversationalRetrievalQAChain } from 'langchain/chains'
import { HNSWLib } from 'langchain/vectorstores/hnswlib'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { CharacterTextSplitter } from 'langchain/text_splitter'

let gChain = null
let gChatHistory = []
const LOCAL_VECTOR_STORE_DIRECTORY = 'C:/dev_ai/Langchain/NextLangchain/data/vectors'

const initializeChain = async (initialPrompt, transcript) => {
	try {
		const model = new ChatOpenAI({
			temperature: 0.1,
			model: 'gpt-3.5-turbo',
		})

		// Using the splitter, we create documents from a bigger document, in this case the YouTube Transcript
		// const splitter = new CharacterTextSplitter({
		// 	separator: ' ',
		// 	chunkSize: 7,
		// 	chunkOverlap: 3,
		// })
		// const docs = await splitter.createDocuments([transcript])

		const vectorStore = await HNSWLib.fromDocuments(
			[{ pageContent: transcript }],
			new OpenAIEmbeddings()
		)
		await vectorStore.save(LOCAL_VECTOR_STORE_DIRECTORY)
		//we can also load the vector store from disk
		// const loadedVectorStore = await HNSWLib.load(LOCAL_VECTOR_STORE_DIRECTORY, new OpenAIEmbeddings())

		gChain = ConversationalRetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
			verbose: false,
		})

		const response = await gChain.call({ question: initialPrompt, chat_history: gChatHistory })
		return response
	} catch (error) {
		console.error(error)
	}
}

export default async function handler(req, res) {
	if (req.method === 'POST') {
		const { prompt, firstMsg } = req.body
		if (firstMsg) {
			try {
				const transcript = await thirdPartyService.getYoutubeTranscript(prompt)
				if (!transcript) {
					return res.status(500).json({ error: 'An error occurred while fetching transcript' })
				}
				const initialPrompt = `Give me a summary of the transcript: '''${transcript}'''`
				gChatHistory.push({
					role: 'user',
					content: initialPrompt,
				})
				const response = await initializeChain(initialPrompt, transcript)
				gChatHistory.push({
					role: 'assistant',
					content: response.text,
				})
				// And then we'll jsut get the response back and the chatHistory
				return res.status(200).json({ output: response, gChatHistory })
			} catch (err) {
				console.error(err)
				return res.status(500).json({ error: 'An error occurred while fetching transcript' })
			}
		} else {
			try {
				gChatHistory.push({
					role: 'user',
					content: prompt,
				})

				const response = await gChain.call({ question: prompt, chat_history: gChatHistory })

				gChatHistory.push({
					role: 'assistant',
					content: response.text,
				})

				return res.status(200).json({ output: response, gChatHistory })
			} catch (error) {
				// Generic error handling
				console.error(error)
				res.status(500).json({ error: 'An error occurred during the conversation.' })
			}
		}
	}
}
