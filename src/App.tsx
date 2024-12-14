import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dropzone } from './components/Dropzone';
import { generateQuestionsAndAnswers } from './utils/openai-helper';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<{question: string, answer: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  };

  const handleGenerateQA = async () => {
    if (!file) return;

    setIsLoading(true);
    try {
      const qaResults = await generateQuestionsAndAnswers(file);
      setQuestions(qaResults);
    } catch (error) {
      console.error('Error generating Q&A:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Research Paper Q&A Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <Dropzone onFileUpload={handleFileUpload} />
          {file && (
            <div className="mt-4">
              <p>Selected File: {file.name}</p>
              <Button 
                onClick={handleGenerateQA} 
                disabled={isLoading}
                className="mt-2"
              >
                {isLoading ? 'Generating...' : 'Generate Q&A'}
              </Button>
            </div>
          )}

          {questions.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-bold mb-4">Key Takeaways</h2>
              {questions.map((qa, index) => (
                <div key={index} className="mb-4 p-4 bg-gray-100 rounded">
                  <h3 className="font-semibold">{qa.question}</h3>
                  <p className="text-gray-700 mt-2">{qa.answer}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default App;