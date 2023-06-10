import { SerpAPI } from 'langchain/tools'
import { WebBrowser } from 'langchain/tools/webbrowser'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { dbService } from './db.service'

const BASE_URL = 'http://localhost:3000/agents'

export const agentToolsService = {
	SerpAPITool,
	WebBrowserTool,
}

function SerpAPITool() {
	const serpAPI = new SerpAPI(process.env.SERPAPI_API_KEY, {
		baseUrl: BASE_URL,
		location: 'Israel',
		hl: 'en',
		gl: 'us',
	})
	serpAPI.returnDirect = true

	return serpAPI
}

function WebBrowserTool() {
	const model = new ChatOpenAI({ temperature: 0 })
	const embeddings = dbService.EMBEDDING

	const browser = new WebBrowser({ model, embeddings })
	browser.returnDirect = true

	return browser
}
