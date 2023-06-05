// /pages/api/transcript.js
import { thirdPartyService } from '../services/thirdParty.service'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { ConversationalRetrievalQAChain } from 'langchain/chains'
import { HNSWLib } from 'langchain/vectorstores/hnswlib'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { CharacterTextSplitter } from 'langchain/text_splitter'
import { OpenAI } from 'langchain'

// Global variables
let gChain
let gChatHistory = []

// DO THIS SECOND
const initializeChain = async (initialPrompt, transcript) => {
	try {
		const model = ChatOpenAI({
			temperature: 0.1,
			model: 'gpt-3.5-turbo',
		})
		console.log({ gChatHistory })
		return response
	} catch (error) {
		console.error(error)
	}
}

export default async function handler(req, res) {
	if (req.method === 'POST') {
		const { prompt, firstMessage, transcript } = req.body
		// DO THIS FIRST
		// Then if it's the first message, we want to initialize the chain, since it doesn't exist yet
		if (firstMessage) {
			try {
				const initialPrompt = `Give me a summary of the transcript: '''${transcript}'''`
				gChatHistory.push({
					role: 'user',
					content: initialPrompt,
				})
				const transcript = await thirdPartyService.getYoutubeTranscript(prompt)
				const vectorStore = await HNSWLib([{ pageContent: transcript }], new OpenAIEmbeddings())
				const directory = 'C:/dev_ai/Langchain/openai-javascript-course-1-start-here/data/vectors'
				await vectorStore.save(directory)

				const loadVectorStore = await HNSWLib.load(directory, new OpenAIEmbeddings())
				// And then we'll jsut get the response back and the chatHistory
				return res.status(200).json({ output: response, gChatHistory })
			} catch (err) {
				console.error(err)
				return res.status(500).json({ error: 'An error occurred while fetching transcript' })
			}

			// do this third!
		} else {
			// If it's not the first message, we can chat with the bot

			try {
				return res.status(200).json({ output: response, gChatHistory })
			} catch (error) {
				// Generic error handling
				console.error(error)
				res.status(500).json({ error: 'An error occurred during the conversation.' })
			}
		}
	}
}
