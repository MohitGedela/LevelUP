'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface FinalExamResult {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  date: string;
  questions?: Array<{
    id: number;
    question: string;
    options?: string[];
    correctAnswer: number | boolean | string;
    type?: string;
    explanation?: string;
  }>;
  userAnswers?: Record<number, number | boolean | string>;
}

export default function FinalExamAttemptPage() {
  const params = useParams();
  const [examResult, setExamResult] = useState<FinalExamResult | null>(null);
  const [allResults, setAllResults] = useState<FinalExamResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Get final exam results from localStorage
    const finalExamResults = localStorage.getItem('finalExamResults');
    if (finalExamResults) {
      const results = JSON.parse(finalExamResults);
      
      // Sort by date (newest first)
      results.sort((a: { date?: string }, b: { date?: string }) => {
        try {
          const dateA = new Date(a.date || 0);
          const dateB = new Date(b.date || 0);
          return dateB.getTime() - dateA.getTime();
        } catch {
          return 0; // If sorting fails, maintain original order
        }
      });
      
      setAllResults(results);
      
      const attemptIndex = parseInt(params.attemptIndex as string);
      if (results[attemptIndex]) {
        setExamResult(results[attemptIndex]);
        setCurrentIndex(attemptIndex);
      }
    }
  }, [params.attemptIndex]);

  const navigateToAttempt = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < allResults.length) {
      setCurrentIndex(newIndex);
      setExamResult(allResults[newIndex]);
      // Update URL without page reload
      window.history.replaceState({}, '', `/final-exam-attempt/${newIndex}`);
    }
  };

  const goToPreviousAttempt = () => {
    navigateToAttempt(currentIndex - 1);
  };

  const goToNextAttempt = () => {
    navigateToAttempt(currentIndex + 1);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/30';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/30';
    if (score >= 40) return 'bg-orange-500/20 border-orange-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const formatAnswer = (answer: number | boolean | string, type?: string, options?: string[]) => {
    if (type === 'true_false') {
      return answer === true || answer === 0 ? 'True' : 'False';
    }
    if (type === 'multiple-choice' && options && Array.isArray(options)) {
      return options[answer as number] || 'Unknown';
    }
    return String(answer);
  };

  if (!examResult) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">Attempt Not Found</h3>
          <p className="text-gray-400 mb-6">The requested final exam attempt could not be found.</p>
          <Link
            href="/progress"
            className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
          >
            Back to Progress
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500 mb-2">
                Final Exam Attempt - Detailed Results
              </h1>
              <p className="text-gray-300 text-lg">
                {new Date(examResult.date).toLocaleDateString()} at {new Date(examResult.date).toLocaleTimeString()}
              </p>
              {/* Attempt Navigation */}
              <div className="flex items-center space-x-4 mt-3">
                <span className="text-sm text-gray-400">
                  Attempt {currentIndex + 1} of {allResults.length}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={goToPreviousAttempt}
                    disabled={currentIndex === 0}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      currentIndex === 0
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white hover:scale-105'
                    }`}
                    title="Previous Attempt"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={goToNextAttempt}
                    disabled={currentIndex === allResults.length - 1}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      currentIndex === allResults.length - 1
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white hover:scale-105'
                    }`}
                    title="Next Attempt"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/progress"
                className="bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
              >
                ← Back to Progress
              </Link>
              <Link
                href="/final-exam"
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
              >
                Retake Final Exam
              </Link>
            </div>
          </div>
        </div>

        {/* Score Summary */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-8 border border-gray-600 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-3 ${getScoreBgColor(examResult.score)}`}>
                <span className={`text-3xl font-bold ${getScoreColor(examResult.score)}`}>
                  {examResult.score}%
                </span>
              </div>
              <div className="text-sm text-gray-400">Final Score</div>
            </div>
            <div>
              <div className="w-24 h-24 bg-blue-500/20 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl font-bold text-blue-400">
                  {examResult.correctAnswers}
                </span>
              </div>
              <div className="text-sm text-gray-400">Correct Answers</div>
            </div>
            <div>
              <div className="w-24 h-24 bg-purple-500/20 border border-purple-500/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl font-bold text-purple-400">
                  {examResult.totalQuestions}
                </span>
              </div>
              <div className="text-sm text-gray-400">Total Questions</div>
            </div>
          </div>

          {/* Performance Indicator */}
          <div className="mt-6 text-center">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-medium ${getScoreBgColor(examResult.score)}`}>
              {examResult.score >= 80 ? '🎯 Excellent Performance' :
               examResult.score >= 60 ? '👍 Good Performance' :
               examResult.score >= 40 ? '⚠️ Fair Performance' : '❌ Needs Improvement'}
            </div>
          </div>
        </div>

        {/* Questions Review */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-200 mb-6">Questions Review</h2>
          
          {examResult.questions && examResult.questions.length > 0 ? (
            examResult.questions.map((question, qIndex) => {
              const userAnswer = examResult.userAnswers?.[question.id];
              const isCorrect = userAnswer === question.correctAnswer;
              const hasUserAnswer = userAnswer !== undefined;
              
              return (
                <div
                  key={qIndex}
                  className={`bg-gray-800 rounded-lg p-6 border-2 ${
                    hasUserAnswer 
                      ? (isCorrect ? 'border-green-500 bg-green-500/5' : 'border-red-500 bg-red-500/5')
                      : 'border-gray-700 bg-gray-800/50'
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold text-gray-300">
                      Question {qIndex + 1}
                    </span>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                      hasUserAnswer 
                        ? (isCorrect ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30')
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}>
                      {hasUserAnswer 
                        ? (isCorrect ? '✓ Correct' : '✗ Incorrect')
                        : '○ Not Answered'
                      }
                    </span>
                  </div>

                  {/* Question Text */}
                  <div className="mb-4">
                    <p className="text-gray-200 text-lg mb-3">{question.question}</p>
                    
                    {/* Question Type */}
                    {question.type && (
                      <span className="inline-block bg-gray-600 text-gray-300 text-xs px-2 py-1 rounded-full mb-3">
                        {question.type === 'multiple-choice' ? 'Multiple Choice' :
                         question.type === 'true_false' ? 'True/False' : 'Text Input'}
                      </span>
                    )}
                  </div>

                  {/* Multiple Choice Options */}
                  {question.type === 'multiple-choice' && question.options && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Options:</h4>
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => {
                          const isUserChoice = userAnswer === optIndex;
                          const isCorrectChoice = question.correctAnswer === optIndex;
                          
                          return (
                            <div
                              key={optIndex}
                              className={`p-3 rounded-lg border-2 ${
                                isCorrectChoice 
                                  ? 'border-green-500 bg-green-500/10' 
                                  : isUserChoice && !isCorrectChoice
                                  ? 'border-red-500 bg-red-500/10'
                                  : 'border-gray-600 bg-gray-700/50'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                                  isCorrectChoice 
                                    ? 'bg-green-500 text-white' 
                                    : isUserChoice && !isCorrectChoice
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-600 text-gray-300'
                                }`}>
                                  {optIndex + 1}
                                </span>
                                <span className={`flex-1 ${
                                  isCorrectChoice 
                                    ? 'text-green-400 font-medium' 
                                    : isUserChoice && !isCorrectChoice
                                    ? 'text-red-400 font-medium'
                                    : 'text-gray-300'
                                }`}>
                                  {option}
                                </span>
                                {isCorrectChoice && (
                                  <span className="text-green-400 text-sm">✓ Correct Answer</span>
                                )}
                                {isUserChoice && !isCorrectChoice && (
                                  <span className="text-red-400 text-sm">✗ Your Answer</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* True/False Options */}
                  {question.type === 'true_false' && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Options:</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {["True", "False"].map((option, optIndex) => {
                          const isUserChoice = userAnswer === optIndex;
                          const isCorrectChoice = question.correctAnswer === optIndex;
                          
                          return (
                            <div
                              key={optIndex}
                              className={`p-3 rounded-lg border-2 text-center ${
                                isCorrectChoice 
                                  ? 'border-green-500 bg-green-500/10' 
                                  : isUserChoice && !isCorrectChoice
                                  ? 'border-red-500 bg-red-500/10'
                                  : 'border-gray-600 bg-gray-700/50'
                              }`}
                            >
                              <span className={`font-medium ${
                                isCorrectChoice 
                                  ? 'text-green-400' 
                                  : isUserChoice && !isCorrectChoice
                                  ? 'text-red-400'
                                  : 'text-gray-300'
                              }`}>
                                {option}
                              </span>
                              {isCorrectChoice && (
                                <span className="block text-green-400 text-sm mt-1">✓ Correct</span>
                              )}
                              {isUserChoice && !isCorrectChoice && (
                                <span className="block text-red-400 text-sm mt-1">✗ Your Choice</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* User Answer and Correct Answer */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-700 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Your Answer:</h4>
                      <p className={`font-medium ${
                        hasUserAnswer 
                          ? (isCorrect ? 'text-green-400' : 'text-red-400')
                          : 'text-gray-500'
                      }`}>
                        {hasUserAnswer 
                          ? formatAnswer(userAnswer, question.type, question.options)
                          : 'Not answered'
                        }
                      </p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Correct Answer:</h4>
                      <p className="text-green-400 font-medium">
                        {formatAnswer(question.correctAnswer, question.type, question.options)}
                      </p>
                    </div>
                  </div>

                  {/* Explanation */}
                  {question.explanation && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-blue-400 mb-2">Explanation:</h4>
                      <p className="text-blue-300">{question.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No Questions Available</h3>
              <p className="text-gray-400">Question details are not available for this attempt.</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <Link
            href="/progress"
            className="bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
          >
            Back to Progress
          </Link>
          <Link
            href="/final-exam"
            className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
          >
            Retake Final Exam
          </Link>
        </div>
      </div>
    </div>
  );
}
