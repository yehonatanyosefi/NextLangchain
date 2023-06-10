import { YoutubeTranscript } from 'youtube-transcript'
import axios from 'axios'

export const thirdPartyService = {
	getYoutubeTranscript,
	extractYoutubeVideoId,
	getYoutubeVideoMetaData,
}

async function getYoutubeTranscript(url) {
	try {
		const transcriptResponse = await YoutubeTranscript.fetchTranscript(url)
		const transcript = transcriptResponse.map((item) => item.text).join(' ')
		return transcript
	} catch (error) {
		throw new Error(`Failed to fetch Youtube transcript: ${error}`)
	}
}

function extractYoutubeVideoId(url) {
	const urlParams = new URLSearchParams(new URL(url).search)
	return urlParams.get('v')
}

async function getYoutubeVideoMetaData(videoId) {
	const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${GOOGLE_API_KEY}&part=snippet,contentDetails,statistics,status`
	try {
		const {
			data: {
				items: [metadata],
			},
		} = await axios.get(url)

		const {
			snippet: { title: videoTitle, description },
			id: videoId,
		} = metadata
		const firstDescription = description.split('.')[0]

		const shortMetadata = { videoTitle, videoDescription: firstDescription, videoId }
		return shortMetadata
	} catch (error) {
		throw new Error(`Failed to fetch video metadata: ${error}`)
	}
}
