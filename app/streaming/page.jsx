'use client'
import { useState, useEffect } from 'react'
import PageHeader from '../components/PageHeader'
import PromptBox from '../components/PromptBox'
import TwoColumnLayout from 'app/components/TwoColumnLayout'
import ResultWithSources from 'app/components/ResultWithSources'
import ChatOptions from 'app/components/ChatOptions'

const CHAT_BOT_OPTIONS = {
	queryVector: false,
	memoryOption: false,
	temperature: 0,
	streaming: true,
	useAgent: false,
	agentPrompt: '',
}

const Streaming = () => {
	const [prompt, setPrompt] = useState('')
	const [error, setError] = useState(null)
	const [source, setSource] = useState(null)
	const [messages, setMessages] = useState([])
	const [chatOptions, setChatOptions] = useState(CHAT_BOT_OPTIONS)
	const [streaming, setStreaming] = useState(false)

	const processToken = (token) => {
		return token.replace(/\\n/g, '\n').replace(/\"/g, '')
	}

	const handlePromptChange = (e) => {
		setPrompt(e.target.value)
	}

	const handleChatOptionsChange = (changedOption) => {
		setChatOptions((prevChatOptions) => ({
			...prevChatOptions,
			...changedOption,
		}))
	}

	const handleSubmit = async () => {
		try {
			const promptToSend = prompt
			setMessages((prevMessages) => [
				...prevMessages,
				{ text: prompt, type: 'user', sourceDocuments: null },
			])
			setPrompt('')
			const response = await fetch('/api/streaming', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ input: promptToSend, options: chatOptions }),
			})
			// if (!chatOptions.streaming) {
			// 	const searchRes = await response.json()

			// 	// Push the response into the messages array
			// 	setMessages((prevMessages) => [
			// 		...prevMessages,
			// 		{
			// 			text: searchRes.output.text,
			// 			type: 'bot',
			// 		},
			// 	])
			// 	return
			// }
			// close existing sources
			if (source) {
				source.close()
			}
			// create new eventsource

			const newSource = new EventSource('/api/streaming')

			setSource(newSource)
			setStreaming(true)

			setMessages((prevMessages) => [
				...prevMessages,
				{
					text: '',
					type: 'bot',
					sourceDocuments: null,
				},
			])

			newSource.addEventListener('newToken', (event) => {
				const token = processToken(event.data)
				setMessages((prevMessages) => {
					const lastMsg = prevMessages[prevMessages.length - 1]
					const newMsg = { ...lastMsg, text: lastMsg.text + token }
					return [...prevMessages.slice(0, prevMessages.length - 1), newMsg]
				})
			})

			newSource.addEventListener('end', () => {
				newSource.close()
				setStreaming(false)
			})
		} catch (err) {
			console.error(err)
			setError(error)
		}
	}

	// Clean up the EventSource on component unmount
	useEffect(() => {
		// stuff is gonna happen
		return () => {
			if (source) {
				source.close()
			}
		}
	}, [source])

	return (
		<>
			<TwoColumnLayout
				leftChildren={
					<>
						<PageHeader
							heading="Spit a Rap."
							boldText="Nobody likes waiting for APIs to load. Use streaming to improve the user experience of chat bots."
							description="This tutorial uses streaming.  Head over to Module X to get started!"
						/>
						<ChatOptions chatOptions={chatOptions} handleChatOptionsChange={handleChatOptionsChange} />
					</>
				}
				rightChildren={
					<>
						<ResultWithSources messages={messages} pngFile="pdf" />
						<PromptBox
							prompt={prompt}
							handlePromptChange={handlePromptChange}
							handleSubmit={handleSubmit}
							placeHolderText={'Enter your name and city'}
							error={error}
							pngFile="pdf"
						/>
					</>
				}
			/>
		</>
	)
}

export default Streaming
