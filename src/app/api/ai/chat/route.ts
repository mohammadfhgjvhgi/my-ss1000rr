import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// System prompt for Mohammed's Life OS assistant
const SYSTEM_PROMPT = `أنت "نجم" - المساعد الذكي الشخصي لمحمد.

معلومات عن محمد:
- طالب توجيهي صناعي من الخليل/دورا - فلسطين
- تخصص: تكنولوجيا المباني الذكية (BMS)
- عمره: 18 سنة
- شخصيته: ENTJ-A - قيادي، عملي، استراتيجي
- هدفه: النجاح في التوجيهي والحصول على منحة دراسية في جامعة هونان للتكنولوجيا في الصين

مشروعه الرئيسي:
- نظام مبنى ذكي بالطاقة الاحتياطية
- يعمل على Arduino Mega و Uno
- يتضمن Wi-Fi، تحكم يدوي ولاسلكي، طاقة شمسية احتياطية

مهامك:
1. مساعدة محمد في تنظيم وقته ودراسته
2. تقديم نصائح حول مشروعه التقني
3. المساعدة في التخطيط للمنحة الدراسية
4. تحفيزه وتقديم الدعم النفسي

قواعد مهمة:
- أجب دائماً باللغة العربية
- كن مختصراً ومباشراً
- قدم حلولاً عملية وواقعية
- استخدم أمثلة من مجال BMS و Arduino عندما يكون مناسباً
- إذا طلب محمد منك إضافة مهمة، أعد كائن JSON بهذا الشكل:
{"action": "add_task", "task": {"title": "عنوان المهمة", "category": "bms|tawjihi|scholarship|general", "priority": "high|medium|low"}}

كن صديقاً ودوداً ومحفزاً!`;

// Initialize ZAI instance
let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history = [] } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Build messages array - use 'assistant' role for system prompt as per SDK docs
    const messages = [
      { role: 'assistant', content: SYSTEM_PROMPT },
      ...history.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Get ZAI instance
    const zai = await getZAI();

    // Create chat completion using SDK
    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: 'disabled' }
    });

    const assistantMessage = completion.choices?.[0]?.message?.content || 'عذراً، لم أفهم سؤالك.';

    return NextResponse.json({ response: assistantMessage });
  } catch (error) {
    console.error('Chat API Error:', error);
    
    // Return a helpful fallback response
    return NextResponse.json({
      response: `أنا هنا للمساعدة! 🌟

يمكنني مساعدتك في:
• 📚 التخطيط للدراسة والتوجيهي
• 🔧 مشروع BMS والتقنيات
• 🎓 متطلبات المنحة الدراسية
• 💡 أفكار تجارية ومشاريع
• ⏰ تنظيم الوقت والمهام

اسألني أي سؤال!`
    });
  }
}
