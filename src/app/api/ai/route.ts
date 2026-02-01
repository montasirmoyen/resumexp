import { NextRequest, NextResponse } from 'next/server';
import { AnalysisService } from '@/services/analysis-service';
import { OpenRouter } from '@openrouter/sdk';

let AI_MODEL = 'tngtech/deepseek-r1t-chimera:free';
const AVAILABLE_MODELS = [
  'tngtech/deepseek-r1t-chimera:free',
  'nvidia/nemotron-3-nano-30b-a3b:free',
  'arcee-ai/trinity-mini:free',
  'tngtech/deepseek-r1t2-chimera:free',
];
function changeModel() {
  const otherModels = AVAILABLE_MODELS.filter((m) => m !== AI_MODEL);
  const randomIndex = Math.floor(Math.random() * otherModels.length);
  AI_MODEL = otherModels[randomIndex];
}
const API_KEY = process.env.OPENROUTER_API_KEY;
const USE_MOCK_DATA = false;
const PROVIDER_ERROR_MESSAGE = 'Provider returned error';

function extractJSON(text: string): string | null {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : null;
}

function isProviderError(error: any): boolean {
  const message =
    error?.message ||
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    error?.error?.message;
  return typeof message === 'string' && message.includes(PROVIDER_ERROR_MESSAGE);
}

async function sendWithProviderRetry(
  openRouter: OpenRouter,
  payload: Parameters<OpenRouter['chat']['send']>[0]
) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await openRouter.chat.send(payload);
    } catch (error) {
      if (isProviderError(error) && attempt < 2) {
        continue;
      }

      if (isProviderError(error)) {
        break;
      }

      throw error;
    }
  }

  changeModel();

  return openRouter.chat.send(payload);
}

function extractCompletionText(completion: unknown): string {
  if (completion && typeof completion === 'object' && 'choices' in completion) {
    const typed = completion as { choices?: Array<{ message?: { content?: unknown } }> };
    const raw = typed.choices?.[0]?.message?.content;

    if (typeof raw === 'string') {
      return raw;
    }

    if (Array.isArray(raw)) {
      return raw
        .map((part) =>
          typeof part === 'string'
            ? part
            : part && typeof part === 'object' && 'type' in part && part.type === 'text' && 'text' in part
              ? String((part as { text?: unknown }).text ?? '')
              : ''
        )
        .join('');
    }
  }

  throw new Error('Unexpected AI response type');
}

export async function POST(request: NextRequest) {
  try {
    if (USE_MOCK_DATA) { // works
      const mockAnalysis = AnalysisService.createMockAnalysis();
      return NextResponse.json({
        success: true,
        analysis: mockAnalysis
      });
    }

    if (!API_KEY) {
      console.error('API key not configured');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { resumeText } = body ?? {};

    if (!resumeText) {
      console.error('Resume text is required');
      return NextResponse.json(
        { error: 'Resume text is required' },
        { status: 400 }
      );
    }

    const PREFIX_PROMPT = 'You are an expert resume analyst. You must respond with valid JSON only, no markdown formatting, no code blocks, no explanatory text.';
    const prompt = `
    Analyze the following resume and return ONLY valid JSON with both analysis and a normalized resume structure (no markdown, no prose).
    Required JSON schema (example values allowed):
    {
      "ratings": { "overall": 7.5, "content": 7, "structure": 8, "formatting": 6, "keywords": 7, "achievements": 7 },
      "deepAnalysis": {
        "content": { "strengths": ["..."], "improvements": ["..."] },
        "structure": { "strengths": ["..."], "improvements": ["..."] },
        "formatting": { "strengths": ["..."], "improvements": ["..."] },
        "keywords": { "strengths": ["..."], "improvements": ["..."] },
        "achievements": { "strengths": ["..."], "improvements": ["..."] }
      },
      "recommendations": ["..."],
      "summary": "...",
      "overallScore": 7.5,
      "resume": {
        "basics": { "name": "...", "headline": "...", "email": "...", "phone": "...", "location": "...", "links": [{"label":"GitHub","url":"https://..."}], "summary": "..." },
        "skills": [{ "name": "Backend", "keywords": ["Node.js","PostgreSQL"] }],
        "experience": [
          { "company": "...", "role": "...", "location": "...", "startDate": "2022-01", "endDate": "2024-03", "current": false, "bullets": ["..."] }
        ],
        "education": [
          { "institution": "...", "degree": "...", "area": "...", "startDate": "2018-08", "endDate": "2022-05", "details": ["..."] }
        ],
        "projects": [{ "name": "...", "description": "...", "bullets": ["..."], "link": "https://..." }]
      }
    }

    In the "summary" field, use words "you" and "your" to directly address the user.
    Respond with ONLY the JSON object, no markdown, no code blocks, no explanatory text, just the JSON.
    You must edit the JSON values based on the resume, don't just give me the example above.
    Now here is the raw resume text: \n${resumeText}`;

    const openRouter = new OpenRouter({ apiKey: API_KEY });

    const completion = await sendWithProviderRetry(openRouter, {
      model: AI_MODEL,
      messages: [
        { role: 'system', content: PREFIX_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
    });

    const text = extractCompletionText(completion);
    console.log('Raw AI response:', text);

    const jsonText = extractJSON(text);

    if (!jsonText) {
      console.error('Planner returned no JSON:', text);
      return { error: 'Failed to parse AI response. Please try again.', status: 500 };
    }

    try {
      const analysis = JSON.parse(jsonText);
      if (!analysis.ratings || typeof analysis.ratings !== 'object') {
        throw new Error('Missing or invalid ratings object');
      }
      if (!analysis.deepAnalysis || typeof analysis.deepAnalysis !== 'object') {
        throw new Error('Missing or invalid deepAnalysis object');
      }
      if (!Array.isArray(analysis.recommendations)) {
        throw new Error('Missing or invalid recommendations array');
      }
      if (!analysis.summary || typeof analysis.summary !== 'string') {
        throw new Error('Missing or invalid summary');
      }

      return NextResponse.json({
        success: true,
        analysis
      });
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response was:', text);
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    if (error.response?.status === 401) {
      return NextResponse.json(
        { error: 'Invalid API key. Please check your API key.' },
        { status: 401 }
      );
    }

    if (error.response?.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to analyze resume. Please try again. ' + (error.message || '') },
      { status: 500 }
    );
  }
}
