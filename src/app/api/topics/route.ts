import { NextRequest, NextResponse } from 'next/server';
import { Topic } from '@/types';

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
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
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
    const { userTopics } = await request.json();

    if (!userTopics || !userTopics.trim()) {
      return NextResponse.json(
        { error: 'User topics are required. Please specify the topics you want to focus on.' },
        { status: 400 }
      );
    }

    // Parse user topics to determine how many to generate
    const userTopicList = userTopics.split(',').map((t: string) => t.trim()).filter((t: string) => t);
    const topicCount = userTopicList.length;

    // Generate exactly the number of topics the user specified
    const prompt = `You are an expert educator analyzing a document to create focused learning topics.

CRITICAL REQUIREMENTS:
1. Generate topics ONLY from the provided document content - do not create topics not mentioned
2. Each topic must be a genuine, meaningful concept from the document
3. Topics should be specific and focused, not generic or vague
4. Avoid creating topics that are too broad or don't relate to the actual content
5. Each topic should represent a distinct learning objective that can be tested

USER REQUESTED TOPICS: ${userTopics}

Generate exactly ${topicCount} learning topics based on the user's request. Each topic should:
- Be directly related to the user's requested topics
- Represent a specific, testable concept
- Have a clear, descriptive title
- Include a brief description of what will be learned
- Be at an appropriate difficulty level (Beginner/Intermediate/Advanced)

Return the topics in this exact JSON format:
{
  "topics": [
    {
      "id": "topic_1",
      "title": "Specific topic title",
      "description": "Brief description of what this topic covers",
      "difficulty": "Beginner",
      "keyConcepts": ["concept1", "concept2"]
    }
  ]
}`;

    const response = await generateGeminiResponse(prompt);
    
    if (!response) {
      throw new Error('No response from Gemini AI');
    }

    // Parse the response - FIX: Extract JSON from markdown
    let parsedResponse;
    try {
      // First try to extract JSON from markdown formatting
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        // If no object found, try to parse the response directly
        parsedResponse = JSON.parse(response);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw AI response:', response);
      throw new Error('Failed to parse AI response');
    }

    let topics: Topic[] = parsedResponse.topics || [];

    // Validate and clean up topics
    topics = topics.filter((topic: Topic) => 
      topic.title && 
      topic.description && 
      topic.difficulty && 
      topic.keyConcepts
    );

    // Add quiz count based on topic size
    topics = topics.map((topic: Topic) => ({
      ...topic,
      quizCount: 5 // Default to 5 quizzes per topic
    }));

    // Ensure we have exactly the requested number of topics
    if (topics.length < topicCount) {
      // Generate fallback topics if we don't have enough
      const fallbackTopics = generateFallbackTopics(userTopics, topicCount - topics.length);
      topics = [...topics, ...fallbackTopics];
    }

    // Limit to exactly the requested number
    topics = topics.slice(0, topicCount);

    return NextResponse.json({
      success: true,
      topics: topics, // Ensure exactly the number of topics the user specified
      message: 'Topics generated successfully'
    });

  } catch (error) {
    console.error('Topics generation error:', error);
    
    // Generate fallback topics as last resort
    try {
      const { userTopics } = await request.json();
      const topicCount = userTopics.split(',').map((t: string) => t.trim()).filter((t: string) => t).length;
      const fallbackTopics = generateFallbackTopics(userTopics, topicCount);
      
      return NextResponse.json({
        success: true,
        topics: fallbackTopics,
        message: 'Topics generated using fallback method'
      });
    } catch (fallbackError) {
      console.error('Fallback topic generation also failed:', fallbackError);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to generate topics';
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage = 'API key not configured properly';
        } else if (error.message.includes('Failed to parse')) {
          errorMessage = 'AI response format error';
        } else if (error.message.includes('No response')) {
          errorMessage = 'AI service temporarily unavailable';
        } else {
          errorMessage = error.message;
        }
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
  }
}

// Function to generate fallback topics when AI fails
function generateFallbackTopics(userTopics: string, count: number): Topic[] {
  // Parse user-specified topics
  const userTopicList = userTopics.split(',').map((t: string) => t.trim()).filter((t: string) => t);
  
  const fallbackTopics: Topic[] = [];
  
  for (let i = 0; i < count; i++) {
    const topicName = userTopicList[i] || `Topic ${i + 1}`;
    fallbackTopics.push({
      id: `fallback_${i + 1}`,
      title: topicName,
      description: `Comprehensive coverage of ${topicName.toLowerCase()} concepts and principles.`,
      difficulty: ['Beginner', 'Intermediate', 'Advanced'][i % 3] as 'Beginner' | 'Intermediate' | 'Advanced',
      keyConcepts: [`${topicName} fundamentals`, `Core concepts`, `Practical applications`]
    });
  }
  
  return fallbackTopics;
}
