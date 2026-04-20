import { NextRequest, NextResponse } from 'next/server';
import { AnalysisService } from '@/services/analysis-service';
import { OpenRouter } from '@openrouter/sdk';

const AI_MODEL = 'nvidia/nemotron-3-nano-30b-a3b:free';
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
    const { resumeText, jobDescription, generateCoverLetter, analysis } = body ?? {};

    // Handle cover letter generation
    if (generateCoverLetter && analysis) {
      try {
        const coverLetterPrompt = `
        You are an expert cover letter writer. Based on the resume analysis below, generate a professional and compelling cover letter.
        The cover letter should be suitable for various job applications and should highlight the candidate's strengths.
        
        Resume Analysis Summary:
        - Overall Rating: ${analysis.ratings.overall}/10
        - Key Strengths: ${analysis.deepAnalysis.content.strengths.slice(0, 3).join(', ')}
        - Summary: ${analysis.summary}
        - Recommendations: ${analysis.recommendations.slice(0, 2).join('. ')}
        
        Generate ONLY the cover letter text. No introductions, no formatting instructions, just the cover letter itself.
        The cover letter should be 3-4 paragraphs and professional in tone.
        Use placeholder [Your Name], [Company Name], and [Hiring Manager Name] where appropriate.
        `;

        const openRouter = new OpenRouter({ apiKey: API_KEY });

        const completion = await sendWithProviderRetry(openRouter, {
          model: AI_MODEL,
          messages: [
            { role: 'system', content: 'You are a professional cover letter writer.' },
            { role: 'user', content: coverLetterPrompt }
          ],
          temperature: 0.7,
        });

        const coverLetterText = extractCompletionText(completion);

        return NextResponse.json({
          success: true,
          coverLetter: coverLetterText
        });
      } catch (error: any) {
        console.error('Cover letter generation failed:', error);
        return NextResponse.json(
          { error: 'Failed to generate cover letter. Please try again.' },
          { status: 500 }
        );
      }
    }

    // Handle resume analysis
    if (!resumeText) {
      console.error('Resume text is required');
      return NextResponse.json(
        { error: 'Resume text is required' },
        { status: 400 }
      );
    }

    const hasJobDescription = jobDescription && typeof jobDescription === 'string' && jobDescription.length > 20;

    const PREFIX_PROMPT = `
    You are an expert resume analyst.
    Respond with valid JSON only.
    No markdown, no code blocks, no explanations, no commentary.
    `;

    const prompt = `
    Analyze the following resume and return ONLY valid JSON that follows the exact schema below. 
    Do not include markdown, prose, or any text outside the JSON object.

    Required JSON schema (example keys only, not example values):

    {
      "ratings": {
        "overall": number,
        "content": number,
        "structure": number,
        "readability": number,
        "keywords": number,
        "achievements": number,
        "professionalism": number
      },
      "deepAnalysis": {
        "content": { "strengths": string[], "improvements": string[] },
        "structure": { "strengths": string[], "improvements": string[] },
        "readability": { "strengths": string[], "improvements": string[] },
        "keywords": { "strengths": string[], "improvements": string[] },
        "achievements": { "strengths": string[], "improvements": string[] },
        "professionalism": { "strengths": string[], "improvements": string[] }
      },
      "recommendations": string[],
      "summary": string,
      ${hasJobDescription ? '"jobMatchScore": number,' : ''}
      ${hasJobDescription ? '"jobMatchAnalysis": string,' : ''}
      "resume": {
        "basics": {
          "name": string,
          "headline": string | null,
          "email": string | null,
          "phone": string | null,
          "location": string | null,
          "links": { "label": string, "url": string }[] | null,
          "summary": string | null
        },
        "skills": { "name": string, "level": string | null, "keywords": string[] | null }[],
        "experience": {
          "company": string,
          "role": string,
          "location": string | null,
          "startDate": string | null,
          "endDate": string | null,
          "current": boolean | null,
          "bullets": string[]
        }[],
        "education": {
          "institution": string,
          "degree": string | null,
          "area": string | null,
          "startDate": string | null,
          "endDate": string | null,
          "details": string[] | null
        }[],
        "projects": {
          "name": string,
          "description": string | null,
          "bullets": string[] | null,
          "link": string | null
        }[] | null
      }
    }

    Important rules:
    - Never reuse example numbers or placeholder values. All ratings and analysis must be based on the resume text.
    - All numerical ratings must be between 0 and 10.
    - The "summary" field must directly address the user using "you" and "your".
    - The JSON must be complete and strictly follow the schema.
    - Do not add fields that are not in the schema.
    - Do not output anything before or after the JSON.
    ${hasJobDescription ? `
    - A job description is provided below. Compare the resume against this job description.
    - Calculate a jobMatchScore (0-10) based on keyword overlap, skill alignment, and experience relevance.
    - Provide jobMatchAnalysis explaining the match score and specific actions to improve fit for this role.
    - If the job description is irrelevant or lacks information, ignore it and omit jobMatchScore and jobMatchAnalysis fields.
    ` : ''}

    Now analyze the following raw resume text:
    ${resumeText}
    ${hasJobDescription ? `\n\n--- JOB DESCRIPTION ---\n${jobDescription}\n--- END JOB DESCRIPTION ---` : ''}
    `;

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
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      );
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
