'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Question } from '@/types';

interface Exam {
  questions: Question[];
}

interface Topic {
  id: string;
  title: string;
  description: string;
  difficulty: string;
}

export default function FinalExamPage() {
  const [exam, setExam] = useState<Exam | null>(null); // Changed to any for now as Exam type is removed
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | boolean | string>>({});
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    // Just check if data exists, don't auto-generate
    const selectedTopicsData = localStorage.getItem('selectedTopics');
    const generatedTopicsData = localStorage.getItem('generatedTopics');
    const fileContent = localStorage.getItem('fileContent');
    
    console.log('Debug localStorage:', {
      selectedTopicsData,
      generatedTopicsData: generatedTopicsData ? 'Found' : 'Missing',
      fileContent: fileContent ? `${fileContent.length} chars` : 'Missing'
    });
    
    if (!selectedTopicsData || !generatedTopicsData || !fileContent) {
      setError('Please upload a document and select topics first before generating the final exam.');
    }
    setIsLoading(false);
  }, []);

  const generateFinalExam = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setDebugInfo(null);
      
      const selectedTopicsData = localStorage.getItem('selectedTopics');
      const generatedTopicsData = localStorage.getItem('generatedTopics');
      const fileContent = localStorage.getItem('fileContent') || '';
      
      // Debug information
      const debug = {
        selectedTopicsData: selectedTopicsData ? 'Found' : 'Missing',
        generatedTopicsData: generatedTopicsData ? 'Found' : 'Missing',
        fileContent: fileContent ? `${fileContent.length} characters` : 'Missing'
      };
      setDebugInfo(debug);
      
      if (!selectedTopicsData || !generatedTopicsData) {
        throw new Error('No topics selected. Please upload a document and select topics first.');
      }
      
      if (!fileContent || fileContent.trim().length === 0) {
        throw new Error('No document content found. Please upload a document first.');
      }
      
      const selectedIds: string[] = JSON.parse(selectedTopicsData); // Changed from number[] to string[]
      const allTopics = JSON.parse(generatedTopicsData);
      
      // Get selected topic IDs from localStorage
      if (!selectedTopicsData) {
        setError('No topics selected. Please go back and select topics first.');
        return;
      }
      
      // Get the actual topic objects for selected IDs - FIX: Handle string IDs properly
      const selectedTopics = allTopics.filter((topic: Topic) => {
        // Don't parse to int - just compare strings directly
        return selectedIds.includes(topic.id);
      });
      
      if (selectedTopics.length === 0) {
        console.error('Debug info:', { selectedIds, allTopics, selectedTopics });
        throw new Error('No valid topics found. Please upload a document and select topics first.');
      }
      
      console.log('Generating final exam with:', {
        topics: selectedTopics.length,
        fileContentLength: fileContent.length
      });
      
      const response = await fetch('/api/final-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topics: selectedTopics,
          fileContent,
          questionCount: 15 // Reduced from 20 for better performance
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setExam(data.exam);
        console.log('Exam generated successfully:', data.exam);
      } else {
        throw new Error(data.error || 'Failed to generate exam');
      }
    } catch (error) {
      console.error('Failed to generate exam:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setExam(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (questionId: number, answer: number | boolean | string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const submitExam = () => {
    setShowResults(true);
    
    // Calculate results
    const totalQuestions = exam!.questions.length;
    let correctAnswers = 0;
    
    exam!.questions.forEach((q: Question) => {
      if (answers[q.id] === q.correctAnswer) {
        correctAnswers++;
      }
    });
    
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    
    // Save final exam result to finalExamResults array
    const finalExamResult = {
      score,
      correctAnswers,
      totalQuestions,
      date: new Date().toISOString(),
      questions: exam!.questions,
      userAnswers: answers
    };
    
    // Get existing final exam results or create new array
    const existingFinalExamResults = localStorage.getItem('finalExamResults');
    const finalExamResults = existingFinalExamResults ? JSON.parse(existingFinalExamResults) : [];
    
    // Add new result to array
    finalExamResults.push(finalExamResult);
    localStorage.setItem('finalExamResults', JSON.stringify(finalExamResults));
    
    // Also save to quizResults for progress tracking
    const existingResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
    existingResults.push({
      topicId: 'final_exam',
      quizId: 'final_exam',
      score: score,
      correct: correctAnswers,
      total: totalQuestions,
      date: new Date().toISOString(),
      questions: exam!.questions,
      userAnswers: answers,
      isFinalExam: true
    });
    localStorage.setItem('quizResults', JSON.stringify(existingResults));
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="relative">
          <div className="animate-spin w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-6"></div>
          <div className="absolute inset-0 animate-ping w-16 h-16 border-2 border-cyan-400 rounded-full mx-auto opacity-20"></div>
        </div>
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">Generating Your Final Exam</h2>
        <p className="text-gray-300 text-lg mb-2">AI is creating comprehensive questions...</p>
        <p className="text-gray-400 text-sm">This may take a few moments</p>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500 mb-4">
            Exam Generation Failed
          </h1>
          <p className="text-gray-300 text-lg mb-6">
            {error || 'We couldn\'t generate your final exam. This usually happens when no topics are selected or there\'s an issue with the document content.'}
          </p>
        </div>
        
        {/* Debug Information */}
        {debugInfo && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6 text-left">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Debug Information:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-400">Selected Topics:</span> <span className={debugInfo.selectedTopicsData === 'Found' ? 'text-green-400' : 'text-red-400'}>{debugInfo.selectedTopicsData}</span></div>
              <div><span className="text-gray-400">Generated Topics:</span> <span className={debugInfo.generatedTopicsData === 'Found' ? 'text-green-400' : 'text-red-400'}>{debugInfo.generatedTopicsData}</span></div>
              <div><span className="text-gray-400">File Content:</span> <span className={debugInfo.fileContent !== 'Missing' ? 'text-green-400' : 'text-red-400'}>{debugInfo.fileContent}</span></div>
            </div>
          </div>
        )}
        
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 mb-8">
          <div className="space-y-4">
            <button
              onClick={generateFinalExam}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              Generate Final Exam
            </button>
            
            <div className="pt-4 border-t border-gray-700">
              <p className="text-gray-400 mb-4">Or try these solutions:</p>
              <div className="space-y-3">
                <Link
                  href="/upload"
                  className="block text-cyan-400 hover:text-cyan-300 transition-colors hover:underline"
                >
                  📄 Upload a new document
                </Link>
                <Link
                  href="/topics"
                  className="block text-blue-400 hover:text-blue-300 transition-colors hover:underline"
                >
                  🎯 Select different topics
                </Link>
                <Link
                  href="/progress"
                  className="block text-purple-400 hover:text-purple-300 transition-colors hover:underline"
                >
                  📊 View your progress
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    // Calculate results
    const totalQuestions = exam.questions.length;
    let correctAnswers = 0;
    
    exam.questions.forEach((q: Question) => {
      if (answers[q.id] === q.correctAnswer) {
        correctAnswers++;
      }
    });
    
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <span className="text-3xl font-bold text-white">{score}%</span>
          </div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">
            Final Exam Results
          </h1>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 mb-8">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{correctAnswers}</div>
              <div className="text-gray-400">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400">{totalQuestions - correctAnswers}</div>
              <div className="text-gray-400">Incorrect</div>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${score}%` }}
              ></div>
            </div>
            <div className="text-center mt-2">
              <span className="text-2xl font-bold text-cyan-400">{score}%</span>
              <span className="text-gray-400"> Score</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => {
                setShowResults(false);
                setCurrentQuestion(0);
                setAnswers({});
              }}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 mr-4"
            >
              Review Answers
            </button>
            
            <Link
              href="/progress"
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 inline-block"
            >
              View Progress
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">
          Final Exam
        </h1>
        <p className="text-gray-300 text-lg">
          Test your knowledge across all selected topics
        </p>
        <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-400">
          <span>Question {currentQuestion + 1} of {exam.questions.length}</span>
          <span>•</span>
          <span>{Object.keys(answers).length} answered</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${((currentQuestion + 1) / exam.questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 mb-8">
        <div className="mb-6">
          <span className="inline-block bg-cyan-600 text-white text-xs px-3 py-1 rounded-full mb-4">
            Question {currentQuestion + 1}
          </span>
          <h2 className="text-xl font-semibold text-white leading-relaxed">
            {exam.questions[currentQuestion].question}
          </h2>
        </div>

        {/* Answer Options */}
        {exam.questions[currentQuestion].options && (
          <div className="space-y-3 mb-6">
            {exam.questions[currentQuestion].options!.map((option: string, index: number) => { // Changed to any
              const isSelected = answers[exam.questions[currentQuestion].id] === index;
              const isCorrect = index === exam.questions[currentQuestion].correctAnswer;
              const showReview = showResults;
              
              return (
                <button
                  key={index}
                  onClick={() => !showReview && handleAnswer(exam.questions[currentQuestion].id, index)}
                  disabled={showReview}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 transform hover:scale-[1.02] ${
                    showReview
                      ? isCorrect
                        ? 'border-green-500 bg-green-500/20 text-green-300 shadow-lg shadow-green-500/20'
                        : isSelected && !isCorrect
                        ? 'border-red-500 bg-red-500/20 text-red-300 shadow-lg shadow-red-500/20'
                        : 'border-gray-600 bg-gray-700/50 text-gray-400'
                      : isSelected
                      ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/20'
                      : 'border-gray-600 hover:border-cyan-400 hover:bg-cyan-500/10 text-gray-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 font-semibold text-sm transition-all duration-200 ${
                      showReview
                        ? isCorrect
                          ? 'border-green-500 bg-green-500 text-white'
                          : isSelected && !isCorrect
                          ? 'border-red-500 bg-red-500 text-white'
                          : 'border-gray-500 bg-gray-600 text-gray-400'
                        : isSelected
                        ? 'border-cyan-500 bg-cyan-500 text-white'
                        : 'border-gray-500 text-gray-400'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="font-medium leading-relaxed">{option}</span>
                    {showReview && (
                      <div className="ml-auto">
                        {isCorrect && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                            ✓ Correct
                          </span>
                        )}
                        {isSelected && !isCorrect && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                            ✗ Your Answer
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* True/False Options */}
        {exam.questions[currentQuestion].type === 'true_false' && (
          <div className="space-y-3 mb-6">
            {["True", "False"].map((option: string, index: number) => { // Changed to any
              const isSelected = answers[exam.questions[currentQuestion].id] === index;
              const isCorrect = index === exam.questions[currentQuestion].correctAnswer;
              const showReview = showResults;
              
              return (
                <button
                  key={index}
                  onClick={() => !showReview && handleAnswer(exam.questions[currentQuestion].id, index)}
                  disabled={showReview}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 transform hover:scale-[1.02] ${
                    showReview
                      ? isCorrect
                        ? 'border-green-500 bg-green-500/20 text-green-300 shadow-lg shadow-green-500/20'
                        : isSelected && !isCorrect
                        ? 'border-red-500 bg-red-500/20 text-red-300 shadow-lg shadow-red-500/20'
                        : 'border-gray-600 bg-gray-700/50 text-gray-400'
                      : isSelected
                      ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/20'
                      : 'border-gray-600 hover:border-cyan-400 hover:bg-cyan-500/10 text-gray-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 font-semibold text-sm transition-all duration-200 ${
                      showReview
                        ? isCorrect
                          ? 'border-green-500 bg-green-500 text-white'
                          : isSelected && !isCorrect
                          ? 'border-red-500 bg-red-500 text-white'
                          : 'border-gray-500 bg-gray-600 text-gray-400'
                        : isSelected
                        ? 'border-cyan-500 bg-cyan-500 text-white'
                        : 'border-gray-500 text-gray-400'
                    }`}>
                      {index === 0 ? 'T' : 'F'}
                    </div>
                    <span className="font-medium leading-relaxed">{option}</span>
                    {showReview && (
                      <div className="ml-auto">
                        {isCorrect && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                            ✓ Correct
                          </span>
                        )}
                        {isSelected && !isCorrect && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                            ✗ Your Answer
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Fill in the blank */}
        {exam.questions[currentQuestion].type === 'fill_blank' && (
          <div className="mb-6">
            <input
              type="text"
              placeholder="Type your answer..."
              value={answers[exam.questions[currentQuestion].id] as string || ''}
              onChange={(e) => !showResults && handleAnswer(exam.questions[currentQuestion].id, e.target.value)}
              disabled={showResults}
              className={`w-full p-4 bg-gray-700 border-2 rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors ${
                showResults
                  ? 'border-gray-600 text-gray-400 cursor-not-allowed'
                  : 'border-gray-600 focus:border-cyan-500'
              }`}
            />
            {showResults && (
              <div className="mt-3 p-3 rounded-lg bg-gray-700 border border-gray-600">
                <div className="text-sm text-gray-400 mb-2">Your Answer:</div>
                <div className="text-white font-medium">{answers[exam.questions[currentQuestion].id] as string || 'No answer provided'}</div>
                <div className="text-sm text-gray-400 mt-2 mb-2">Correct Answer:</div>
                <div className="text-green-400 font-medium">
                  {typeof exam.questions[currentQuestion].correctAnswer === 'string' 
                    ? exam.questions[currentQuestion].correctAnswer 
                    : 'Answer not available'}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:transform-none"
          >
            Previous
          </button>
          
          {showResults ? (
            // Review mode - no submit button
            <div className="flex space-x-4">
              {currentQuestion < exam.questions.length - 1 && (
                <button
                  onClick={() => setCurrentQuestion(Math.min(exam.questions.length - 1, currentQuestion + 1))}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  Next
                </button>
              )}
              <Link
                href="/progress"
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                View Progress
              </Link>
            </div>
          ) : (
            // Exam mode
            <div className="flex space-x-4">
              {currentQuestion === exam.questions.length - 1 ? (
                <button
                  onClick={submitExam}
                  disabled={Object.keys(answers).length < exam.questions.length}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:text-gray-400 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:transform-none"
                >
                  Submit Exam
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestion(Math.min(exam.questions.length - 1, currentQuestion + 1))}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  Next
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
