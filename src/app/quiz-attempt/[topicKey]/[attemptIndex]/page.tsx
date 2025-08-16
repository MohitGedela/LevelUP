'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface QuizAttempt {
  isFinalExam?: boolean;
  topicId?: string;
  score?: number;
  correct?: number;
  total?: number;
  questions?: Array<{
    id: number;
    question: string;
    options?: string[];
    correctAnswer: number | boolean | string;
    type?: string;
    explanation?: string;
  }>;
  userAnswers?: Record<number, number | boolean | string>;
  quizId?: string;
  date: string;
  topicTitle?: string;
}

export default function QuizAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const [currentAttempt, setCurrentAttempt] = useState<QuizAttempt | null>(null);
  const [allAttempts, setAllAttempts] = useState<QuizAttempt[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [topicKey, setTopicKey] = useState<string>('');
  const [attemptIndex, setAttemptIndex] = useState<number>(0);

  useEffect(() => {
    const topicKeyParam = params.topicKey as string;
    const attemptIndexParam = parseInt(params.attemptIndex as string);
    
    setTopicKey(topicKeyParam);
    setAttemptIndex(attemptIndexParam);

    // Get all attempts for this topic
    const quizResults = localStorage.getItem('quizResults');
    if (quizResults) {
      const results = JSON.parse(quizResults);
      const topicResults = results.filter((r: {
        isFinalExam?: boolean;
        topicId?: string;
      }) => {
        if (topicKeyParam === 'final_exam') {
          return r.isFinalExam;
        }
        return r.topicId === topicKeyParam;
      }).sort((a: { date: string }, b: { date: string }) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setAllAttempts(topicResults);
      
      if (topicResults[attemptIndexParam]) {
        setCurrentAttempt(topicResults[attemptIndexParam]);
      }
    }
  }, [params]);

  if (!currentAttempt) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-300 mb-4">Attempt Not Found</h2>
        <p className="text-gray-400 mb-6">The quiz attempt you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/progress"
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
        >
          Back to Progress
        </Link>
      </div>
    );
  }

  const topicName = currentAttempt.isFinalExam ? 'Final Exam' : (currentAttempt.topicTitle || currentAttempt.topicId || 'Unknown Topic');
  const totalAttempts = allAttempts.length;
  const currentAttemptNumber = totalAttempts - attemptIndex;
  const currentQuestion = currentAttempt.questions?.[currentQuestionIndex];
  const totalQuestions = currentAttempt.questions?.length || 0;

  const goToPreviousAttempt = () => {
    if (attemptIndex < totalAttempts - 1) {
      router.push(`/quiz-attempt/${topicKey}/${attemptIndex + 1}`);
    }
  };

  const goToNextAttempt = () => {
    if (attemptIndex > 0) {
      router.push(`/quiz-attempt/${topicKey}/${attemptIndex - 1}`);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">
          {topicName}
        </h1>
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
          <span>Attempt {currentAttemptNumber} of {totalAttempts}</span>
          <span>•</span>
          <span>{new Date(currentAttempt.date).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Score Summary */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-6 border border-gray-600 mb-8 text-center">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-3xl font-bold text-cyan-400">{currentAttempt.score || 0}%</div>
            <div className="text-gray-400 text-sm">Score</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-400">{currentAttempt.correct || 0}</div>
            <div className="text-gray-400 text-sm">Correct</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-400">{currentAttempt.total || 0}</div>
            <div className="text-gray-400 text-sm">Total</div>
          </div>
        </div>
      </div>

      {/* Attempt Navigation */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-8">
        <div className="flex items-center justify-between">
          <button
            onClick={goToPreviousAttempt}
            disabled={attemptIndex >= totalAttempts - 1}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              attemptIndex >= totalAttempts - 1
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gray-700 hover:bg-gray-600 text-white transform hover:scale-105'
            }`}
          >
            ← Previous Attempt
          </button>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-white">
              Attempt {currentAttemptNumber} of {totalAttempts}
            </div>
            <div className="text-sm text-gray-400">
              {new Date(currentAttempt.date).toLocaleDateString()} at {new Date(currentAttempt.date).toLocaleTimeString()}
            </div>
          </div>
          
          <button
            onClick={goToNextAttempt}
            disabled={attemptIndex <= 0}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              attemptIndex <= 0
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gray-700 hover:bg-gray-600 text-white transform hover:scale-105'
            }`}
          >
            Next Attempt →
          </button>
        </div>
      </div>

      {/* Question Navigation */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
          <span className="text-sm text-gray-400">
            {Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      {currentQuestion && (
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 mb-8">
          <div className="mb-6">
            <span className="inline-block bg-cyan-600 text-white text-xs px-3 py-1 rounded-full mb-4">
              Question {currentQuestionIndex + 1}
            </span>
            <h2 className="text-xl font-semibold text-white leading-relaxed">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Answer Options */}
          {currentQuestion.options && (
            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option, index) => {
                const userAnswer = currentAttempt.userAnswers?.[currentQuestion.id];
                const isSelected = userAnswer === index;
                const isCorrect = index === currentQuestion.correctAnswer;
                
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      isCorrect
                        ? 'border-green-500 bg-green-500/20'
                        : isSelected && !isCorrect
                        ? 'border-red-500 bg-red-500/20'
                        : 'border-gray-600 bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 font-semibold text-sm transition-all duration-200 ${
                        isCorrect
                          ? 'border-green-500 bg-green-500 text-white'
                          : isSelected && !isCorrect
                          ? 'border-red-500 bg-red-500 text-white'
                          : 'border-gray-500 bg-gray-600 text-gray-400'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="font-medium leading-relaxed text-white">{option}</span>
                      {isCorrect && (
                        <span className="ml-auto inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                          ✓ Correct
                        </span>
                      )}
                      {isSelected && !isCorrect && (
                        <span className="ml-auto inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                          ✗ Your Answer
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* True/False Options */}
          {currentQuestion.type === 'true_false' && (
            <div className="space-y-3 mb-6">
              {[true, false].map((option, index) => {
                const userAnswer = currentAttempt.userAnswers?.[currentQuestion.id];
                const isSelected = userAnswer === option;
                const isCorrect = option === currentQuestion.correctAnswer;
                
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      isCorrect
                        ? 'border-green-500 bg-green-500/20'
                        : isSelected && !isCorrect
                        ? 'border-red-500 bg-red-500/20'
                        : 'border-gray-600 bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 font-semibold text-sm transition-all duration-200 ${
                        isCorrect
                          ? 'border-green-500 bg-green-500 text-white'
                          : isSelected && !isCorrect
                          ? 'border-red-500 bg-red-500 text-white'
                          : 'border-gray-500 bg-gray-600 text-gray-400'
                      }`}>
                        {index === 0 ? 'T' : 'F'}
                      </div>
                      <span className="font-medium leading-relaxed text-white">{option ? 'True' : 'False'}</span>
                      {isCorrect && (
                        <span className="ml-auto inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                          ✓ Correct
                        </span>
                      )}
                      {isSelected && !isCorrect && (
                        <span className="ml-auto inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                          ✗ Your Answer
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Fill in the blank */}
          {currentQuestion.type === 'fill_blank' && (
            <div className="space-y-3">
              <div className="p-3 rounded border border-gray-600 bg-gray-700/30">
                <div className="text-sm text-gray-400 mb-1">Your Answer:</div>
                <div className="text-white font-medium">
                  {currentAttempt.userAnswers?.[currentQuestion.id] || 'No answer provided'}
                </div>
              </div>
              <div className="p-3 rounded border border-green-500 bg-green-500/20">
                <div className="text-sm text-gray-400 mb-1">Correct Answer:</div>
                <div className="text-green-300 font-medium">{currentQuestion.correctAnswer}</div>
              </div>
            </div>
          )}

          {/* Explanation */}
          {currentQuestion.explanation && (
            <div className="mt-6 p-4 rounded bg-blue-500/10 border border-blue-500/20">
              <div className="text-sm text-blue-400 font-medium mb-2">💡 Explanation:</div>
              <div className="text-blue-300 text-sm">{currentQuestion.explanation}</div>
            </div>
          )}

          {/* Question Navigation */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                currentQuestionIndex === 0
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-700 hover:bg-gray-600 text-white transform hover:scale-105'
              }`}
            >
              ← Previous
            </button>
            
            <span className="text-gray-400">
              {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            
            <button
              onClick={goToNextQuestion}
              disabled={currentQuestionIndex === totalQuestions - 1}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                currentQuestionIndex === totalQuestions - 1
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-700 hover:bg-gray-600 text-white transform hover:scale-105'
              }`}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Back to Progress */}
      <div className="text-center">
        <Link
          href="/progress"
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 inline-block"
        >
          ← Back to Progress
        </Link>
      </div>
    </div>
  );
}
