import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY
});

export const generateQuestionsAndAnswers = async (file: File): Promise<{question: string, answer: string}[]> => {
  // Read file contents
  const fileReader = new FileReader();
  return new Promise((resolve, reject) => {
    fileReader.onload = async (e) => {
      const text = e.target?.result as string;
      
      try {
        const response = await anthropic.messages.create({
          model: "claude-3-opus-20240229",
          max_tokens: 1024,
          messages: [
            {
              role: "user",
              content: `Analyze this research paper and generate 5-7 key questions and answers that capture its most important insights:

Paper Contents:
${text}

For each question, provide:
1. A concise, clear question that addresses a core finding or significant aspect of the paper
2. A direct, informative answer that summarizes the key point

Output format:
- Question 1
- Answer 1
- Question 2
- Answer 2
...`
            }
          ]
        });

        // Parse the response into question-answer pairs
        const qaText = response.content[0].text;
        const qaLines = qaText.split('\n').filter(line => line.trim() !== '');
        
        const qaResult: {question: string, answer: string}[] = [];
        for (let i = 0; i < qaLines.length; i += 2) {
          if (i + 1 < qaLines.length) {
            qaResult.push({
              question: qaLines[i].replace(/^-\s*/, ''),
              answer: qaLines[i + 1].replace(/^-\s*/, '')
            });
          }
        }

        resolve(qaResult);
      } catch (error) {
        reject(error);
      }
    };
    
    fileReader.readAsText(file);
  });
};