import { generateQuickSummary } from './summarizer';

export const generateQuestionsAndAnswers = async (file: File): Promise<{ question: string, answer: string }[]> => {
  const fileReader = new FileReader();
  
  return new Promise((resolve, reject) => {
    fileReader.onload = async (e) => {
      const text = e.target?.result as string;

      try {
        // First, try quick local summary
        const { summary, hash } = await generateQuickSummary(text);

        // Try to generate Q&A from local summary first
        const localQA = generateLocalQA(summary);

        // If we have enough good questions, use them
        if (localQA.length >= 3) {
          return resolve(localQA);
        }

        // Otherwise, fall back to Claude API
        const response = await fetch('/api/generateQA', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            fileContent: text,
            summaryHash: hash // Send hash for potential caching
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error('API Error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
          // If API fails, return local results anyway
          return resolve(localQA);
        }

        const qaResults = await response.json();
        resolve(qaResults);
      } catch (error) {
        console.error('Error in generateQuestionsAndAnswers:', error);
        reject(error);
      }
    };

    fileReader.onerror = (error) => {
      console.error('FileReader error:', error);
      reject(error);
    };

    fileReader.readAsText(file);
  });
};

// Generate Q&A pairs from local summary
const generateLocalQA = (summary: string[]): { question: string, answer: string }[] => {
  return summary.map(sentence => {
    // Remove common prefixes if they exist
    const cleanSentence = sentence.replace(/^(in conclusion|we found that|results show that|the study demonstrates that)/i, '').trim();
    
    // Convert statement to question
    const question = generateQuestionFromStatement(cleanSentence);
    
    return {
      question,
      answer: cleanSentence
    };
  });
};

// Convert a statement into a question
const generateQuestionFromStatement = (statement: string): string => {
  // Basic question transformation rules
  if (statement.toLowerCase().includes('percentage') || /\d+%/.test(statement)) {
    return `What percentage ${statement.toLowerCase().includes('of') ? 
      statement.split('of')[1].trim() : 
      'is mentioned in the findings'}?`;
  }
  
  if (/\d+/.test(statement)) {
    return 'What specific numerical finding was discovered in the study?';
  }
  
  if (statement.toLowerCase().includes('relationship') || 
      statement.toLowerCase().includes('correlation') || 
      statement.toLowerCase().includes('between')) {
    return 'What relationship was found in the study?';
  }
  
  // Default transformation
  return `What did the study reveal about ${statement.split(' ').slice(0, 3).join(' ')}...?`;
};
