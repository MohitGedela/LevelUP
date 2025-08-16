'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [userTopics, setUserTopics] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/plain') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please select a valid text file (.txt)');
      setFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file');
      return;
    }
    
    if (!userTopics.trim()) {
      setError('Please specify the topics you want to focus on');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const text = await file.text();
      localStorage.setItem('fileContent', text);
      localStorage.setItem('userTopics', userTopics);

      const response = await fetch('/api/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileContent: text,
          userTopics: userTopics.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate topics');
      }

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('generatedTopics', JSON.stringify(data.topics));
        router.push('/topics');
      } else {
        throw new Error(data.error || 'Topic generation failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          {/* LevelUp Logo */}
          <div className="mb-8">
            <svg className="w-24 h-24 mx-auto" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="45" fill="url(#gradient)" stroke="#3B82F6" strokeWidth="2"/>
              <path d="M30 40L45 55L70 30" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6"/>
                  <stop offset="100%" stopColor="#8B5CF6"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            Upload Your Document
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Upload a text document and specify the topics you want to focus on. 
            Our AI will generate personalized learning content just for you.
          </p>
        </div>

        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* File Upload Section */}
            <div className="space-y-4">
              <label className="block text-lg font-semibold text-white">
                Step 1: Select Your Document
              </label>
              <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-cyan-500 transition-colors duration-200">
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center space-y-4"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-white">
                      {file ? file.name : 'Click to select a text file'}
                    </p>
                    <p className="text-gray-400 mt-1">
                      Supports .txt files only
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Topics Input Section */}
            <div className="space-y-4">
              <label className="block text-lg font-semibold text-white">
                Step 2: Specify Your Topics
              </label>
              <div className="space-y-3">
                <p className="text-gray-300 text-sm">
                  Enter the specific topics you want to focus on, separated by commas:
                </p>
                <textarea
                  value={userTopics}
                  onChange={(e) => setUserTopics(e.target.value)}
                  placeholder="e.g., Machine Learning, Neural Networks, Deep Learning, Data Preprocessing, Model Evaluation"
                  className="w-full h-32 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                  required
                />
                <p className="text-gray-400 text-xs">
                  The AI will generate exactly the number of topics you specify, focusing only on these areas.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading || !file || !userTopics.trim()}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-2xl hover:shadow-cyan-500/25"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating Topics...</span>
                  </div>
                ) : (
                  'Generate Learning Topics'
                )}
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400 text-center">{error}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
