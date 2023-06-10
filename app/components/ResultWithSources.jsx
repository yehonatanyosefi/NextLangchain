import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

const MessageItem = ({ message, pngFile, isLast }) => {
	const userImage = '/assets/images/person.png'
	const botImage = `/assets/images/${pngFile}.png`
	const [showSources, setShowSources] = useState(false)

	const messageBackground = message.type === 'user' ? 'bg-blue-200' : 'bg-green-200'
	const messageBorderStyle = 'rounded-lg p-3'

	return (
		<div className={`flex flex-col ${isLast ? 'flex-grow' : ''}`}>
			<div className="flex mb-4 items-start">
				<div
					style={{ width: '40px', height: '40px', position: 'relative' }}
					className="overflow-hidden rounded flex-shrink-0">
					<Image
						src={message.type === 'user' ? userImage : botImage}
						alt={`${message.type}'s profile`}
						className="rounded"
						fill
						style={{ objectFit: 'cover' }}
						sizes="5vw"
					/>
				</div>
				<div className={`${messageBackground} ${messageBorderStyle} ml-2`}>
					<p className={`whitespace-pre-line`}>{message.text}</p>
				</div>
			</div>

			{message.sourceDocuments && (
				<div className="mb-6">
					<button
						className="text-gray-600 text-sm font-bold"
						onClick={() => setShowSources(!showSources)}>
						Source Documents {showSources ? '(Hide)' : '(Show)'}
					</button>
					{showSources &&
						message.sourceDocuments.map((document, docIndex) => (
							<div key={docIndex}>
								<h3 className="text-gray-600 text-sm font-bold whitespace-pre-line">
									Source {docIndex + 1}:
								</h3>
								<p className="text-gray-800 text-sm mt-2 whitespace-pre-line">{document.pageContent}</p>
								<pre className="text-xs text-gray-500 mt-2 whitespace-pre-line">
									{JSON.stringify(document.metadata, null, 2)}
								</pre>
							</div>
						))}
				</div>
			)}
		</div>
	)
}

const ResultWithSources = ({ messages, pngFile, maxMsgs }) => {
	const messagesContainerRef = useRef()

	useEffect(() => {
		if (messagesContainerRef.current) {
			const element = messagesContainerRef.current
			element.scrollTop = element.scrollHeight
		}
	}, [messages])

	// E.g. Before we reach the max messages, we should add the justify-end property, which pushes messages to the bottom
	const maxMsgToScroll = maxMsgs || 5

	return (
		<div
			ref={messagesContainerRef}
			className={`bg-white p-10 rounded-3xl shadow-lg mb-8 overflow-y-auto h-[500px] max-h-[500px] flex flex-col space-y-4 ${
				messages?.length < maxMsgToScroll && 'justify-end'
			}`}>
			{messages &&
				messages.map((message, index) => (
					<MessageItem key={index} message={message} pngFile={pngFile} />
				))}
		</div>
	)
}

export default ResultWithSources
