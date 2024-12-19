import { NextApiRequest, NextApiResponse } from 'next';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY,
});

function parseQAResponse(text: string): { question: string; answer: string }[] {
  const lines = text.split('\n').filter(line => line.trim());
  const qa: { question: string; answer: string }[] = [];
  
  for (let i = 0; i < lines.length; i += 2) {
    if (i + 1 < lines.length) {
      const question = lines[i].replace(/^[-•*]\s*/, '').trim();
      const answer = lines[i + 1].replace(/^[-•*]\s*/, '').trim();
      
      // Only add if we haven't seen this question before
      if (!qa.some(pair => pair.question === question)) {
        qa.push({ question, answer });
      }
    }
  }
  
  return qa;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { fileContent } = req.body;

    try {
      const response = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `Analyze this research paper and generate 5-7 key questions and answers that capture its most important insights, with no duplicates:\n\nPaper Contents:\n${fileContent}\n\nFor each question, provide:\n1. A concise, clear question that addresses a core finding or significant aspect of the paper\n2. A direct, informative answer that summarizes the key point\n\nOutput format:\n- Question 1\n- Answer 1\n- Question 2\n- Answer 2\n...`
          }
        ]
      });

      // Parse the response into Q&A pairs
      const qaResults = parseQAResponse(response.content[0].text);
      
      res.status(200).json(qaResults);
    } catch (error) {
      console.error('Error generating Q&A:', error);
      res.status(500).json({ error: 'Error generating Q&A' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}