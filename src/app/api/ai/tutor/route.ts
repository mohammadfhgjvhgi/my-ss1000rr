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
    const { message, history, subject } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const zai = await getZAI();

    const systemPrompt = `أنت معلم خبير ومساعد دراسي ذكي. مهمتك:
1. شرح المفاهيم بطريقة بسيطة وواضحة
2. تقديم أمثلة عملية
3. تشجيع الطالب والتحفيز
4. الإجابة على الأسئلة بشكل مفصل
${subject ? `التخصص: ${subject}` : ''}
تحدث بالعربية دائماً بأسلوب ودود ومحفز.`;

    const messages: Array<{ role: 'assistant' | 'user'; content: string }> = [
      { role: 'assistant', content: systemPrompt }
    ];

    if (history && Array.isArray(history)) {
      for (const msg of history) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      }
    }

    messages.push({ role: 'user', content: message });

    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: 'disabled' }
    });

    const response = completion.choices[0]?.message?.content;

    return NextResponse.json({
      success: true,
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI Tutor Error:', error);
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ أثناء معالجة طلبك'
    }, { status: 500 });
  }
}
