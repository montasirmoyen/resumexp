'use client';

import React from 'react';
import { ResumeSchema } from '@/types/analysis';

interface ResumePreviewProps {
  resume: ResumeSchema;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ resume }) => {
  const basics = resume.basics || ({} as any);
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="resume-page">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{basics.name}</h2>
          {basics.headline && <div className="text-gray-600">{basics.headline}</div>}
          <div className="text-sm text-gray-500 mt-2">
            {[basics.email, basics.phone, basics.location].filter(Boolean).join(' • ')}
          </div>
          {!!basics.links?.length && (
            <div className="text-sm text-green-700 mt-1">
              {basics.links.map((l: any, i: number) => (
                <a key={i} className="underline mr-2" href={l.url} target="_blank" rel="noreferrer">
                  {l.label}
                </a>
              ))}
            </div>
          )}
        </div>

        {basics.summary && (
          <section className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Summary</h3>
            <p className="text-gray-700 leading-relaxed">{basics.summary}</p>
          </section>
        )}

        {!!resume.skills?.length && (
          <section className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
            <div className="text-gray-700">
              {resume.skills.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="font-medium">{s.name}:</span>
                  <span>{(s.keywords || []).join(', ')}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {!!resume.experience?.length && (
          <section className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Experience</h3>
            <div className="space-y-3">
              {resume.experience.map((exp, i) => (
                <div key={i}>
                  <div className="font-semibold text-gray-900">
                    {exp.role} — {exp.company}
                  </div>
                  <div className="text-sm text-gray-500">
                    {[exp.location, [exp.startDate, exp.endDate || (exp.current ? 'Present' : '')].filter(Boolean).join(' – ')].filter(Boolean).join(' • ')}
                  </div>
                  {!!exp.bullets?.length && (
                    <ul className="list-disc pl-5 text-gray-700 mt-1">
                      {exp.bullets.map((b, j) => (
                        <li key={j}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {!!resume.projects?.length && (
          <section className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
            <div className="space-y-3">
              {resume.projects.map((p, i) => (
                <div key={i}>
                  <div className="font-semibold text-gray-900">
                    {p.name} {p.link && (
                      <a href={p.link} target="_blank" rel="noreferrer" className="text-green-700 underline text-sm ml-2">Link</a>
                    )}
                  </div>
                  {p.description && <div className="text-gray-700">{p.description}</div>}
                  {!!p.bullets?.length && (
                    <ul className="list-disc pl-5 text-gray-700 mt-1">
                      {p.bullets.map((b, j) => (
                        <li key={j}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {!!resume.education?.length && (
          <section className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Education</h3>
            <div className="space-y-3">
              {resume.education.map((ed, i) => (
                <div key={i}>
                  <div className="font-semibold text-gray-900">{ed.institution}</div>
                  <div className="text-sm text-gray-600">{[ed.degree, ed.area].filter(Boolean).join(', ')}</div>
                  <div className="text-sm text-gray-500">{[ed.startDate, ed.endDate].filter(Boolean).join(' – ')}</div>
                  {!!ed.details?.length && (
                    <ul className="list-disc pl-5 text-gray-700 mt-1">
                      {ed.details.map((d, j) => (
                        <li key={j}>{d}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* 
      <div className="mt-4 flex gap-2">
        <button onClick={() => window.print()} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Download as PDF</button>
      </div>
       */}
    </div>
  );
};


