import { YoutubeTranscript } from 'youtube-transcript'

export const thirdPartyService = {
	getYoutubeTranscript,
}

async function getYoutubeTranscript(url) {
	const transcriptResponse = await YoutubeTranscript.fetchTranscript(prompt)
	if (!transcriptResponse) {
		return res.status(500).json({ error: 'An error occurred while fetching transcript' })
	}
	const transcript = transcriptResponse.map((item) => item.text).join(' ')
	return transcript
}
