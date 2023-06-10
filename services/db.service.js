import { PineconeClient } from '@pinecone-database/pinecone'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'

const EMBEDDING = new OpenAIEmbeddings()
let gClientIndex = null

export const dbService = {
	getVectorStore,
	uploadToPinecone,
	EMBEDDING,
}

async function uploadToPinecone(inputs) {
	if (!gClientIndex) gClientIndex = await _initClient()
	if (typeof inputs[0] === 'string') {
		await uploadTexts(inputs)
		return
	}
	await uploadDocs(inputs)
	return
}

async function uploadDocs(docs) {
	await PineconeStore.fromDocuments(docs, EMBEDDING, {
		pineconeIndex: gClientIndex,
	})
	return true
}

async function uploadTexts(texts) {
	await PineconeStore.fromTexts(texts, [], EMBEDDING, {
		pineconeIndex: gClientIndex,
	})
	return true
}

async function getVectorStore(memoryOption = false) {
	if (!gClientIndex) gClientIndex = await _initClient()
	const vectorStore = await PineconeStore.fromExistingIndex(EMBEDDING, {
		pineconeIndex: gClientIndex,
	})
	return vectorStore
}

async function _initClient() {
	const client = new PineconeClient()
	await client.init({
		apiKey: process.env.PINECONE_API_KEY,
		environment: process.env.PINECONE_ENVIRONMENT,
	})
	const clientIndex = client.Index(process.env.PINECONE_INDEX)
	return clientIndex
}
