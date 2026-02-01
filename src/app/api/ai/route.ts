import { NextRequest, NextResponse } from 'next/server';
import { AnalysisService } from '@/services/analysis-service';
import { OpenRouter } from '@openrouter/sdk';

const AI_MODEL = 'tngtech/deepseek-r1t-chimera:free';
const API_KEY = process.env.OPENROUTER_API_KEY;
const USE_MOCK_DATA = false;

function extractJSON(text: string): string | null {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : null;
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

    const completion = await openRouter.chat.send({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: PREFIX_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
    });

    const raw = completion.choices?.[0]?.message?.content;
    console.log('Raw AI response:', raw);
    const text =
      typeof raw === 'string'
        ? raw
        : Array.isArray(raw)
          ? raw.map((part) => (typeof part === 'string' ? part : part.type === 'text' ? part.text : '')).join('')
          : '';

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
