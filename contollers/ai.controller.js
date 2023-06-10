import { dbService } from '../services/db.service'
import { docService } from '../services/doc.service'
import { llmService } from '../services/llm.service'
import { thirdPartyService } from '../services/third-party.service'

export const aiController = {
	query,
	uploadPdf,
	transcribeVideo,
	initializeVars,
}

async function query(prompt) {
	try {
		const response = await llmService.query(prompt)
		return response
	} catch (error) {
		console.error(error)
		throw error
	}
}

async function uploadPdf(path) {
	try {
		const reducedChunks = await docService.loadAndGetReduceDocs(path)
		await dbService.uploadToPinecone(reducedChunks)
		return true
	} catch (err) {
		console.error(err)
		throw err
	}
}

async function transcribeVideo(url) {
	try {
		const transcript = await thirdPartyService.getYoutubeTranscript(url)
		if (!transcript) {
			throw new Error('No transcript found')
		}
		const reducedTranscript = await docService.getReducedText(transcript)
		await dbService.uploadToPinecone(reducedTranscript)
		return transcript
	} catch (error) {
		console.error(error)
		throw error
	}
}

async function initializeVars({
	temperature = 0,
	streaming = false,
	queryVector = false,
	memoryOption = false,
}) {
	try {
		return await llmService.initializeVars(temperature, streaming, queryVector, memoryOption)
	} catch (error) {
		console.error(error)
		throw error
	}
}
