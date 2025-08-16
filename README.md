# LevelUp - AI-Powered Learning Platform

A modern, intelligent learning platform that transforms documents into personalized learning experiences using AI-generated quizzes and comprehensive progress tracking.

## 🚀 Features

### Core Functionality
- **Document Upload & Processing**: Upload any text document for AI analysis
- **Custom Topic Generation**: Specify exactly which topics you want to focus on
- **AI-Generated Quizzes**: Intelligent quiz creation based on your document content
- **Progress Tracking**: Comprehensive learning progress monitoring
- **Final Exam System**: Comprehensive knowledge assessment
- **Detailed History**: View detailed results for all quiz attempts and final exams

### AI Integration
- **Gemini AI** for intelligent content generation and quiz creation
- **Smart Fallbacks**: Local content generation when API is unavailable
- **Context-Aware**: Questions generated based on your specific document content

### User Experience
- **Modern UI**: Beautiful, responsive design with purple/pink/orange gradient theme
- **Intuitive Navigation**: Easy-to-use interface for seamless learning
- **Real-time Feedback**: Immediate scoring and detailed explanations
- **Progress Visualization**: Visual progress indicators and performance metrics

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: Google Gemini AI API
- **State Management**: React Hooks + localStorage
- **Build Tool**: Next.js with SWC compiler

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   │   ├── generate/      # Quiz generation
│   │   ├── topics/        # Topic generation
│   │   ├── upload/        # File upload handling
│   │   ├── final-exam/    # Final exam generation
│   │   └── test/          # API testing
│   ├── components/        # Reusable components
│   ├── types/            # TypeScript type definitions
│   └── globals.css       # Global styles
├── public/               # Static assets
└── package.json          # Dependencies and scripts
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

## 🔑 API Configuration

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

## 📖 How to Use

### 1. Upload Your Document
- Navigate to the upload page
- Select a text document (.txt, .md, etc.)
- Specify the exact topics you want to focus on

### 2. Generate Learning Topics
- The system will create topics based on your specifications
- Topics are generated using AI analysis of your document
- You can review and modify topics as needed

### 3. Take Quizzes
- Select a topic to start learning
- Answer AI-generated questions
- Get immediate feedback and explanations
- Track your progress over time

### 4. Monitor Progress
- View detailed progress on the progress page
- See quiz attempt history
- Track final exam performance
- Identify areas for improvement

### 5. Take Final Exam
- Comprehensive assessment of all topics
- Detailed results and explanations
- Performance tracking and history

## 🎨 Customization

### Theme Colors
The platform uses a modern gradient theme:
- Primary: Purple (#8B5CF6)
- Secondary: Pink (#EC4899)
- Accent: Orange (#F97316)

### Styling
- Built with Tailwind CSS for easy customization
- Responsive design for all device sizes
- Dark theme optimized for learning

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Quality
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Responsive design principles

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- Netlify
- Railway
- DigitalOcean App Platform
- Any Node.js hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify your API key is correct
3. Ensure all dependencies are installed
4. Check the browser console for client-side errors

## 🔮 Future Enhancements

- [ ] User authentication and profiles
- [ ] Multiple document support
- [ ] Advanced analytics dashboard
- [ ] Collaborative learning features
- [ ] Mobile app development
- [ ] Integration with learning management systems

---

**Built with ❤️ using Next.js, React, and Gemini AI**
