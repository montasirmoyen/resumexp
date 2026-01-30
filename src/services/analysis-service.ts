import { AnalysisResult, ApiResponse, ResumeSchema } from '@/types/analysis';

export class AnalysisService {
  static createMockAnalysis(): AnalysisResult {
    return {
      ratings: {
        overall: 7,
        content: 8,
        structure: 6,
        formatting: 7,
        keywords: 8,
        achievements: 6
      },
      deepAnalysis: {
        content: {
          strengths: [
            "Clear and concise job descriptions",
            "Good use of action verbs",
            "Relevant experience highlighted"
          ],
          improvements: [
            "Add more quantifiable achievements",
            "Include specific metrics and results",
            "Expand on technical skills"
          ]
        },
        structure: {
          strengths: [
            "Logical flow from experience to education",
            "Consistent formatting throughout"
          ],
          improvements: [
            "Consider adding a professional summary",
            "Reorganize sections for better impact",
            "Add more white space for readability"
          ]
        },
        formatting: {
          strengths: [
            "Clean, professional layout",
            "Consistent font usage"
          ],
          improvements: [
            "Improve bullet point formatting",
            "Add section dividers",
            "Optimize for ATS systems"
          ]
        },
        keywords: {
          strengths: [
            "Industry-relevant terminology used",
            "Technical skills clearly listed"
          ],
          improvements: [
            "Include more job-specific keywords",
            "Add soft skills section",
            "Use variations of key terms"
          ]
        },
        achievements: {
          strengths: [
            "Some quantified results included"
          ],
          improvements: [
            "Add more specific metrics",
            "Include percentage improvements",
            "Highlight cost savings or revenue generated"
          ]
        }
      },
      recommendations: [
        "Add a professional summary at the top to immediately capture attention",
        "Quantify your achievements with specific numbers and percentages",
        "Include more industry-specific keywords to pass ATS screening",
        "Consider adding a skills section with both technical and soft skills",
        "Use bullet points consistently and keep them concise",
        "Add any relevant certifications or professional development"
      ],
      summary: "[MOCK-DATA] Your resume shows good potential with clear experience and relevant skills. The main areas for improvement are adding more quantifiable achievements and optimizing for ATS systems. With some strategic enhancements, this resume will be much more competitive.",
      overallScore: 5,
      resume: {
        basics: {
          name: "Alex Candidate",
          headline: "Full-Stack Developer",
          email: "alex@example.com",
          phone: "+1 (555) 555-5555",
          location: "Remote",
          links: [{ label: "GitHub", url: "https://github.com/example" }],
          summary: "Developer with 4+ years building web apps with React, Node.js, and cloud."
        },
        skills: [
          { name: "Frontend", keywords: ["React", "Next.js", "TypeScript"] },
          { name: "Backend", keywords: ["Node.js", "Express", "PostgreSQL"] }
        ],
        experience: [
          {
            company: "Acme Corp",
            role: "Software Engineer",
            location: "Remote",
            startDate: "2022-01",
            endDate: "2024-03",
            current: false,
            bullets: [
              "Built features in React/Next.js improving conversion by 12%",
              "Led migration to PostgreSQL with zero downtime"
            ]
          }
        ],
        education: [
          {
            institution: "State University",
            degree: "B.Sc.",
            area: "Computer Science",
            startDate: "2018-08",
            endDate: "2022-05",
            details: ["GPA 3.7/4.0"]
          }
        ],
        projects: [
          {
            name: "Portfolio",
            description: "Personal portfolio with blog",
            bullets: ["SEO-optimized, responsive design"],
            link: "https://example.com"
          }
        ]
      }
    };
  }

  private static async extractTextFromFile(file: File): Promise<string> {
    const fileType = file.type;

    if (fileType === 'application/pdf') {
      const pdfToText = (await import('react-pdftotext')).default;
      return await pdfToText(file);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const mammoth = (await import('mammoth')).default;
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } else if (fileType === 'text/plain') {
      return await file.text();
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
  }

  static async analyzeResume(file: File): Promise<AnalysisResult> {
    try {
      const resumeText = await this.extractTextFromFile(file);

      if (!resumeText.trim()) {
        throw new Error('No text could be extracted from the file');
      }

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resumeText }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to fetch response');
      }

      const data: ApiResponse = await response.json();

      if (!data.success || !data.analysis) {
        throw new Error(data.error || 'Failed to analyze resume');
      }

      try {
        sessionStorage.setItem('lastResumeText', resumeText);
      } catch { }
      return data.analysis;
    } catch (error) {
      console.error('Analysis failed:', error);
      throw error;
    }
  }

  static validateFile(file: File): { isValid: boolean; error?: string } {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    const maxSize = 10 * 1024 * 1024; // 10mb

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Please upload a PDF, DOCX, or TXT file.'
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size must be less than 10MB.'
      };
    }

    return { isValid: true };
  }
}
