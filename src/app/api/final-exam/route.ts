import { NextRequest, NextResponse } from 'next/server';

interface Topic {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  keyConcepts?: string[];
}

interface Question {
  id: number;
  type: string;
  question: string;
  correctAnswer: number | boolean | string;
  explanation: string;
  options?: string[];
}

// Gemini AI configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const generateGeminiResponse = async (prompt: string) => {
  try {
    console.log('Making request to Gemini API...');
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        }
      })
    });

    console.log('Gemini API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API response data keys:', Object.keys(data));
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Unexpected Gemini API response structure:', data);
      throw new Error('Unexpected response structure from Gemini API');
    }
    
    const text = data.candidates[0].content.parts[0]?.text || '';
    console.log('Extracted text from Gemini response, length:', text.length);
    return text;
  } catch (error) {
    console.error('Error in generateGeminiResponse:', error);
    throw error;
  }
};

export async function POST(request: NextRequest) {
  try {
    const { topics, fileContent, questionCount = 20 } = await request.json();

    console.log('Final exam request received:', {
      topicsCount: topics?.length || 0,
      fileContentLength: fileContent?.length || 0,
      questionCount
    });

    if (!topics || !fileContent) {
      console.error('Missing required data:', { topics: !!topics, fileContent: !!fileContent });
      return NextResponse.json(
        { error: 'Topics and file content are required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(topics) || topics.length === 0) {
      console.error('Invalid topics data:', topics);
      return NextResponse.json(
        { error: 'Topics must be a non-empty array' },
        { status: 400 }
      );
    }

    if (typeof fileContent !== 'string' || fileContent.trim().length === 0) {
      console.error('Invalid file content:', { type: typeof fileContent, length: fileContent?.length });
      return NextResponse.json(
        { error: 'File content must be a non-empty string' },
        { status: 400 }
      );
    }

    const prompt = `You are an expert educator creating a comprehensive final exam based on the following document content. 

CRITICAL REQUIREMENTS:
1. Generate questions ONLY from the provided document content - do not ask about topics not mentioned
2. Questions must be logical and make sense - avoid circular reasoning or nonsensical phrasing
3. Each question should test genuine understanding of the content, not trivial details
4. Fill-in-the-blank questions must ask for specific concepts, processes, or terms that actually exist in the content
5. True/False questions must be based on clear, factual statements from the content
6. Multiple choice questions must have plausible distractors that relate to the actual content

DOCUMENT CONTENT:
${fileContent}

Generate a final exam with exactly 20 questions using this distribution:
- 10 multiple choice questions (4 options each)
- 5 True/False questions 
- 5 fill-in-the-blank questions

For fill-in-the-blank questions:
- Ask for specific, meaningful concepts or terms
- Ensure the blank represents a real concept from the content
- Avoid asking for "processes" when the answer is actually a topic name

For True/False questions:
- Base on clear, factual statements from the content
- Avoid ambiguous or unclear statements

For multiple choice questions:
- Focus on testing understanding, not memorization
- Ensure all options are plausible and related to the content

Return the questions in this exact JSON format:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text here",
      "type": "multiple_choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0
    }
  ]
}`;

    let examData: { questions: Question[] } | null = null;
    
    try {
      const response = await generateGeminiResponse(prompt);
      
      if (!response) {
        throw new Error('No response from Gemini AI');
      }

      console.log('Parsing AI response...');
      
      try {
        // Try to extract JSON object from the response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          examData = JSON.parse(jsonMatch[0]);
          console.log('Successfully extracted and parsed JSON object');
        } else {
          // If no object found, try to find any JSON structure
          const anyJsonMatch = response.match(/\[[\s\S]*\]/);
          if (anyJsonMatch) {
            const parsed = JSON.parse(anyJsonMatch[0]);
            // If it's an array, wrap it in an object
            if (Array.isArray(parsed)) {
              examData = { questions: parsed };
              console.log('Successfully parsed JSON array and wrapped in object');
            } else {
              throw new Error('No valid exam structure found in response');
            }
          } else {
            throw new Error('No JSON structure found in response');
          }
        }
      } catch (extractError) {
        console.error('JSON extraction error:', extractError);
        console.error('Raw AI response:', response);
        
        console.log('Creating fallback questions...');
        examData = { questions: generateFallbackExam(topics, questionCount) };
      }
    } catch (apiError) {
      console.error('Gemini API error:', apiError);
      
      // Generate fallback questions
      console.log('Generating fallback questions due to API error...');
      examData = { questions: generateFallbackExam(topics, questionCount) };
    }

    // Validate the exam structure
    if (!examData || !examData.questions || !Array.isArray(examData.questions)) {
      console.error('Invalid exam structure:', examData);
      throw new Error('Invalid exam structure generated');
    }

    console.log('Exam structure validated, questions count:', examData.questions.length);

    // Filter and validate questions for quality
    const validQuestions = examData.questions
      .filter((q: Question) => {
        // Basic validation
        if (!q.question || !q.explanation) return false;
        
        // Check for problematic patterns in fill-in-the-blank questions
        if (q.type === 'fill_blank') {
          const blankCount = (q.question.match(/_____/g) || []).length;
          if (blankCount > 1) return false; // Multiple blanks
          if (q.question.includes('understanding understanding')) return false; // Nonsensical
        }
        
        // Validate multiple choice questions
        if (q.type === 'multiple_choice') {
          if (!q.options || q.options.length !== 4) return false;
        }
        
        // Validate true/false questions
        if (q.type === 'true_false') {
          if (typeof q.correctAnswer !== 'number' || (q.correctAnswer !== 0 && q.correctAnswer !== 1)) return false;
        }
        
        return true;
      })
      .map((q: Question) => {
        // Fix True/False questions to ensure they have proper structure
        if (q.type === 'true_false') {
          return {
            ...q,
            type: 'true_false',
            correctAnswer: typeof q.correctAnswer === 'boolean' ? (q.correctAnswer ? 0 : 1) : q.correctAnswer
          };
        }
        return q;
      });

    // If not enough valid questions, supplement with fallback
    if (validQuestions.length < questionCount) {
      const additionalQuestions = generateFallbackExam(topics, questionCount - validQuestions.length);
      validQuestions.push(...additionalQuestions);
    }

    // Ensure we have exactly the requested number of questions
    const finalQuestions = validQuestions.slice(0, questionCount);

    // Add metadata to questions
    const uniqueQuestionIds: string[] = [];
    finalQuestions.forEach((q: Question, index: number) => {
      const uniqueId = `exam_${Date.now()}_${index + 1}`;
      uniqueQuestionIds.push(uniqueId);
      
      // Add required properties
      q.id = index + 1;
      if (q.type === 'multiple_choice' && !q.options) {
        q.options = ['Option A', 'Option B', 'Option C', 'Option D'];
      }
    });

    console.log('Final exam generated successfully, returning response');
    return NextResponse.json({
      success: true,
      exam: {
        questions: finalQuestions,
        uniqueQuestionIds
      },
      message: 'Final exam generated successfully'
    });

  } catch (error) {
    console.error('Final exam generation error:', error);
    
    // Generate fallback exam as last resort
    try {
      const { topics, questionCount = 20 } = await request.json();
      const fallbackQuestions = generateFallbackExam(topics, questionCount);
      
      return NextResponse.json({
        success: true,
        exam: {
          questions: fallbackQuestions,
          uniqueQuestionIds: fallbackQuestions.map((_, index) => `fallback_${Date.now()}_${index + 1}`)
        },
        message: 'Final exam generated using fallback method'
      });
    } catch (fallbackError) {
      console.error('Fallback exam generation also failed:', fallbackError);
      
      return NextResponse.json(
        { error: 'Failed to generate final exam' },
        { status: 500 }
      );
    }
  }
}

// Function to generate fallback exam when AI fails
function generateFallbackExam(topics: Topic[], count: number): Question[] {
  const questions: Question[] = [];
  let questionId = 1;
  
  topics.forEach((topic: Topic) => {
    const questionsPerTopic = Math.ceil(count / topics.length);
    
    for (let i = 0; i < questionsPerTopic && questionId <= count; i++) {
      const questionType = questionId % 3;
      
      if (questionType === 0) {
        // True/False question with unique content
        const statements = [
          `${topic.title} involves specific processes as described in the document.`,
          `The mechanisms of ${topic.title} require energy input to function properly.`,
          `${topic.title} operates through a series of coordinated steps.`,
          `Understanding ${topic.title} is essential for grasping the overall concept.`
        ];
        
        questions.push({
          id: questionId,
          type: 'true_false',
          question: `True or False: ${statements[i % statements.length]}`,
          correctAnswer: 0, // True
          explanation: `This statement is true based on the document content about ${topic.title}.`
        });
      } else if (questionType === 1) {
        // Fill-in-the-blank question with unique content
        const blanks = [
          'process', 'mechanism', 'function', 'structure', 'component'
        ];
        
        questions.push({
          id: questionId,
          type: 'fill_blank',
          question: `Complete: The ${blanks[i % blanks.length]} of _____ is essential for understanding ${topic.title}.`,
          correctAnswer: topic.title.toLowerCase(),
          explanation: `The ${blanks[i % blanks.length]} of ${topic.title} is fundamental to the topic as described.`
        });
      } else {
        // Multiple choice question with unique content
        const aspects = [
          'primary function', 'key characteristic', 'essential component', 'operating mechanism'
        ];
        const aspect = aspects[i % aspects.length];
        
        questions.push({
          id: questionId,
          type: 'multiple_choice',
          question: `What is the ${aspect} of ${topic.title} according to the document?`,
          options: [
            `To perform ${topic.title.toLowerCase()} processes`,
            `To regulate other systems`,
            `To provide structural support`,
            `To transport materials`
          ],
          correctAnswer: 0,
          explanation: `This question focuses on the ${aspect} of ${topic.title} as described in the document.`
        });
      }
      questionId++;
    }
  });
  
  return questions.slice(0, count);
}
