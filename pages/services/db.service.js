import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { PineconeClient } from '@pinecone-database/pinecone'
import { Document } from 'langchain/document'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { CharacterTextSplitter } from 'langchain/text_splitter'
import { VectorStoreRetrieverMemory } from 'langchain/memory'

export const dbService = {
	upload,
	getVectorStore,
}

async function upload(path) {
	try {
		const docs = await loadDocs(path)
		const chunks = await splitToChunks(docs)
		const reducedChunks = reduceChunks(chunks)
		return await uploadToPinecone(reducedChunks)
	} catch (err) {
		console.error(err)
		throw err
	}
}

async function loadDocs(path) {
	const loader = new PDFLoader(path, {
		pdfjs: () => import('pdfjs-dist/legacy/build/pdf.js'),
	})
	const docs = await loader.load()
	if (!docs) {
		throw new Error('No documents found.')
	}
	return docs
}

async function splitToChunks(docs) {
	const splitterOptions = {
		separator: ' ',
		chunkSize: 1000,
		chunkOverlap: 100,
	}
	const splitter = new CharacterTextSplitter(splitterOptions)
	const chunks = await splitter.splitDocuments(docs)
	return chunks
}

function reduceChunks(chunks) {
	const reducedDocs = chunks.map((chunk) => {
		const reducedMetadata = { ...chunk.metadata }
		delete reducedMetadata.pdf
		return new Document({
			pageContent: chunk.pageContent,
			metadata: reducedMetadata,
		})
	})
	return reducedDocs
}

async function initClient() {
	const client = new PineconeClient()
	await client.init({
		apiKey: process.env.PINECONE_API_KEY,
		environment: process.env.PINECONE_ENVIRONMENT,
	})
	const clientIndex = client.Index(process.env.PINECONE_INDEX)
	return clientIndex
}

async function uploadToPinecone(docs) {
	const clientIndex = await initClient()
	await PineconeStore.fromDocuments(docs, new OpenAIEmbeddings(), {
		pineconeIndex: clientIndex,
	})
	return true
}

async function getVectorStore(memoryOption = false) {
	const clientIndex = await initClient()
	const vectorStore = await PineconeStore.fromExistingIndex(new OpenAIEmbeddings(), {
		pineconeIndex: clientIndex,
	})

	if (!memoryOption) {
		return { vectorStore, vectorMemory: false }
	}

	const vectorMemory = new VectorStoreRetrieverMemory({
		vectorStoreRetriever: vectorStore.asRetriever(1),
		memoryKey: 'history',
	})

	return { vectorStore, vectorMemory }
}
