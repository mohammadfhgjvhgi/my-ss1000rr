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
    const { image, task } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    const zai = await getZAI();

    // تحديد المهمة
    const taskPrompts: Record<string, string> = {
      extract_text: 'استخرج كل النصوص من هذه الصورة. احتفظ بالتنسيق قدر الإمكان.',
      explain: 'اشرح محتوى هذه الصورة بالتفصيل. إذا كانت تحتوي على معلومات دراسية، اشرحها بطريقة مبسطة.',
      solve_problem: 'إذا كانت هذه الصورة تحتوي على مسألة أو تمرين، حله خطوة بخطوة.',
      summarize: 'لخص المحتوى الرئيسي في هذه الصورة في نقاط مختصرة.',
      translate: 'ترجم النصوص في هذه الصورة إلى العربية إذا كانت بلغة أخرى.',
      analyze: 'حلل هذه الصورة وقدم معلومات تفصيلية عن محتواها.'
    };

    const prompt = taskPrompts[task] || taskPrompts.analyze;

    const completion = await zai.chat.completions.createVision({
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: image } }
          ]
        }
      ],
      thinking: { type: 'disabled' }
    });

    const result = completion.choices[0]?.message?.content;

    return NextResponse.json({
      success: true,
      task,
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Vision Error:', error);
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ أثناء تحليل الصورة'
    }, { status: 500 });
  }
}
