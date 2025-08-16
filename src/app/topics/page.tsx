'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Topic } from '@/types';

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicProgress, setTopicProgress] = useState<{[key: string]: number}>({});
  const [topicAttempts, setTopicAttempts] = useState<{[key: string]: number}>({});
  const router = useRouter();

  useEffect(() => {
    // Fetch generated topics from API or localStorage
    const storedTopics = localStorage.getItem('generatedTopics');
    if (storedTopics) {
      const parsedTopics = JSON.parse(storedTopics);
      setTopics(parsedTopics);
      
      // Store all topic IDs as selected topics for final exam
      const topicIds = parsedTopics.map((topic: Topic) => topic.id);
      localStorage.setItem('selectedTopics', JSON.stringify(topicIds));
    }
    
    // Get progress data and attempt counts
    const quizResults = localStorage.getItem('quizResults');
    if (quizResults) {
      const results = JSON.parse(quizResults);
      const progress: {[key: string]: number} = {};
      const attempts: {[key: string]: number} = {};
      
      results.forEach((result: { topicId: string; score: number }) => {
        if (result.topicId) {
          // Count attempts
          attempts[result.topicId] = (attempts[result.topicId] || 0) + 1;
        }
      });
      
      // Calculate average scores for each topic
      Object.keys(attempts).forEach(topicId => {
        const topicResults = results.filter((r: { topicId: string; score: number }) => r.topicId === topicId);
        if (topicResults.length > 0) {
          const totalScore = topicResults.reduce((sum: number, r: { score: number }) => sum + r.score, 0);
          progress[topicId] = Math.round(totalScore / topicResults.length);
        }
      });
      
      setTopicProgress(progress);
      setTopicAttempts(attempts);
    }
  }, []);

  const startQuiz = (topicId: string) => {
    // Generate a unique quiz ID with timestamp
    const quizId = `quiz_${topicId}_${Date.now()}`;
    
    // Store the quiz info and redirect to quiz
    localStorage.setItem('currentQuizInfo', JSON.stringify({
      topicId,
      quizId,
      isNewQuiz: true
    }));
    
    router.push(`/quiz/${topicId}`);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-400';
    if (progress >= 60) return 'text-yellow-400';
    if (progress >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  if (topics.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-300 mb-4">No Topics Available</h2>
        <p className="text-gray-400 mb-6">Please upload a document first to generate learning topics.</p>
        <Link 
          href="/upload"
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95"
        >
          Upload Document
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">
          Choose Your Learning Topics
        </h1>
        <p className="text-gray-300 text-lg">
          Click on any topic to start a new quiz. You can take unlimited quizzes for each topic.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {topics.map((topic: Topic) => {
          const progress = topicProgress[topic.id] || 0;
          const attempts = topicAttempts[topic.id] || 0;
          
          return (
            <div 
              key={topic.id}
              className={`bg-gray-800 rounded-lg p-6 border-2 cursor-pointer transition-all duration-200 hover:border-cyan-500 hover:bg-cyan-600/20 h-full flex flex-col`}
              onClick={() => startQuiz(topic.id)}
            >
              {/* Header Section - Fixed Height */}
              <div className="flex items-start justify-between mb-4 min-h-[3rem]">
                <div className="flex-1 pr-2">
                  <h3 className="text-lg font-semibold text-white leading-tight">{topic.title}</h3>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Description Section - Fixed Height */}
              <div className="mb-4 flex-1">
                <p className="text-gray-300 text-sm leading-relaxed min-h-[3rem]">
                  {topic.description}
                </p>
              </div>

              {/* Difficulty and Time Section - Fixed Height */}
              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Difficulty:</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    topic.difficulty === 'Beginner' ? 'bg-green-600/20 text-green-400' :
                    topic.difficulty === 'Intermediate' ? 'bg-yellow-600/20 text-yellow-400' :
                    'bg-red-600/20 text-red-400'
                  }`}>
                    {topic.difficulty}
                  </span>
                </div>
              </div>

              {/* Progress Section - Fixed Height */}
              <div className="mt-auto">
                {progress > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${getProgressColor(progress)}`}>
                        {progress}% Complete
                      </span>
                      <span className="text-xs text-gray-400">
                        {attempts} attempt{attempts !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          progress >= 80 ? 'bg-green-500' :
                          progress >= 60 ? 'bg-yellow-500' :
                          progress >= 40 ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {/* Take Quiz Button - Always visible */}
                <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95">
                  Take Quiz
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Final Exam Section */}
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
            Ready for the Ultimate Challenge?
          </h2>
          <p className="text-gray-300 mb-6">
            Test your knowledge across all topics with a comprehensive final exam
          </p>
          <Link 
            href="/final-exam"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            Start Final Exam
          </Link>
        </div>
      </div>
    </div>
  );
}
