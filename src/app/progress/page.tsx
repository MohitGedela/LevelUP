'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Topic, TopicProgress } from '@/types';

export default function ProgressPage() {
  const [topicProgress, setTopicProgress] = useState<TopicProgress[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch generated topics and quiz results
    const storedTopics = localStorage.getItem('generatedTopics');
    const quizResults = localStorage.getItem('quizResults');
    
    if (storedTopics) {
      const allTopics = JSON.parse(storedTopics);
      
      if (quizResults) {
        const results = JSON.parse(quizResults);
        const progress: TopicProgress[] = [];
        
        allTopics.forEach((topic: Topic) => {
          const topicResults = results.filter((r: { topicId: string; score: number; date: string; quizId: string }) => r.topicId === topic.id);
          
          if (topicResults.length > 0) {
            // Calculate average score
            const totalScore = topicResults.reduce((sum: number, r: { score: number }) => sum + r.score, 0);
            const averageScore = Math.round(totalScore / topicResults.length);
            
            // Get last attempt score
            const lastAttempt = topicResults[topicResults.length - 1];
            const lastAttemptScore = lastAttempt.score;
            
            // Get last studied time
            const lastStudied = new Date(lastAttempt.date);
            
            progress.push({
              id: topic.id,
              name: topic.title,
              category: topic.difficulty,
              masteryLevel: averageScore,
              lastStudied: lastStudied.toISOString(),
              quizCount: topicResults.length,
              averageScore: averageScore,
              completedQuizzes: topicResults.map((r: { quizId: string }) => r.quizId),
              totalQuizzes: topicResults.length,
              lastAttemptScore: lastAttemptScore
            });
          } else {
            progress.push({
              id: topic.id,
              name: topic.title,
              category: topic.difficulty,
              masteryLevel: 0,
              lastStudied: new Date().toISOString(),
              quizCount: 0,
              averageScore: 0,
              completedQuizzes: [],
              totalQuizzes: 0,
              lastAttemptScore: 0
            });
          }
        });
        
        setTopicProgress(progress);
        
        // Calculate overall progress
        const totalMastery = progress.reduce((sum, tp) => sum + tp.masteryLevel, 0);
        setOverallProgress(Math.round(totalMastery / progress.length));
      }
    }
    
    setIsLoading(false);
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} month${months !== 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffInSeconds / 31536000);
      const remainingMonths = Math.floor((diffInSeconds % 31536000) / 2592000);
      if (remainingMonths > 0) {
        return `${years} year${years !== 1 ? 's' : ''} and ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''} ago`;
      } else {
        return `${years} year${years !== 1 ? 's' : ''} ago`;
      }
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-400';
    if (progress >= 60) return 'text-yellow-400';
    if (progress >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getProgressBarColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    if (progress >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'Intermediate': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      case 'Advanced': return 'bg-red-600/20 text-red-400 border-red-600/30';
      default: return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="relative">
          <div className="animate-spin w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-6"></div>
          <div className="absolute inset-0 animate-ping w-16 h-16 border-2 border-cyan-400 rounded-full mx-auto opacity-20"></div>
        </div>
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">Loading Your Progress</h2>
        <p className="text-gray-300 text-lg">Analyzing your learning journey...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500 mb-4">
          Your Learning Progress
        </h1>
        <p className="text-gray-300 text-lg">
          Track your mastery across all topics and see how far you&apos;ve come
        </p>
      </div>

      {/* Overall Progress Card */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-8 border border-gray-600 mb-8 transform hover:scale-[1.02] transition-all duration-300">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <span className="text-3xl font-bold text-white">{overallProgress}%</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Overall Mastery</h2>
          <p className="text-gray-300 mb-4">Average score across all topics</p>
          
          <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
          
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-cyan-400">{topicProgress.length}</div>
              <div className="text-gray-400 text-sm">Topics</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">
                {topicProgress.filter(tp => tp.masteryLevel >= 80).length}
              </div>
              <div className="text-gray-400 text-sm">Mastered</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {topicProgress.reduce((sum, tp) => sum + tp.quizCount, 0)}
              </div>
              <div className="text-gray-400 text-sm">Quizzes Taken</div>
            </div>
          </div>
        </div>
      </div>

      {/* Final Exam Results and History */}
      {(() => {
        const finalExamData = localStorage.getItem('finalExamResults');
        if (!finalExamData) return null;
        
        const results = JSON.parse(finalExamData);
        if (results.length === 0) return null;
        
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
        
        const latestResult = results[0];
        
        return (
          <div className="bg-gradient-to-r from-purple-800 to-purple-700 rounded-lg p-8 border border-purple-600 mb-8 transform hover:scale-[1.02] transition-all duration-300">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <span className="text-2xl font-bold text-white">🏆</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Final Exam Results</h2>
              <p className="text-gray-300 mb-4">Your comprehensive assessment score</p>
              
              <div className="w-full bg-purple-600 rounded-full h-3 mb-4">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${latestResult.score}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-3 gap-6 text-center mb-6">
                <div>
                  <div className="text-2xl font-bold text-purple-400">{latestResult.score}%</div>
                  <div className="text-gray-300 text-sm">Score</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">{latestResult.correctAnswers}</div>
                  <div className="text-gray-300 text-sm">Correct</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">{latestResult.totalQuestions}</div>
                  <div className="text-gray-300 text-sm">Total</div>
                </div>
              </div>
              
              <div className="mb-6">
                <Link
                  href="/final-exam"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  Retake Final Exam
                </Link>
              </div>
            </div>

            {/* Final Exam History Section */}
            <div className="border-t border-purple-600 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4 text-center">Exam History</h3>
              
              <div className="space-y-4">
                {/* Latest Final Exam Attempt */}
                <div className="bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 rounded-lg p-4 border-2 border-cyan-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-sm font-medium px-3 py-1 rounded-full">
                        Latest Attempt
                      </span>
                      <span className="text-gray-300 text-sm">
                        {new Date(results[0].date).toLocaleDateString()} at {new Date(results[0].date).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-bold ${
                        results[0].score >= 80 ? 'text-green-400' :
                        results[0].score >= 60 ? 'text-yellow-400' :
                        results[0].score >= 40 ? 'text-orange-400' : 'text-red-400'
                      }`}>
                        {results[0].score}%
                      </div>
                      <div className="text-xs text-gray-300">
                        {results[0].correctAnswers} correct out of {results[0].totalQuestions} questions
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* View All Final Exam Attempts Button */}
                <button
                  onClick={() => {
                    // Navigate directly to detailed final exam attempt view
                    window.location.href = `/final-exam-attempt/0`;
                  }}
                  className="w-full text-center py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                >
                  View All {results.length} Final Exam Attempts →
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Topic Progress Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topicProgress.map((topic, index) => (
          <div 
            key={topic.id}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-cyan-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 h-full flex flex-col"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Header Section - Fixed Height */}
            <div className="flex items-start justify-between mb-4 min-h-[4rem]">
              <div className="flex-1 pr-2">
                <h3 className="text-lg font-semibold text-white mb-2 leading-tight">{topic.name}</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(topic.category)}`}>
                  {topic.category}
                </span>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                topic.masteryLevel >= 80
                  ? 'bg-green-500 border-green-500'
                  : topic.masteryLevel >= 60
                  ? 'bg-yellow-500 border-yellow-500'
                  : topic.masteryLevel >= 40
                  ? 'bg-orange-500 border-orange-500'
                  : 'border-gray-500'
              }`}></div>
            </div>
            
            {/* Progress Section - Fixed Height */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-400">Mastery Level</span>
                <span className={`font-semibold ${getProgressColor(topic.masteryLevel)}`}>
                  {topic.masteryLevel}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-1000 ease-out ${getProgressBarColor(topic.masteryLevel)}`}
                  style={{ width: `${topic.masteryLevel}%` }}
                ></div>
              </div>
            </div>
            
            {/* Stats Section - Fixed Height */}
            <div className="space-y-2 text-sm text-gray-400 mb-4 flex-1">
              <div className="flex justify-between">
                <span>Quizzes Taken:</span>
                <span className="text-white">{topic.quizCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Average Score:</span>
                <span className="text-white">{topic.averageScore}%</span>
              </div>
              <div className="flex justify-between">
                <span>Last Attempt:</span>
                <span className="text-white">{topic.lastAttemptScore}%</span>
              </div>
            </div>
            
            {/* Last Studied - Fixed Height */}
            <div className="text-xs text-gray-500 mb-4">
              Last studied: {formatTimeAgo(topic.lastStudied)}
            </div>

            {/* Quiz History - Show Only Latest Attempt */}
            {(() => {
              const quizResults = localStorage.getItem('quizResults');
              if (!quizResults) return null;
              const results = JSON.parse(quizResults);
              const topicResults = results.filter((r: { topicId: string }) => r.topicId === topic.id);
              if (topicResults.length === 0) return null;
              topicResults.sort((a: { date: string }, b: { date:string }) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
              );
              return (
                <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <h4 className="text-sm font-medium text-gray-300 mb-4 text-center">Quiz History</h4>
                  
                  {/* Latest Attempt - Highlighted */}
                  <div className="mb-4">
                    <div
                      className={`w-full p-4 rounded-lg border-2 ${
                        'border-cyan-500 bg-gradient-to-r from-cyan-500/10 to-cyan-400/5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-medium px-2 py-1 rounded-full">
                            Latest Attempt
                          </span>
                          <span className="text-gray-300 text-sm">
                            {new Date(topicResults[0].date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${
                            (topicResults[0].score || 0) >= 80 ? 'text-green-400' :
                            (topicResults[0].score || 0) >= 60 ? 'text-yellow-400' :
                            (topicResults[0].score || 0) >= 40 ? 'text-orange-400' : 'text-red-400'
                          }`}>
                            {topicResults[0].score || 0}%
                          </div>
                          <div className="text-xs text-gray-400">
                            {topicResults[0].correct || 0}/{topicResults[0].total || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* View All Attempts Button */}
                  <div className="mb-4">
                    <button
                      onClick={() => {
                        window.location.href = `/quiz-attempt/${topic.id}/0`;
                      }}
                      className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 border border-gray-600 hover:border-gray-500"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <span>View All {topicResults.length} Attempts</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>
              );
            })()}
            
            {/* Take Quiz Button - Outside Quiz History */}
            <div className="mt-4 text-center">
              <Link
                href={`/quiz/${topic.id}`}
                className="inline-block w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-base transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              >
                Take Quiz
              </Link>
            </div>
            
            {/* Action Buttons - Always at bottom */}
            <div className="flex space-x-2 mt-auto">
              {topic.masteryLevel >= 80 && (
                <div className="flex-1 bg-green-600/20 text-green-400 text-center py-2 px-4 rounded-lg text-sm font-medium border border-green-600/30">
                  🎯 Mastered
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center mt-12">
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
          <h3 className="text-2xl font-bold text-white mb-4">Ready for the Ultimate Challenge?</h3>
          <p className="text-gray-300 mb-6">
            Test your knowledge across all topics with our comprehensive final exam
          </p>
          <Link
            href="/final-exam"
            className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 active:scale-95 inline-block"
          >
            Take Final Exam
          </Link>
        </div>
      </div>
    </div>
  );
}

