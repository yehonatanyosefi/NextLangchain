import { ChatOpenAI } from 'langchain/chat_models/openai'
import { LLMChain } from 'langchain/chains'
import { ZeroShotAgent } from 'langchain/agents'
import {
	ChatPromptTemplate,
	HumanMessagePromptTemplate,
	SystemMessagePromptTemplate,
} from 'langchain/prompts'
import { AgentExecutor } from 'langchain/agents'
import { agentToolsService } from './agent-tools.service'

export const agentService = {
	ResearchAgent,
}

const ResearchAgent = async (topic) => {
	try {
		// This agent can browse the web and search google
		const { SerpAPITool, WebBrowserTool } = agentToolsService

		const tools = [SerpAPITool, WebBrowserTool]

		// Zeroshot agent, using a specific agent prompt
		const promptTemplate = ZeroShotAgent.createPrompt(tools, {
			prefix: `Answer the following questions as best you can. You have access to the following tools:`,
			suffix: `Begin! Answer concisely. It's OK to say you don't know.`,
		})

		// Initialize the agent with the prompt
		const chatPrompt = ChatPromptTemplate.fromPromptMessages([
			new SystemMessagePromptTemplate(promptTemplate),
			HumanMessagePromptTemplate.fromTemplate(`{input}`),
		])

		// We'll create an agent using openai, regular llmchain and the agent initialization
		const chat = new ChatOpenAI({})
		const llmChain = new LLMChain({
			prompt: chatPrompt,
			llm: chat,
		})
		const agent = new ZeroShotAgent({
			llmChain,
			allowedTools: tools.map((tool) => tool.name),
		})

		const executor = AgentExecutor.fromAgentAndTools({
			agent,
			tools,
			returnIntermediateSteps: false,
			// Agent will run until it reaches a stopping point, or until it reaches the max iterations
			maxIterations: 3,
			// Agent will show with logs in the console what it's doing and thinking
			verbose: true,
		})

		const result = await executor.run(`Who is ${topic}?`)

		return result
	} catch (err) {
		console.error(err)
		throw err
	}
}
