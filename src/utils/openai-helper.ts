const MAX_TOKENS = 200000; // Adjust this based on the API's actual limit

const chunkText = (text: string, maxTokens: number) => {
  const words = text.split(' ');
  const chunks: string[] = [];
  let currentChunk = '';

  for (const word of words) {
    if ((currentChunk + word).length > maxTokens) {
      chunks.push(currentChunk.trim());
      currentChunk = word + ' ';
    } else {
      currentChunk += word + ' ';
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
};

export const generateQuestionsAndAnswers = async (file: File): Promise<{ question: string, answer: string }[]> => {
  const fileReader = new FileReader();
  return new Promise((resolve, reject) => {
    fileReader.onload = async (e) => {
      const text = e.target?.result as string;

      try {
        const chunks = chunkText(text, MAX_TOKENS);
        const allResponses = [];

        for (const chunk of chunks) {
          const response = await fetch('/api/generateQA', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fileContent: chunk }),
          });

          if (!response.ok) {
            throw new Error('Failed to generate Q&A');
          }

          const qaResults = await response.json();
          allResponses.push(...qaResults);
        }

        resolve(allResponses);
      } catch (error) {
        reject(error);
      }
    };

    fileReader.readAsText(file);
  });
};