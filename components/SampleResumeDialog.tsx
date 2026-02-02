'use client';

import React from 'react';
import { X, Lightbulb, TrendingUp, Target, CheckCircle } from 'lucide-react';

interface SampleResumeDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Sample Resume Dialog - shows users how to write effective resume content
 * with quantifiable achievements and ATS-friendly formatting
 */
export default function SampleResumeDialog({ isOpen, onClose }: SampleResumeDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center gap-3">
            <Lightbulb className="text-yellow-300" size={24} />
            <div>
              <h2 className="text-xl font-bold text-white">Sample Resume - Best Practices</h2>
              <p className="text-blue-100 text-sm">Learn how to write ATS-friendly content with quantifiable achievements</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tips Section */}
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h3 className="font-semibold text-amber-800 flex items-center gap-2 mb-2">
              <Target size={18} /> Key Writing Tips
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-amber-700">
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <span>Start bullets with <strong>action verbs</strong>: Led, Developed, Implemented, Achieved</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <span>Include <strong>numbers and percentages</strong>: 30% increase, $50K savings, team of 5</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <span>Be <strong>specific about impact</strong>: What changed? By how much?</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <span>Use <strong>industry keywords</strong> from job descriptions</span>
              </div>
            </div>
          </div>

          {/* Sample Resume */}
          <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
            {/* Sample Header */}
            <div className="text-center py-6 border-b-2 border-gray-800 px-6">
              <h1 className="text-2xl font-bold text-gray-900">Tobias Meier</h1>
              <p className="text-gray-600 mt-1">Software Engineer</p>
              <p className="text-gray-500 text-sm mt-2">
                tobias.meier@example.com ◆ +1-555-555-5555 ◆ San Francisco, CA, USA
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Summary */}
              <section>
                <div className="flex items-center mb-2">
                  <div className="flex-1 h-px bg-gray-400"></div>
                  <h2 className="px-4 font-bold text-gray-800 uppercase tracking-wide text-sm">Summary</h2>
                  <div className="flex-1 h-px bg-gray-400"></div>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Developed and optimized scalable web applications for over <span className="bg-green-100 px-1 rounded font-medium">5 years</span>, 
                  contributing to performance improvements of up to <span className="bg-green-100 px-1 rounded font-medium">40%</span> across multiple 
                  projects. Experienced in agile development, CI/CD pipelines, and modern frameworks like React and Node.js. 
                  Focused on improving user experience through data-driven design decisions and backend efficiency.
                </p>
              </section>

              {/* Experience */}
              <section>
                <div className="flex items-center mb-3">
                  <div className="flex-1 h-px bg-gray-400"></div>
                  <h2 className="px-4 font-bold text-gray-800 uppercase tracking-wide text-sm">Experience</h2>
                  <div className="flex-1 h-px bg-gray-400"></div>
                </div>

                {/* Job 1 */}
                <div className="mb-4">
                  <h3 className="font-bold text-gray-900">Senior Software Engineer</h3>
                  <p className="text-gray-600 text-sm">Tech Innovators Inc. — San Francisco, CA, USA — Jan 2020 - Present</p>
                  <ul className="mt-2 space-y-1.5 text-sm text-gray-700 list-disc ml-5">
                    <li>
                      <span className="bg-blue-100 px-1 rounded">Developed</span> and maintained scalable microservices architecture 
                      using Node.js and Docker, <span className="bg-green-100 px-1 rounded font-medium">increasing system reliability by 25%</span>
                    </li>
                    <li>
                      <span className="bg-blue-100 px-1 rounded">Optimized</span> database queries, reducing API response times by 
                      <span className="bg-green-100 px-1 rounded font-medium"> 30%</span> through MongoDB and PostgreSQL tuning
                    </li>
                    <li>
                      <span className="bg-blue-100 px-1 rounded">Led</span> a team of <span className="bg-green-100 px-1 rounded font-medium">5 engineers</span> in 
                      implementing CI/CD pipelines, reducing deployment time by <span className="bg-green-100 px-1 rounded font-medium">40%</span>
                    </li>
                    <li>
                      <span className="bg-blue-100 px-1 rounded">Collaborated</span> with cross-functional teams to deliver new product features, 
                      resulting in a <span className="bg-green-100 px-1 rounded font-medium">20% increase</span> in customer satisfaction
                    </li>
                  </ul>
                </div>

                {/* Job 2 */}
                <div>
                  <h3 className="font-bold text-gray-900">Software Engineer</h3>
                  <p className="text-gray-600 text-sm">NextGen Solutions — Los Angeles, CA, USA — Jun 2017 - Dec 2019</p>
                  <ul className="mt-2 space-y-1.5 text-sm text-gray-700 list-disc ml-5">
                    <li>
                      <span className="bg-blue-100 px-1 rounded">Designed</span> and implemented front-end components using React and TypeScript, 
                      <span className="bg-green-100 px-1 rounded font-medium"> improving user interface consistency by 30%</span>
                    </li>
                    <li>
                      <span className="bg-blue-100 px-1 rounded">Built</span> RESTful APIs with Express.js and integrated third-party services 
                      for payment and authentication systems
                    </li>
                    <li>
                      <span className="bg-blue-100 px-1 rounded">Wrote</span> automated tests using Jest and Cypress, achieving 
                      <span className="bg-green-100 px-1 rounded font-medium"> 95% test coverage</span> and reducing bugs by <span className="bg-green-100 px-1 rounded font-medium">40%</span>
                    </li>
                    <li>
                      <span className="bg-blue-100 px-1 rounded">Participated</span> in code reviews and mentoring junior developers, 
                      fostering a culture of continuous improvement
                    </li>
                  </ul>
                </div>
              </section>

              {/* Education */}
              <section>
                <div className="flex items-center mb-2">
                  <div className="flex-1 h-px bg-gray-400"></div>
                  <h2 className="px-4 font-bold text-gray-800 uppercase tracking-wide text-sm">Education</h2>
                  <div className="flex-1 h-px bg-gray-400"></div>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Bachelor of Science</p>
                  <p className="text-gray-600 text-sm">University of California — Berkeley, CA, USA — Aug 2013 - May 2017</p>
                  <p className="text-gray-600 text-sm">Computer Science — 3.8/4.0</p>
                </div>
              </section>

              {/* Skills */}
              <section>
                <div className="flex items-center mb-2">
                  <div className="flex-1 h-px bg-gray-400"></div>
                  <h2 className="px-4 font-bold text-gray-800 uppercase tracking-wide text-sm">Skills</h2>
                  <div className="flex-1 h-px bg-gray-400"></div>
                </div>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><span className="font-semibold">Languages:</span> JavaScript — React — Node.js — TypeScript</p>
                  <p><span className="font-semibold">Databases:</span> Docker — MongoDB — PostgreSQL — Jest</p>
                  <p><span className="font-semibold">Tools:</span> CI/CD — Git — AWS — Kubernetes</p>
                </div>
              </section>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <TrendingUp size={16} /> What Makes This Resume Effective
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <span className="bg-blue-100 px-2 py-0.5 rounded text-blue-800 font-medium flex-shrink-0">Action Verbs</span>
                <span className="text-gray-600">Start each bullet with a strong action verb</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-green-100 px-2 py-0.5 rounded text-green-800 font-medium flex-shrink-0">Metrics</span>
                <span className="text-gray-600">Include quantifiable results (%, numbers, $)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Use this as a guide to improve your resume's ATS score
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
