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
    const { query, summarize = true } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const zai = await getZAI();

    const searchResults = await zai.functions.invoke('web_search', {
      query,
      num: 10
    });

    if (!summarize) {
      return NextResponse.json({
        success: true,
        results: searchResults,
        query
      });
    }

    const topResults = searchResults.slice(0, 5);
    const context = topResults
      .map((r: { name: string; snippet: string; url: string }, i: number) => 
        `${i + 1}. ${r.name}\n${r.snippet}\nالمصدر: ${r.url}`
      )
      .join('\n\n');

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: 'أنت مساعد بحث. لخص نتائج البحث بشكل واضح ومفيد باللغة العربية. أضف روابط المصادر.'
        },
        {
          role: 'user',
          content: `سؤال: "${query}"\n\nنتائج البحث:\n${context}\n\nقدم ملخص شامل مع ذكر المصادر.`
        }
      ],
      thinking: { type: 'disabled' }
    });

    const summary = completion.choices[0]?.message?.content;

    return NextResponse.json({
      success: true,
      query,
      summary,
      sources: topResults.map((r: { name: string; url: string }) => ({
        title: r.name,
        url: r.url
      })),
      totalResults: searchResults.length
    });
  } catch (error) {
    console.error('Search Error:', error);
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ أثناء البحث'
    }, { status: 500 });
  }
}
