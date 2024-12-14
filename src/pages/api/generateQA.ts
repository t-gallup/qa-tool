import { NextApiRequest, NextApiResponse } from 'next';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY, // Use environment variable
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { fileContent } = req.body; // Assuming you send the file content in the request body

    try {
      const response = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `Analyze this research paper and generate 5-7 key questions and answers that capture its most important insights:\n\nPaper Contents:\n${fileContent}\n\nFor each question, provide:\n1. A concise, clear question that addresses a core finding or significant aspect of the paper\n2. A direct, informative answer that summarizes the key point\n\nOutput format:\n- Question 1\n- Answer 1\n- Question 2\n- Answer 2\n...`
          }
        ]
      });

      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: 'Error generating Q&A' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 