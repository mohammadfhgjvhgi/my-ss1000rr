import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audio = formData.get('audio') as File;
    const prompt = formData.get('prompt') as string;

    if (!audio) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    // Convert audio to base64
    const buffer = await audio.arrayBuffer();
    const base64Audio = Buffer.from(buffer).toString('base64');
    const mimeType = audio.type || 'audio/mp3';

    // Use ASR for transcription
    const transcription = await zai.asr.transcribe({
      audio: `data:${mimeType};base64,${base64Audio}`,
      language: 'auto',
    });

    const transcribedText = transcription.text || '';

    // If prompt provided, generate meeting minutes
    if (prompt || formData.get('generateMinutes') === 'true') {
      const minutesPrompt = `من النص التالي، استخرج محضر اجتماع منظم:

النص:
${transcribedText}

أرجع النتيجة بتنسيق JSON:
{
  "topic": "موضوع الاجتماع",
  "keyPoints": ["نقطة 1", "نقطة 2"],
  "actionItems": ["إجراء 1", "إجراء 2"],
  "decisions": ["قرار 1", "قرار 2"]
}`;

      const llmResponse = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: 'أنت مساعد ذكي لتنظيم محاضر الاجتماعات. أرجع النتائج بتنسيق JSON فقط.' },
          { role: 'user', content: minutesPrompt }
        ],
        thinking: { type: 'disabled' }
      });

      const content = llmResponse.choices[0]?.message?.content || '';
      
      try {
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        const jsonStr = jsonMatch ? jsonMatch[1] : content;
        const minutes = JSON.parse(jsonStr.trim());
        
        return NextResponse.json({
          text: transcribedText,
          minutes,
          success: true
        });
      } catch {
        return NextResponse.json({
          text: transcribedText,
          minutes: null,
          rawResponse: content,
          success: true
        });
      }
    }

    return NextResponse.json({
      text: transcribedText,
      success: true
    });

  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
