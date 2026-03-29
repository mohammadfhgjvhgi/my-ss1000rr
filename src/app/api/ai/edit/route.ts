import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, action, targetLanguage, selectedText } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const actionPrompts: Record<string, string> = {
      polish: `أعد صياغة النص التالي بشكل أكثر أناقة واحترافية مع الحفاظ على المعنى الأصلي:\n\n${text}`,
      expand: `وسع النص التالي بإضافة تفاصيل وأمثلة أكثر:\n\n${text}`,
      condense: `لخص النص التالي بشكل مختصر مع الاحتفاظ بالنقاط الرئيسية:\n\n${text}`,
      formal: `حول النص التالي إلى أسلوب رسمي/أكاديمي:\n\n${text}`,
      casual: `حول النص التالي إلى أسلوب عادي/ودي:\n\n${text}`,
      fix_grammar: `صحح الأخطاء الإملائية والنحوية في النص التالي:\n\n${text}`,
      translate: `ترجم النص التالي إلى ${targetLanguage || 'الإنجليزية'}:\n\n${text}`,
      explain: `اشرح النص التالي بشكل مبسط:\n\n${text}`,
      outline: `استخرج النقاط الرئيسية من النص التالي على شكل قائمة:\n\n${text}`,
      custom: selectedText ? `النص المحدد: "${selectedText}"\n\nالمحتوى الكامل:\n${text}\n\nقم بتطبيق التعديل المطلوب على النص المحدد فقط.` : text,
    };

    const prompt = actionPrompts[action] || actionPrompts.polish;

    const response = await zai.chat.completions.create({
      messages: [
        { 
          role: 'system', 
          content: 'أنت مساعد ذكي لتحرير النصوص. قم بتنفيذ المهمة المطلوبة بدقة. أرجع النص المعدل فقط بدون شرح إضافي.' 
        },
        { role: 'user', content: prompt }
      ],
      thinking: { type: 'disabled' }
    });

    const editedText = response.choices[0]?.message?.content || text;

    return NextResponse.json({
      originalText: text,
      editedText,
      action,
      success: true
    });

  } catch (error) {
    console.error('Edit error:', error);
    return NextResponse.json(
      { error: 'Failed to edit text', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
