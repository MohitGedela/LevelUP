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
  question: string;
  options: string[];
  correctAnswer: number;
  type: string;
  explanation: string;
}

// Gemini AI configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const generateGeminiResponse = async (prompt: string) => {
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

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates[0]?.content?.parts[0]?.text || '';
};

export async function POST(request: NextRequest) {
  try {
    const { topic, fileContent, questionCount = 5 } = await request.json();

    if (!topic || !fileContent) {
      return NextResponse.json(
        { error: 'Topic and file content are required' },
        { status: 400 }
      );
    }

    const prompt = `You are an expert educator creating a quiz for a specific learning topic. 

CRITICAL REQUIREMENTS:
1. Generate questions ONLY from the provided topic content - do not ask about topics not mentioned
2. Questions must be logical and make sense - avoid circular reasoning or nonsensical phrasing
3. Each question should test genuine understanding of the specific topic, not generic knowledge
4. Fill-in-the-blank questions must ask for specific concepts, processes, or terms that actually exist in the topic content
5. True/False questions must be based on clear, factual statements from the topic content
6. Multiple choice questions must have plausible distractors that relate to the actual topic content

TOPIC: ${topic.title}
TOPIC DESCRIPTION: ${topic.description}
TOPIC CONTENT: ${fileContent}

Generate exactly 5 questions using this distribution:
- 3 multiple choice questions (4 options each)
- 1 True/False question 
- 1 fill-in-the-blank question

For fill-in-the-blank questions:
- Ask for specific, meaningful concepts or terms from the topic
- Ensure the blank represents a real concept from the topic content
- Avoid asking for "processes" when the answer is actually a topic name

For True/False questions:
- Base on clear, factual statements from the topic content
- Avoid ambiguous or unclear statements

For multiple choice questions:
- Focus on testing understanding of the specific topic
- Ensure all options are plausible and related to the topic content

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

    let questions: Question[] = [];
    
    try {
      const response = await generateGeminiResponse(prompt);
      
      if (!response) {
        throw new Error('No response from Gemini AI');
      }

      // Parse the JSON response
      let parsedQuestions;
      try {
        // Extract JSON from the response (remove any markdown formatting)
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          parsedQuestions = JSON.parse(jsonMatch[0]);
        } else {
          parsedQuestions = JSON.parse(response);
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        throw new Error('Failed to parse AI response');
      }

      if (Array.isArray(parsedQuestions)) {
        questions = parsedQuestions;
      } else {
        throw new Error('AI response is not an array');
      }
    } catch (apiError) {
      console.error('Gemini API error:', apiError);
      
      // Generate fallback questions
      console.log('Generating fallback questions...');
      questions = generateFallbackQuestions(topic, questionCount);
    }

    // Validate and fix questions
    const validatedQuestions = questions
      .filter((q: Question) => {
        // Basic validation
        if (!q.question || !q.options || q.options.length === 0) return false;
        return true;
      })
      .map((q: Question) => {
        // Fix True/False questions to ensure they have proper string options
        if (q.type === 'true_false' || q.type === 'boolean') {
          return {
            ...q,
            type: 'true_false',
            options: ["True", "False"],
            correctAnswer: typeof q.correctAnswer === 'boolean' ? (q.correctAnswer ? 0 : 1) : q.correctAnswer
          };
        }
        return q;
      });

    // If not enough valid questions, supplement with fallback
    if (validatedQuestions.length < questionCount) {
      const additionalQuestions = generateFallbackQuestions(topic, questionCount - validatedQuestions.length);
      validatedQuestions.push(...additionalQuestions);
    }

    // Ensure we have exactly the requested number of questions
    const finalQuestions = validatedQuestions.slice(0, questionCount);

    return NextResponse.json({
      success: true,
      questions: finalQuestions,
      topic,
      message: 'Quiz generated successfully'
    });

  } catch (error) {
    console.error('Quiz generation error:', error);
    
    // Generate fallback questions as last resort
    try {
      const { topic, questionCount = 5 } = await request.json();
      const fallbackQuestions = generateFallbackQuestions(topic, questionCount);
      
      return NextResponse.json({
        success: true,
        questions: fallbackQuestions,
        topic,
        message: 'Quiz generated using fallback method'
      });
    } catch (fallbackError) {
      console.error('Fallback quiz generation also failed:', fallbackError);
      
      return NextResponse.json(
        { error: 'Failed to generate quiz' },
        { status: 500 }
      );
    }
  }
}

// Function to generate fallback questions when AI fails
function generateFallbackQuestions(topic: Topic, count: number): Question[] {
  const questions: Question[] = [];
  const concepts = topic.keyConcepts || [topic.title];
  
  for (let i = 0; i < count; i++) {
    const concept = concepts[i % concepts.length];
    
    if (i % 3 === 0) {
      // True/False question
      questions.push({
        id: i + 1,
        question: `True or False: ${concept} is an important concept in this field.`,
        options: ["True", "False"],
        correctAnswer: 0,
        type: "true_false",
        explanation: `${concept} is indeed an important concept in this field.`
      });
    } else {
      // Multiple choice question
      questions.push({
        id: i + 1,
        question: `What is the primary function of ${concept}?`,
        options: [
          `To perform ${concept.toLowerCase()} processes`,
          `To regulate other systems`,
          `To provide structural support`,
          `To transport materials`
        ],
        correctAnswer: 0,
        type: "multiple-choice",
        explanation: `The primary function of ${concept} is to perform ${concept.toLowerCase()} processes.`
      });
    }
  }
  
  return questions;
}
