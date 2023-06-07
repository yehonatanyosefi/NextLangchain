import { YoutubeTranscript } from 'youtube-transcript'

export const thirdPartyService = {
	getYoutubeTranscript,
}

async function getYoutubeTranscript(url) {
	const transcriptResponse = await YoutubeTranscript.fetchTranscript(url)
	const transcript = transcriptResponse.map((item) => item.text).join(' ')
	return transcript
}
