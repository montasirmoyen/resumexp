import { AnalysisResult, ApiResponse, ResumeSchema } from '@/types/analysis';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, query, orderBy, getDocs, doc, getDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { deleteObject, ref } from 'firebase/storage';

export interface SavedAnalysis {
  id: string;
  userId: string;
  createdAt: Timestamp;
  originalFileName: string;
  analysis: AnalysisResult;
  storagePath?: string;
  coverLetter?: string;
}

export class AnalysisService {
  static createMockAnalysis(): AnalysisResult {
    return {
      ratings: {
        overall: 7.2,
        content: 7,
        structure: 6,
        readability: 6,
        keywords: 5,
        achievements: 4,
        professionalism: 7
      },
      deepAnalysis: {
        content: {
          strengths: [
            "Experience descriptions are clear and easy to follow",
            "Strong use of action verbs across bullet points",
            "Relevant technical stack is consistently referenced"
          ],
          improvements: [
            "Add more detail to project descriptions",
            "Include context for responsibilities in earlier roles",
            "Expand the summary to better frame your strengths"
          ]
        },
        structure: {
          strengths: [
            "Sections follow a logical order",
            "Experience is listed in reverse chronological order"
          ],
          improvements: [
            "Consider adding a dedicated skills section near the top",
            "Group related technologies together for easier scanning",
            "Add clearer separation between sections"
          ]
        },
        readability: {
          strengths: [
            "Bullet points are generally concise",
            "Technical terms are used appropriately"
          ],
          improvements: [
            "Shorten longer bullets to improve scanning",
            "Ensure consistent tense across all experience entries",
            "Break up dense sections to improve flow"
          ]
        },
        keywords: {
          strengths: [
            "Includes core technologies like React, Node.js and PostgreSQL",
            "Uses common engineering action verbs"
          ],
          improvements: [
            "Add more role-specific keywords for targeted positions",
            "Include cloud-related terms if applicable",
            "Incorporate soft skills that align with job descriptions"
          ]
        },
        achievements: {
          strengths: [
            "Includes at least one quantified metric",
            "Shows ownership of meaningful engineering tasks"
          ],
          improvements: [
            "Add more measurable outcomes across roles",
            "Highlight performance improvements or efficiency gains",
            "Include metrics for project impact when possible"
          ]
        },
        professionalism: {
          strengths: [
            "Tone is consistent and appropriate for technical roles",
            "No grammatical or stylistic issues detected"
          ],
          improvements: [
            "Add a more polished headline to strengthen first impression",
            "Refine the summary to sound more confident and focused",
            "Ensure all bullets follow a consistent writing style"
          ]
        }
      },
      recommendations: [
        "Add more quantifiable achievements to strengthen impact",
        "Refine the summary to better highlight your strengths",
        "Include more targeted keywords for the roles you want",
        "Reorganize sections to improve scanning and clarity",
        "Ensure consistent tense and tone across all bullets"
      ],
      summary:
        "[MOCK-DATA] Your resume shows strong technical experience and a solid foundation. Improving clarity, adding more measurable achievements and refining your summary will make your resume more competitive.",
      resume: {
        basics: {
          name: "Alex Candidate",
          headline: "Full-Stack Developer",
          email: "alex@example.com",
          phone: "+1 (555) 555-5555",
          location: "Remote",
          links: [{ label: "GitHub", url: "https://github.com/example" }],
          summary:
            "Full-stack developer with 4+ years of experience building scalable web applications using React, Node.js and cloud technologies."
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
              "Developed new features in React and Next.js improving conversion by 12 percent",
              "Led migration to PostgreSQL with zero downtime",
              "Collaborated with cross-functional teams to deliver product updates"
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
            details: ["GPA 3.7 out of 4.0"]
          }
        ],
        projects: [
          {
            name: "Portfolio",
            description: "Personal portfolio with blog",
            bullets: ["SEO optimized and fully responsive design"],
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

  static async analyzeResume(file: File, jobDescription?: string): Promise<AnalysisResult> {
    try {
      const resumeText = await this.extractTextFromFile(file);

      if (!resumeText || resumeText.length < 50) {
        throw new Error('No text could be extracted from the file');
      }

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          resumeText,
          jobDescription: jobDescription && jobDescription.length > 20 ? jobDescription : undefined
        }),
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

  static async saveAnalysis(userId: string, analysis: AnalysisResult, fileName: string): Promise<string> {
    try {
      // Use subcollection: users/{userId}/analyses/{analysisId}
      const userAnalysesRef = collection(db, 'users', userId, 'analyses');
      const docRef = await addDoc(userAnalysesRef, {
        createdAt: serverTimestamp(),
        originalFileName: fileName,
        analysis
      });
      return docRef.id;
    } catch (error) {
      console.error('Failed to save analysis:', error);
      throw new Error('Failed to save analysis to database');
    }
  }

  static async getAnalyses(userId: string): Promise<SavedAnalysis[]> {
    try {
      // Query subcollection - no composite index needed!
      const userAnalysesRef = collection(db, 'users', userId, 'analyses');
      const q = query(userAnalysesRef, orderBy('createdAt', 'desc'));
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        userId,
        ...doc.data()
      } as SavedAnalysis));
    } catch (error) {
      console.error('Failed to fetch analyses:', error);
      throw new Error('Failed to fetch analyses from database');
    }
  }

  static async getAnalysisById(userId: string, id: string): Promise<SavedAnalysis | null> {
    try {
      // Access from user's subcollection
      const docRef = doc(db, 'users', userId, 'analyses', id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      return {
        id: docSnap.id,
        userId,
        ...docSnap.data()
      } as SavedAnalysis;
    } catch (error) {
      console.error('Failed to fetch analysis:', error);
      throw new Error('Failed to fetch analysis from database');
    }
  }

  static async deleteAnalysis(userId: string, analysisId: string, storagePath?: string): Promise<void> {
    try {
      if (storagePath) {
        await deleteObject(ref(storage, storagePath));
      }
    } catch (error) {
      if (error instanceof FirebaseError && error.code === 'storage/object-not-found') {
        console.warn('Resume not found in storage, continuing delete.');
      } else {
        console.warn('Failed to delete resume from storage:', error);
        throw new Error('Failed to delete resume from storage');
      }
    }

    try {
      const docRef = doc(db, 'users', userId, 'analyses', analysisId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Failed to delete analysis:', error);
      throw new Error('Failed to delete analysis from database');
    }
  }

  static async generateCoverLetter(analysis: AnalysisResult): Promise<string> {
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          generateCoverLetter: true,
          analysis
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to generate cover letter');
      }

      const data = await response.json();
      if (!data.coverLetter) {
        throw new Error('No cover letter in response');
      }

      return data.coverLetter;
    } catch (error) {
      console.error('Cover letter generation failed:', error);
      throw error;
    }
  }

  static async updateAnalysisCoverLetter(userId: string, analysisId: string, coverLetter: string): Promise<void> {
    try {
      const { updateDoc } = await import('firebase/firestore');
      const docRef = doc(db, 'users', userId, 'analyses', analysisId);
      await updateDoc(docRef, {
        coverLetter
      });
    } catch (error) {
      console.error('Failed to update analysis with cover letter:', error);
      throw new Error('Failed to save cover letter');
    }
  }
}
