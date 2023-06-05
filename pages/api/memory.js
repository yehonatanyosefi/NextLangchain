import { OpenAI } from 'langchain';
import { BufferMemory } from 'langchain/memory';
import { ConversationChain } from 'langchain/chains';

let model;
let memory;
let chain;

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { input, firstMsg } = req.body;

    if (!input) {
      throw new Error("No input provided");
    }
    if (firstMsg) {
      model = new OpenAI({
        modelName: "gpt-3.5-turbo",
        temperature: 0.1,
      });
      memory = new BufferMemory();
      chain = new ConversationChain({ llm: model, memory });
    }
    const response = await chain.call({ input });
    return res.status(200).json({ output: response });
  } else {
    return res
      .status(405)
      .json({ error: "Method not allowed, only POST is allowed." });
  }
}
