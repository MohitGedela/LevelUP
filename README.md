# LevelUp - AI-Powered Learning Platform

A modern, intelligent learning platform that transforms documents into personalized learning experiences using AI-generated quizzes and comprehensive progress tracking. This program dynamically generates content specific questions according to the user's preferred topics.

## 🚀 Features

### Core Functionality
- **Document Upload & Processing**: Upload any text document for AI analysis
- **Custom Topic Generation**: Specify exactly which topics you want to focus on
- **AI-Generated Quizzes**: Intelligent quiz creation based on your document content
- **Progress Tracking**: Comprehensive learning progress monitoring
- **Final Exam System**: Comprehensive knowledge assessment
- **Detailed History**: View detailed results for all quiz attempts and final exams
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Gemini AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hackathon-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)


### Gemini AI Setup
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Add the key to your `.env.local` file
4. The API will automatically use your key for content generation

### API Endpoints
- `POST /api/upload` - Handle document uploads
- `POST /api/topics` - Generate learning topics
- `POST /api/generate` - Create quiz questions
- `POST /api/final-exam` - Generate final exam
- `GET /api/test` - Test API connectivity

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
