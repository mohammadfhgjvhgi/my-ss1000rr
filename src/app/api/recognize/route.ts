import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, prompt, existingGrades, existingCourses } = body;

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const systemPrompt = `You are an intelligent academic assistant. Analyze the screenshot and provide:

1. DATA EXTRACTION - Extract structured data from the image
2. ANALYSIS - Identify weak subjects, missing assignments, GPA risks
3. ACTIONABLE INSIGHTS - Generate specific study recommendations

Based on the image type, extract:

For CLASS SCHEDULE:
{
  "type": "schedule",
  "data": {
    "courses": [
      {
        "name": "Course Name",
        "time": "Day HH:mm-HH:mm",
        "location": "Room/Building",
        "instructor": "Instructor Name",
        "weekRange": "Week X-Y"
      }
    ]
  },
  "confidence": 0.0-1.0,
  "analysis": {
    "courseCount": 5,
    "weeklyHours": 15,
    "potentialConflicts": []
  },
  "insights": [
    {
      "type": "study_suggestion",
      "message": "You have back-to-back classes on Monday. Plan breaks.",
      "actionSuggested": "Schedule buffer time between classes"
    }
  ],
  "suggestedActions": [
    {
      "type": "schedule_study",
      "description": "Add 2-hour study block for each course",
      "priority": "medium"
    }
  ]
}

For GRADE REPORT/TRANSCRIPT:
{
  "type": "grade",
  "data": {
    "grades": [
      {
        "courseName": "Course Name",
        "credits": 3.0,
        "score": 85,
        "gradePoint": 3.7
      }
    ]
  },
  "confidence": 0.0-1.0,
  "analysis": {
    "currentGPA": 3.5,
    "weakSubjects": ["Math", "Physics"],
    "strongSubjects": ["English", "History"],
    "gpaTrend": "stable|improving|declining"
  },
  "insights": [
    {
      "type": "weak_subject",
      "message": "Math score (65) is below average. Focus needed.",
      "actionSuggested": "Schedule extra study sessions for Math"
    },
    {
      "type": "gpa_risk",
      "message": "Low grades in core courses may impact overall GPA.",
      "actionSuggested": "Prioritize improvement in weak subjects"
    }
  ],
  "suggestedActions": [
    {
      "type": "create_task",
      "description": "Study Math fundamentals - 2 hours daily",
      "priority": "high",
      "relatedCourse": "Math"
    }
  ]
}

For CREDIT SUMMARY:
{
  "type": "credits",
  "data": {
    "totalCredits": 150,
    "completedCredits": 90,
    "categories": [
      {"name": "Required", "required": 60, "completed": 45}
    ]
  },
  "confidence": 0.0-1.0,
  "analysis": {
    "completionRate": 0.6,
    "remainingCredits": 60,
    "estimatedSemestersRemaining": 2
  },
  "insights": [
    {
      "type": "warning",
      "message": "15 required credits remaining. Plan ahead.",
      "actionSuggested": "Review course registration for next semester"
    }
  ],
  "suggestedActions": []
}

If image doesn't match, return:
{
  "type": "unknown",
  "data": {},
  "confidence": 0,
  "analysis": {},
  "insights": [],
  "suggestedActions": []
}

Return ONLY valid JSON.`;

    const contextPrompt = existingGrades || existingCourses 
      ? `\n\nExisting data context:\n${existingGrades ? `Current grades: ${JSON.stringify(existingGrades)}` : ''}\n${existingCourses ? `Current courses: ${JSON.stringify(existingCourses)}` : ''}`
      : '';

    const userPrompt = prompt || `Analyze this academic screenshot. Extract all data, analyze for weak subjects and risks, and provide actionable study recommendations. Return as JSON.${contextPrompt}`;

    const response = await zai.chat.completions.createVision({
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: userPrompt },
            { type: 'image_url', image_url: { url: image } }
          ]
        }
      ],
      thinking: { type: 'disabled' }
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      return NextResponse.json(
        { error: 'No response from vision model' },
        { status: 500 }
      );
    }

    try {
      let jsonStr = content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }
      
      const result = JSON.parse(jsonStr.trim());
      return NextResponse.json(result);
    } catch {
      return NextResponse.json({
        type: 'unknown',
        data: {},
        confidence: 0,
        analysis: {},
        insights: [],
        suggestedActions: [],
        rawText: content
      });
    }

  } catch (error) {
    console.error('Recognition error:', error);
    return NextResponse.json(
      { error: 'Failed to process image', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
