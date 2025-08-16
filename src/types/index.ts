export interface Topic {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  keyConcepts?: string[];
}

export interface Question {
  id: number;
  question: string;
  options?: string[];
  correctAnswer: number;
  type: 'multiple_choice' | 'true_false' | 'fill_blank';
}

export interface QuizResult {
  topicId: string;
  quizId: string;
  score: number;
  correct: number;
  total: number;
  date: string;
  questions?: Question[];
  userAnswers?: Record<number, number>;
  isFinalExam?: boolean;
}

export interface TopicProgress {
  id: string;
  name: string;
  category: string;
  masteryLevel: number;
  lastStudied: string;
  quizCount: number;
  averageScore: number;
  completedQuizzes: string[];
  totalQuizzes: number;
  lastAttemptScore: number;
}

export interface FinalExamResult {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  date: string;
  questions: Question[];
  userAnswers: Record<number, number>;
}
