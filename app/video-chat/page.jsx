'use client'
import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import PromptBox from '../components/PromptBox'
import ResultWithSources from '../components/ResultWithSources'
import TwoColumnLayout from '../components/TwoColumnLayout'

const VideoChat = () => {
	// We'll set a default YouTube video so we don't have to copy and paste this every time
	const [prompt, setPrompt] = useState('https://www.youtube.com/watch?v=0lJKucu6HJc')
	const [error, setError] = useState(null)
	const [firstMsg, setFirstMsg] = useState(true)

	// And we'll set an initial message as well, to make the UI look a little nicer.
	const [messages, setMessages] = useState([
		{
			text: "Hi there! I'm YT chatbot. Please provide a YouTube video URL and I'll answer any questions you have.",
			type: 'bot',
		},
	])

	const handlePromptChange = (e) => {
		setPrompt(e.target.value)
	}

	// The only differences here will be the "URL" for the api call
	// And the body will send a prompt as well as a firstMsg, which tells us if its the first message in the chat or not
	// Because the first message will tell us to create the YouTube Chat bot
	const handleSubmit = async () => {
		try {
			// Push the user's message into the messages array
			setMessages((prevMessages) => [
				...prevMessages,
				{ text: prompt, type: 'user', sourceDocuments: null },
			])

			const promptToSend = prompt
			setPrompt('')
			const response = await fetch(`/api/video-chat`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ prompt: promptToSend, firstMsg }),
			})

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			const searchRes = await response.json()

			// Push the response into the messages array
			setMessages((prevMessages) => [
				...prevMessages,
				{
					text: searchRes.output.text,
					type: 'bot',
				},
			])

			setFirstMsg(false)
			setError('')
		} catch (err) {
			console.error(err)
			setError('Error fetching transcript. Please try again.')
		}
	}

	return (
		<>
			<TwoColumnLayout
				leftChildren={
					<PageHeader
						heading="Talk to Your Videos"
						boldText="This tool lets you chat with your YouTube videos. "
						description="This tool uses the YouTube API, Text Splitters, and the Conversational Retrieval QA CHain.  Head over to Module X to get started!"
					/>
				}
				rightChildren={
					<>
						<ResultWithSources messages={messages} pngFile="youtube" />
						<PromptBox
							prompt={prompt}
							handlePromptChange={handlePromptChange}
							handleSubmit={handleSubmit}
							placeHolderText={
								messages.length === 1
									? 'Enter a youtube url, e.g., https://www.youtube.com/watch?v=O_9JoimRj8w'
									: 'Ask a follow up question'
							}
							error={error}
						/>
					</>
				}
			/>
		</>
	)
}

export default VideoChat
