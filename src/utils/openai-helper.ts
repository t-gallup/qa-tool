import { generateQuickSummary } from './summarizer';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

// Only set worker in browser environment
if (typeof window !== 'undefined') {
  const pdfjsWorker = require('pdfjs-dist/build/pdf.worker.entry');
  GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument(arrayBuffer).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
}

export const generateQuestionsAndAnswers = async (file: File): Promise<{ question: string, answer: string }[]> => {
  try {
    // Extract text properly from PDF
    const text = await extractTextFromPDF(file);

    // Clean the extracted text
    const cleanedText = text
      .replace(/[^\x20-\x7E\n]/g, '') // Remove non-printable characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    if (!cleanedText) {
      throw new Error('No readable text could be extracted from the PDF');
    }

    // Generate summary from cleaned text
    const { summary, hash } = await generateQuickSummary(cleanedText);

    // Try to generate Q&A from local summary first
    const localQA = generateLocalQA(summary);

    // If we have enough good questions, use them
    if (localQA.length >= 3) {
      return localQA;
    }

    // Otherwise, fall back to Claude API
    const response = await fetch('/api/generateQA', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        fileContent: cleanedText,
        summaryHash: hash
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
      return localQA;
    }

    const qaResults = await response.json();
    return qaResults;
  } catch (error) {
    console.error('Error in generateQuestionsAndAnswers:', error);
    throw error;
  }
};

// Generate Q&A pairs from local summary
const generateLocalQA = (summary: string[]): { question: string, answer: string }[] => {
  return summary.map(sentence => {
    // Remove common prefixes if they exist
    const cleanSentence = sentence
      .replace(/^(in conclusion|we found that|results show that|the study demonstrates that)/i, '')
      .trim();
    
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
