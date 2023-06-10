'use client'
import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import PromptBox from '../components/PromptBox'
import Title from '../components/Title'
import TwoColumnLayout from '../components/TwoColumnLayout'
import ResultWithSources from '../components/ResultWithSources'
import '../globals.css'

const Memory = () => {
	const aiGreeting = {
		text: `Hi there, I'm here to help`,
		type: 'bot',
		sourceDocuments: null,
	}
	const [prompt, setPrompt] = useState('')
	const [error, setError] = useState(null)
	const [messages, setMessages] = useState([aiGreeting])
	const [firstMsg, setFirstMsg] = useState(true)

	const handleSubmitPrompt = async () => {
		try {
			setMessages((prevMessages) => [
				...prevMessages,
				{ text: prompt, type: 'user', sourceDocuments: null },
			])
			const promptToSend = prompt
			setPrompt('')
			const response = await fetch('/api/memory', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ input: promptToSend, firstMsg }),
			})
			if (!response.ok) {
				throw new Error(`HTTP Error! Status: ${response.status}`)
			}
			setFirstMsg(false)
			const aiResponse = await response.json()
			setMessages((prevMessages) => [
				...prevMessages,
				{ text: aiResponse.output.response, type: 'bot', sourceDocuments: null },
			])
			setError('')
		} catch (err) {
			console.error(`Error submitting prompt:`, err)
			setError(JSON.stringify(err))
		}
		setPrompt('')
	}
	const handlePromptChange = (ev) => {
		setPrompt(ev.target.value)
	}

	return (
		<>
			<TwoColumnLayout
				leftChildren={
					<>
						<PageHeader
							heading="I remember everything you tell me."
							boldText={`Let's see if it can remember your name, it will also tell you everything about the pdf.`}
							description="I use Buffer Memory and Conversation Chain."
						/>
					</>
				}
				rightChildren={
					<>
						<ResultWithSources messages={messages} pngFile="brain" />
						<PromptBox
							prompt={prompt}
							handleSubmit={handleSubmitPrompt}
							placeHolderText={'Ask me anything about the pdf'}
							error={error}
							handlePromptChange={handlePromptChange}
							pngFile="brain"
						/>
					</>
				}
			/>
		</>
	)
}
export default Memory
