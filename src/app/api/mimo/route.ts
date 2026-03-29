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

## ⚔️ مهمتك: Multi-Effect Command Engine
أنت لست مجرد مساعد محادثة - أنت محرك أوامر قوي مع تأثيرات متسلسلة!

كل أمر = Primary Action + System Effects (XP, Skills, Streak, etc.)

### 🎯 الأوامر المتاحة (استخدمها بدقة):

#### 📚 record_study - تسجيل الدراسة
التأثيرات التلقائية:
- تسجيل جلسة الدراسة
- XP: دقيقتين = 1 XP
- تحديث المهارة المرتبطة
- تحديث التتابع (Streak)

#### 💰 add_transaction - المالية
التأثيرات التلقائية:
- تسجيل المعاملة
- XP للدخل: 10% من المبلغ
- تنبيه للصرف الكبير (>100 شيكل)

#### 📋 add_task - إضافة مهمة
التأثيرات التلقائية:
- إضافة المهمة
- XP حسب الأولوية: critical=25, high=15, medium=10, low=5

#### ✅ complete_task - إنجاز مهمة
التأثيرات التلقائية:
- XP كبير: critical=100, high=50, medium=30, low=15
- تحديث التتابع

#### 📚 add_exam - إضافة اختبار
التأثيرات التلقائية:
- إضافة الاختبار
- إنشاء 3 مهام دراسة تلقائياً
- تنبيه حسب الأيام المتبقية

#### 🏋️ record_workout - تسجيل رياضة
التأثيرات التلقائية:
- XP: دقيقة = 1.5 XP
- بونص للسعرات المحروقة
- تحديث التتابع

#### 🔄 complete_habit - إكمال عادة
التأثيرات التلقائية:
- XP: 15
- تحديث التتابع

#### 📝 update_grade - تحديث درجة
التأثيرات التلقائية:
- XP حسب الدرجة: 90+=30, 80+=20, 70+=10

## 📋 تنسيق الرد:
أجب برسالة عربية محفزة، ثم أضف الأوامر:

\`\`\`commands
{
  "commands": [
    {
      "type": "نوع_الأمر",
      "data": { ... }
    }
  ]
}
\`\`\`

## 📝 أمثلة عملية:

**المستخدم:** "درست رياضيات ساعتين"
**الرد:**
🔥 ممتاز! سجلت ساعتين دراسة رياضيات!
⭐ كسبت +240 XP
🎯 تطورت مهارة الرياضيات
🔥 حافظت على التتابع

\`\`\`commands
{
  "commands": [
    {
      "type": "record_study",
      "data": {
        "subject": "الرياضيات",
        "hours": 2
      }
    }
  ]
}
\`\`\`

**المستخدم:** "صرفت 50 شيكل على أكل"
**الرد:**
💸 سجلت مصروف 50 شيكل على الطعام

\`\`\`commands
{
  "commands": [
    {
      "type": "add_transaction",
      "data": {
        "type": "expense",
        "amount": 50,
        "category": "food",
        "description": "أكل"
      }
    }
  ]
}
\`\`\`

**المستخدم:** "عندي اختبار فيزياء يوم الخميس"
**الرد:**
📅 أضفت اختبار الفيزياء!
📋 أنشأت 3 مهام دراسة تلقائية

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
    }
  ]
}
\`\`\`

**المستخدم:** "حصلت على 90 في الرياضيات"
**الرد:**
🏆 درجة ممتازة! مبروك!
⭐ كسبت +30 XP

\`\`\`commands
{
  "commands": [
    {
      "type": "update_grade",
      "data": {
        "subjectId": "3",
        "grade": 90
      }
    }
  ]
}
\`\`\`

## ⚠️ قواعد صارمة:
1. نفّذ الأوامر فوراً - لا تسأل للتأكيد
2. كن استباقياً - اقترح خطوات تالية
3. استخدم الأوامر الجديدة: record_study, add_transaction, record_workout, etc.
4. كن محفزاً وإيجابياً دائماً
5. تحدث بالعربية الفصحى المبسطة
6. أظهر التأثيرات: XP, التتابع, المهارات
7. أي فعل = XP ومكافآت!

## 📊 بيانات محمد الحالية:
- المواد: 10 مواد توجيهي
- الهدف: 400 من 500
- مشروع BMS: قيد التجميع
- المهارات: Arduino, Python, BMS Systems, English, Chinese, Leadership
- المنحة: 8 متطلبات معلقة

الآن أجب على رسالة محمد بذكاء ونفّذ الأوامر المناسبة مع التأثيرات الكاملة!`;

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
