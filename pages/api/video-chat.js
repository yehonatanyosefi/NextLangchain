import { thirdPartyService } from '../services/thirdParty.service'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { ConversationalRetrievalQAChain } from 'langchain/chains'
import { HNSWLib } from 'langchain/vectorstores/hnswlib'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { CharacterTextSplitter } from 'langchain/text_splitter'

let gChain = null
let gChatHistory = []
const LOCAL_VECTOR_STORE_DIRECTORY = 'C:/dev_ai/Langchain/NextLangchain/data/vectors'

export default async function handler(req, res) {
	if (req.method === 'POST') {
		let { prompt, firstMsg } = req.body
		try {
			let response = null
			if (firstMsg) {
				const transcript = await transcribeVideo(prompt)
				prompt = `Give me a summary of the transcript: '''${transcript}'''`
				await initializeChain()
			}
			response = await callGPT(prompt)
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

async function getReducedText(text, chunkSize = 1000, chunkOverlap = 100) {
	const splitter = new CharacterTextSplitter({
		separator: ' ',
		chunkSize,
		chunkOverlap,
	})
	const docs = await splitter.createDocuments([text])
	return docs
}

async function uploadToStore(transcript) {
	try {
		const vectorStore = await HNSWLib.fromDocuments(
			[{ pageContent: transcript }],
			new OpenAIEmbeddings()
		)
		await vectorStore.save(LOCAL_VECTOR_STORE_DIRECTORY)
	} catch (error) {
		console.error(error)
		throw error
	}
}

async function initializeChain() {
	try {
		const model = new ChatOpenAI({
			temperature: 0.1,
			model: 'gpt-3.5-turbo',
		})
		gChain = ConversationalRetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
			verbose: false,
		})
	} catch (error) {
		console.error(error)
		throw error
	}
}

async function transcribeVideo(url) {
	try {
		const transcript = await thirdPartyService.getYoutubeTranscript(url)
		if (!transcript) {
			throw new Error('No transcript found')
		}
		await uploadToStore(transcript)
		return transcript
	} catch (error) {
		console.error(error)
		throw error
	}
}

async function loadLocalStore() {
	return await HNSWLib.load(LOCAL_VECTOR_STORE_DIRECTORY, new OpenAIEmbeddings())
}

async function callGPT(prompt) {
	try {
		gChatHistory.push({
			role: 'user',
			content: prompt,
		})
		return await gChain.call({ question: prompt, chat_history: gChatHistory })
	} catch (error) {
		console.error(error)
		throw error
	}
}
