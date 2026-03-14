import OpenAI from 'openai';
import type { ChatRequest, ScenarioIntent } from '@/types/chat';
import { buildEnrichedContext, hasWhatIfKeywords, computeScenario } from '@/utils/chatContext';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const detectScenarioIntent = async (
  userMessage: string,
): Promise<ScenarioIntent> => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You classify loan-related messages. Determine if the user is asking a what-if or goal-based scenario question.

Return JSON with this structure:
{
  "type": "none" | "prepayment_whatif" | "rate_change_whatif" | "target_closure",
  "prepaymentAmount": <number in rupees if applicable, null otherwise>,
  "prepaymentDate": <"YYYY-MM-DD" if user specifies when, null otherwise>,
  "newRate": <number if rate change scenario, null otherwise>,
  "rateChangeDate": <"YYYY-MM-DD" if specified, null otherwise>,
  "targetYears": <number of years if target closure, null otherwise>
}

Rules:
- "prepayment_whatif": user asks about making an extra/lump-sum payment. Convert lakhs to rupees (1 lakh = 100000).
- "rate_change_whatif": user asks about interest rate changing.
- "target_closure": user wants to know how to close/complete/finish/pay off the loan within a specific timeframe (e.g. "close in 5 years", "complete within 3 years", "how to finish my loan in 2 years"). Extract the number of years.
- "none": any other question (even if it mentions pre-payments that already exist).
- For relative dates like "next month", use today's date as reference and compute the approximate date.
- Today's date: ${new Date().toISOString().split('T')[0]}`,
      },
      { role: 'user', content: userMessage },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 150,
  });

  try {
    const parsed = JSON.parse(response.choices[0]?.message?.content || '{}');
    return {
      type: parsed.type || 'none',
      prepaymentAmount: parsed.prepaymentAmount ?? undefined,
      prepaymentDate: parsed.prepaymentDate ?? undefined,
      newRate: parsed.newRate ?? undefined,
      rateChangeDate: parsed.rateChangeDate ?? undefined,
      targetYears: parsed.targetYears ?? undefined,
    };
  } catch {
    return { type: 'none' };
  }
};

export const POST = async (request: Request) => {
  try {
    const body: ChatRequest = await request.json();
    const { messages, loan, prePayments, rateChanges } = body;

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build enriched context from full amortization engine
    const enrichedContext = buildEnrichedContext(loan, prePayments, rateChanges);

    // Detect and compute what-if scenarios
    const latestUserMessage = messages[messages.length - 1]?.content || '';
    let scenarioData: string | null = null;

    if (hasWhatIfKeywords(latestUserMessage)) {
      const intent = await detectScenarioIntent(latestUserMessage);
      scenarioData = computeScenario(intent, loan, prePayments, rateChanges);
    }

    const systemPrompt = `You are a helpful loan advisor assistant. All data below is pre-computed by an accurate amortization engine. Use these numbers directly. NEVER perform your own calculations or estimate numbers — only present the pre-computed data below.

=== LOAN SUMMARY ===
${enrichedContext.summary}

=== CURRENT STATUS (as of today) ===
${enrichedContext.currentStatus}

=== YEARLY BREAKDOWN ===
${enrichedContext.yearlyBreakdown}

=== PRE-PAYMENT DETAILS ===
${enrichedContext.prePaymentDetails}

=== RATE CHANGE TIMELINE ===
${enrichedContext.rateChangeTimeline}

=== MILESTONES ===
${enrichedContext.milestones}
${scenarioData ? `\n=== WHAT-IF SCENARIO RESULT (pre-computed, use these exact numbers) ===\n${scenarioData}` : ''}

Instructions:
- You ONLY answer questions related to this loan, EMIs, interest, pre-payments, rate changes, and personal finance topics directly relevant to this loan. If the user asks anything unrelated (general knowledge, trivia, coding, etc.), politely decline and say you can only help with loan-related queries.
- All numbers above are EXACT and pre-computed. Present them directly — do NOT recalculate or round differently.
- For strategy/goal questions (e.g. "how to close my loan in X years"), use the pre-computed scenario data to give a clear actionable answer.
- Be SHORT and DIRECT. Answer only what was asked.
- Use INR (₹) formatting with Indian number system (lakhs, crores).
- For what-if scenarios, use ONLY the pre-computed scenario result above.
- Do NOT add motivational text, generic advice, or filler.
- If a one-line answer suffices, give a one-line answer.`;

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      ],
      stream: true,
      max_tokens: 512,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to process chat request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
