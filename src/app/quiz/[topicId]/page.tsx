'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Topic } from '@/types';

interface QuizQuestion {
  id: number;
  question: string;
  options?: string[];
  correctAnswer: number;
  type?: string;
  explanation?: string;
}

export default function TopicQuizPage() {
  const params = useParams();
  const topicId = params.topicId as string;
  
  const [topic, setTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuizId, setCurrentQuizId] = useState<string>('');
  const [topicAttempts, setTopicAttempts] = useState<number>(0);

  const generateQuestions = useCallback(async (currentTopic: Topic, fileContent: string) => {
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: currentTopic,
          fileContent: fileContent,
          questionCount: 5
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setQuestions(data.questions);
        // Initialize selectedAnswers with -1 for each question
        setSelectedAnswers(new Array(data.questions.length).fill(-1));
        // Automatically start the quiz after questions are generated
      } else {
        throw new Error(data.error || 'Failed to generate questions');
      }
    } catch (error) {
      console.error('Failed to generate questions:', error);
      setError('Failed to generate quiz questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Get topic and file content from localStorage
    const generatedTopicsData = localStorage.getItem('generatedTopics');
    const fileContent = localStorage.getItem('fileContent');
    const quizResults = localStorage.getItem('quizResults');
    const currentQuizInfo = localStorage.getItem('currentQuizInfo');
    
    if (generatedTopicsData && fileContent) {
      const allTopics = JSON.parse(generatedTopicsData);
      const currentTopic = allTopics.find((t: Topic) => t.id === topicId);
      
      if (currentTopic) {
        setTopic(currentTopic);
        
        // Get attempt count for this topic
        if (quizResults) {
          const results = JSON.parse(quizResults);
          const topicResults = results.filter((r: { topicId: string }) => r.topicId === topicId);
          setTopicAttempts(topicResults.length);
        }
        
        // Check if this is a new quiz from topics page
        if (currentQuizInfo) {
          const quizInfo = JSON.parse(currentQuizInfo);
          if (quizInfo.topicId === topicId && quizInfo.isNewQuiz) {
            setCurrentQuizId(quizInfo.quizId);
            generateQuestions(currentTopic, fileContent);
          } else {
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
        }
      } else {
        setError('Topic not found');
        setIsLoading(false);
      }
    } else {
      setError('No topics or file content found. Please upload a document and generate topics first.');
      setIsLoading(false);
    }
  }, [topicId, generateQuestions]);

  const handleAnswerSelect = (answerIndex: number) => {
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newSelectedAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    const total = questions.length;
    
    questions.forEach((question, index) => {
      // Check if the question was answered (not -1) and if it's correct
      if (selectedAnswers[index] !== -1 && selectedAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    
    return {
      correct,
      total,
      percentage: Math.round((correct / total) * 100)
    };
  };

  const submitQuiz = () => {
    const score = calculateScore();
    
    // Convert selectedAnswers array to object with question IDs as keys
    const userAnswersObject: Record<number, number> = {};
    selectedAnswers.forEach((answer, index) => {
      if (answer !== -1) {
        userAnswersObject[questions[index].id] = answer;
      }
    });
    
    // Save quiz results
    const quizResult = {
      topicId: topicId,
      quizId: currentQuizId || `quiz_${Date.now()}`,
      score: score.percentage,
      correct: score.correct,
      total: score.total,
      questions: questions,
      userAnswers: userAnswersObject,
      date: new Date().toISOString()
    };
    
    const existingResults = localStorage.getItem('quizResults');
    const results = existingResults ? JSON.parse(existingResults) : [];
    results.push(quizResult);
    localStorage.setItem('quizResults', JSON.stringify(results));
    
    // Clear current quiz info
    localStorage.removeItem('currentQuizInfo');
    
    setShowResults(true);
  };

  const startNewQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers(new Array(questions.length).fill(-1));
    setShowResults(false);
    
    // Generate new quiz ID
    const newQuizId = `quiz_${Date.now()}`;
    setCurrentQuizId(newQuizId);
    
    // Save new quiz info
    localStorage.setItem('currentQuizInfo', JSON.stringify({
      topicId: topicId,
      quizId: newQuizId,
      isNewQuiz: true
    }));
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">
            Generating Quiz...
          </h1>
          <p className="text-gray-300 text-lg mb-6">
            Creating personalized questions for {topic?.title || 'this topic'}...
          </p>
        </div>
        <div className="w-16 h-16 bg-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500 mb-4">
            Error
          </h1>
          <p className="text-gray-300 text-lg mb-6">{error}</p>
        </div>
        <div className="space-y-4">
          <button
            onClick={() => {
              setError(null);
              setIsLoading(true);
              if (topic && localStorage.getItem('fileContent')) {
                generateQuestions(topic, localStorage.getItem('fileContent')!);
              }
            }}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-block mr-4"
          >
            Retry
          </button>
          <Link
            href="/upload"
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-block mr-4"
          >
            Upload Document
          </Link>
          <Link
            href="/topics"
            className="border border-gray-600 hover:border-cyan-500 text-gray-300 hover:text-white font-medium py-2 px-4 rounded-lg transition-colors inline-block"
          >
            Back to Topics
          </Link>
        </div>
      </div>
    );
  }

  if (!topic || questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500 mb-4">
            No Questions Available
          </h1>
          <p className="text-gray-300 text-lg mb-6">
            No questions were generated for this topic.
          </p>
        </div>
        <Link
          href="/topics"
          className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Back to Topics
        </Link>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">
            Quiz Results
          </h1>
          <p className="text-gray-300 text-lg mb-2">{topic.title}</p>
          <p className="text-sm text-cyan-400">Attempt #{topicAttempts + 1}</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 mb-8">
          <div className="text-6xl font-bold text-cyan-400 mb-4">{score.percentage}%</div>
          <p className="text-xl text-gray-300 mb-6">
            You got {score.correct} out of {score.total} questions correct!
          </p>
          
          <div className="w-full bg-gray-700 rounded-full h-4 mb-6">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${score.percentage}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">{score.correct}</div>
              <div className="text-gray-400">Correct</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-400">{score.total - score.correct}</div>
              <div className="text-gray-400">Incorrect</div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={startNewQuiz}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 mr-4"
            >
              Take Another Quiz
            </button>
            <Link
              href="/topics"
              className="border border-gray-600 hover:border-cyan-500 text-gray-300 hover:text-white font-semibold py-3 px-8 rounded-lg transition-colors inline-block"
            >
              Back to Topics
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold text-white mb-2">{topic.title}</h1>
        <p className="text-gray-400">Question {currentQuestion + 1} of {questions.length}</p>
        <p className="text-sm text-cyan-400">Attempt #{topicAttempts + 1}</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className="text-sm text-gray-400">
            {Math.round(((currentQuestion + 1) / questions.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 mb-8">
        <h2 className="text-2xl font-semibold mb-6">
          {question.question}
        </h2>

        <div className="space-y-3">
          {question.options?.map((option: string, index: number) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 transform hover:scale-[1.02] ${
                selectedAnswers[currentQuestion] === index
                  ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/20'
                  : 'border-gray-600 hover:border-cyan-400 hover:bg-cyan-500/10 text-gray-300 hover:text-white'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 font-semibold text-sm transition-all duration-200 ${
                  selectedAnswers[currentQuestion] === index
                    ? 'border-cyan-500 bg-cyan-500 text-white'
                    : 'border-gray-500 text-gray-400'
                }`}>
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="font-medium leading-relaxed">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={previousQuestion}
          disabled={currentQuestion === 0}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            currentQuestion === 0
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
        >
          Previous
        </button>

        <div className="flex space-x-4">
          {currentQuestion === questions.length - 1 ? (
            <button
              onClick={submitQuiz}
              disabled={selectedAnswers.includes(-1)}
              className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                selectedAnswers.includes(-1)
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white transform hover:scale-105'
              }`}
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              disabled={selectedAnswers[currentQuestion] === -1}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                selectedAnswers[currentQuestion] === -1
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white'
              }`}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
