import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { Document } from 'langchain/document'
import { CharacterTextSplitter } from 'langchain/text_splitter'

export const docService = {
	loadAndGetReduceDocs,
	getReducedText,
}

async function loadAndGetReduceDocs(path) {
	try {
		// if (path.endsWith('.pdf')) return await loadAndGetReduceDocsFromPdf(path)
		const docs = await loadDocs(path)
		const chunks = await splitToChunks(docs)
		const reducedChunks = reduceChunks(chunks)
		return reducedChunks
	} catch (err) {
		console.error(err)
		throw err
	}
}

async function getReducedText(text, chunkSize = 1000, chunkOverlap = 100) {
	const splitter = new CharacterTextSplitter({
		separator: ' ',
		chunkSize,
		chunkOverlap,
	})
	const docs = await splitter.createDocuments([text])
	return docs
}

async function loadDocs(path) {
	const loader = new PDFLoader(path)
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
