export const generateQuestionsAndAnswers = async (file: File): Promise<{ question: string, answer: string }[]> => {
  const fileReader = new FileReader();
  return new Promise((resolve, reject) => {
    fileReader.onload = async (e) => {
      const text = e.target?.result as string;

      try {
        const response = await fetch('/api/generateQA', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fileContent: text }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate Q&A');
        }

        const qaResults = await response.json();
        resolve(qaResults);
      } catch (error) {
        reject(error);
      }
    };

    fileReader.readAsText(file);
  });
};