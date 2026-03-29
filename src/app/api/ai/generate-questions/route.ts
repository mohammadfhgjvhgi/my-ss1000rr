import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

export async function POST(req: NextRequest) {
  try {
    const { content, count = 5, difficulty = 'medium', type = 'multiple_choice' } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const zai = await getZAI();

    const typeInstructions: Record<string, string> = {
      multiple_choice: 'أسئلة اختيار من متعدد مع 4 خيارات لكل سؤال',
      true_false: 'أسئلة صح أو خطأ',
      short_answer: 'أسئلة إجابة قصيرة',
      fill_blank: 'أسئلة ملء الفراغات',
      essay: 'أسئلة مقالية قصيرة'
    };

    const difficultyInstructions: Record<string, string> = {
      easy: 'سهلة - مناسبة للمبتدئين',
      medium: 'متوسطة - تحتاج فهم جيد للمادة',
      hard: 'صعبة - تحتاج تحليل وتفكير عميق'
    };

    const prompt = `بناءً على المحتوى التالي، أنشئ ${count} أسئلة اختبارية.

المحتوى:
"""
${content.substring(0, 3000)}
"""

نوع الأسئلة: ${typeInstructions[type] || typeInstructions.multiple_choice}
مستوى الصعوبة: ${difficultyInstructions[difficulty] || difficultyInstructions.medium}

أعد النتيجة بصيغة JSON كالتالي:
{
  "questions": [
    {
      "question": "السؤال",
      "options": ["خيار 1", "خيار 2", "خيار 3", "خيار 4"],
      "correctAnswer": 0,
      "explanation": "شرح الإجابة الصحيحة"
    }
  ]
}

لأسئلة الصح والخطأ استخدم: options: ["صح", "خطأ"]
للإجابة القصيرة والمقالية لا تضف options`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: 'أنت معلم خبير في إعداد الأسئلة الاختبارية. أعد النتائج بتنسيق JSON صالح فقط.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      thinking: { type: 'disabled' }
    });

    const response = completion.choices[0]?.message?.content;

    let questions;
    try {
      const jsonMatch = response?.match(/\{[\s\S]*\}/);
      questions = jsonMatch ? JSON.parse(jsonMatch[0]) : { questions: [] };
    } catch {
      questions = { questions: [], raw: response };
    }

    return NextResponse.json({
      success: true,
      ...questions,
      meta: {
        count: questions.questions?.length || 0,
        type,
        difficulty
      }
    });
  } catch (error) {
    console.error('Generate Questions Error:', error);
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ أثناء إنشاء الأسئلة'
    }, { status: 500 });
  }
}
