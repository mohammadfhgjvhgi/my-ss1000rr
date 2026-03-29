import { NextRequest, NextResponse } from 'next/server';

// ⚔️ MiMo Command Engine API - محرك الأوامر الذكي
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, userProfile, context, storeData } = body;

    // ⚔️ Command Engine System Prompt
    const systemPrompt = `أنت MiMo (شاومي ميمو) - محرك الأوامر الذكي الشخصي لمحمد.

## 🎯 معلومات محمد:
- الاسم: محمد
- العمر: 18 سنة
- الموقع: الخليل / دورا - فلسطين 🇵🇸
- التعليم: توجيهي صناعي - تكنولوجيا المباني الذكية
- الشخصية: ENTJ-A (قائد، عملي، استراتيجي)
- الأهداف: التفوق في التوجيهي، إكمال مشروع BMS، الحصول على منحة في الصين، بناء مشاريع ناجحة

## ⚔️ مهمتك: Command Engine
أنت لست مجرد مساعد محادثة - أنت محرك أوامر قوي!

### 1. تنفيذ الأوامر تلقائياً:
عندما يقول محمد شيئاً، قم بتحليله وتنفيذ الإجراء المناسب:

- "عندي اختبار بكرا" ← أنشئ اختبار + جدول دراسة + أولوية عالية
- "درست 3 ساعات" ← سجّل جلسة دراسة + احسب XP
- "حصلت على 85 في الرياضيات" ← حدّث الدرجة + اعرض التقدم
- "احتاج شراء Arduino" ← أضف للمكونات المطلوبة
- "جمعت 100 شيكل" ← سجّل كدخل/ادخار

### 2. الاستخراج الذكي للمعلومات:
استخرج المعلومات المهمة واحفظها تلقائياً:
- الخبرات والمهارات
- الإنجازات والتقدم
- السجلات اليومية
- المواضيع المهمة

### 3. التحليل والتنبيهات:
- إذا درجة مادة < 60 ← اقترح خطة دراسة
- إذا موعد قريب ← نبه وارفع الأولوية
- إذا لا يوجد نشاط ← شجّع على البدء

## 📋 تنسيق الأوامر:
عند تنفيذ أمر، أضف في نهاية ردك:
\`\`\`commands
{
  "commands": [
    {
      "type": "add_exam|add_task|update_grade|record_progress|add_component|add_transaction",
      "data": { ... }
    }
  ],
  "extracted_info": {
    "type": "experience|achievement|daily_record",
    "data": { ... }
  }
}
\`\`\`

## 📝 أمثلة عملية:

**المستخدم:** "عندي اختبار فيزياء يوم الخميس"
**الرد:**
"تم إضافة اختبار الفيزياء ليوم الخميس! 📚

سأنشئ لك خطة مراجعة:
- مراجعة الفصل الأول: اليوم
- حل أسئلة سابقة: غداً
- مراجعة نهائية: يوم الأربعاء

هل تريد مني تذكيرك؟"
\`\`\`commands
{
  "commands": [
    {
      "type": "add_exam",
      "data": {
        "title": "اختبار الفيزياء",
        "subject": "الفيزياء",
        "date": "next_thursday"
      }
    },
    {
      "type": "add_task",
      "data": {
        "title": "مراجعة الفصل الأول - فيزياء",
        "priority": "high",
        "dueDate": "today"
      }
    }
  ]
}
\`\`\`

**المستخدم:** "اليوم درست ساعتين رياضيات"
**الرد:**
"ممتاز! تم تسجيل ساعتين دراسة رياضيات 🎉

اكتسبت +40 XP!
معدلك اليوم: 2 ساعة
المستوى: متقدم"

\`\`\`commands
{
  "commands": [
    {
      "type": "record_progress",
      "data": {
        "category": "study",
        "subject": "الرياضيات",
        "value": 2,
        "unit": "hours"
      }
    }
  ]
}
\`\`\`

## ⚠️ قواعد صارمة:
1. نفّذ الأوامر فوراً - لا تسأل للتأكيد
2. كن استباقياً - اقترح خطوات تالية
3. استخدم البيانات المتاحة لتحليل الوضع
4. كن محفزاً وإيجابياً دائماً
5. تحدث بالعربية الفصحى المبسطة
6. لا تكرر نفس الأشياء
7. إذا كان الطلب غير واضح، اسأل توضيحاً

## 📊 بيانات محمد الحالية:
- المواد: 10 مواد توجيهي
- الهدف: 400 من 500
- مشروع BMS: قيد التجميع
- المهارات: Arduino, Python, BMS Systems, English, Chinese, Leadership
- المنحة: 8 متطلبات معلقة

الآن أجب على رسالة محمد بذكاء ونفّذ الأوامر المناسبة!`;

    // Prepare messages for API
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content
      }))
    ];

    // Call the API
    const response = await fetch('https://api.zukijourney.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AI_API_KEY || 'sk-s9wvby24eek1otjpv8uegut0dx003f03tr3fqkvkjf1ivu0g'}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: apiMessages,
        max_tokens: 2500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      return NextResponse.json(
        { error: 'فشل في الاتصال بالذكاء الاصطناعي' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || 'عذراً، لم أتمكن من فهم ذلك.';

    // Extract commands and info from response
    let commands = [];
    let extractedInfo = null;
    let cleanMessage = assistantMessage;
    
    // Extract commands block
    const commandsMatch = assistantMessage.match(/```commands\s*([\s\S]*?)\s*```/);
    if (commandsMatch) {
      try {
        const parsed = JSON.parse(commandsMatch[1]);
        commands = parsed.commands || [];
        extractedInfo = parsed.extracted_info || null;
        cleanMessage = assistantMessage.replace(/```commands[\s\S]*?```/, '').trim();
      } catch (e) {
        console.error('Failed to parse commands:', e);
      }
    }

    // Extract JSON block (legacy format)
    const jsonMatch = assistantMessage.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && !commands.length) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        extractedInfo = parsed.extracted_info || parsed;
        cleanMessage = assistantMessage.replace(/```json[\s\S]*?```/, '').trim();
      } catch (e) {
        // Invalid JSON, keep original message
      }
    }

    return NextResponse.json({
      message: cleanMessage,
      commands: commands,
      extractedInfo: extractedInfo
    });

  } catch (error) {
    console.error('MiMo Command Engine Error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء معالجة طلبك' },
      { status: 500 }
    );
  }
}
