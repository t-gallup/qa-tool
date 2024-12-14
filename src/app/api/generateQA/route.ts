import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { fileContent } = await request.json();

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

    // Parse the response to extract questions and answers
    const content = response.content[0].text;
    const lines = content.split('\n').filter(line => line.trim());
    const qaArray = [];

    for (let i = 0; i < lines.length; i += 2) {
      if (lines[i].startsWith('- Question') && i + 1 < lines.length && lines[i + 1].startsWith('- Answer')) {
        qaArray.push({
          question: lines[i].replace('- Question \d+:', '').trim(),
          answer: lines[i + 1].replace('- Answer \d+:', '').trim()
        });
      }
    }

    return NextResponse.json(qaArray);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Error generating Q&A' },
      { status: 500 }
    );
  }
}
