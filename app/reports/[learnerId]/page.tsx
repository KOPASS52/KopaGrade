'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { calculateNLSCGrade } from '@/lib/grading';

export default function ReportCardPage({ params }) {
  const [learner, setLearner] = useState(null);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch student profile and grades from Supabase
  useEffect(() => {
    async function loadReportData() {
      try {
        // 1. Fetch learner bio
        const { data: learnerData } = await supabase
          .from('learners')
          .select('*')
          .eq('id', params.learnerId)
          .single();

        // 2. Fetch grades with joined subject names
        const { data: gradesData } = await supabase
          .from('grades')
          .select('*, subjects(name, subject_code)')
          .eq('learner_id', params.learnerId);

        if (learnerData) setLearner(learnerData);
        if (gradesData) {
          // Process raw scores through our NLSC grading engine
          const processed = gradesData.map(g => {
            const result = calculateNLSCGrade(g.ca_score, 20, g.eoc_score, 80);
            return {
              ...g,
              totalScore: result.totalScore,
              grade: result.grade,
              descriptor: result.descriptor
            };
          });
          setGrades(processed);
        }
      } catch (err) {
        console.error('Error loading report card:', err);
      } finally {
        setLoading(false);
      }
    }

    if (params.learnerId) loadReportData();
  }, [params.learnerId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Report Card...</div>;
  if (!learner) return <div className="p-8 text-center text-red-500">Learner record not found.</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      {/* Action Bar (Hidden when printing) */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition text-sm font-semibold"
        >
          ← Back to Dashboard
        </button>
        <button
          onClick={handlePrint}
          className="px-6 py-2.5 bg-blue-700 text-white font-bold rounded-lg shadow-md hover:bg-blue-800 transition flex items-center gap-2"
        >
          🖨️ Print / Save as A4 PDF
        </button>
      </div>

      {/* Printable A4 Page Wrapper */}
      <div className="max-w-4xl mx-auto bg-white p-8 border shadow-lg print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none text-slate-800 font-sans text-sm">
        
        {/* 1. School Header & Logo Area */}
        <div className="border-b-4 border-double border-blue-900 pb-3 mb-4 text-center relative">
          <div className="flex items-center justify-center gap-4">
            {/* School Emblem / Badge */}
            <img
              src="/logo.png"
              alt="School Logo"
              className="w-20 h-20 object-contain"
              />
              <h1 className="text-2xl font-black text-blue-950 uppercase tracking-wide">Koboko Parents Secondary School</h1>
              <p className="text-xs font-bold text-amber-600 italic">"Together for Excellence"</p>
              <p className="text-xs text-slate-600">
                P.O. Box 52, Koboko, Uganda • Tel: +256 775 582 278 / +256 782 412 024<br />
                Email: kobokoparentsss@gmail.com • Web: www.kobokoparentssecschool.ac.ug
              </p>
          </div>
          <div className="mt-2 inline-block bg-blue-900 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
            Continuous Assessment & Termly Performance Report
          </div>
        </div>

        {/* 2. Student Bio Data Card */}
        <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 mb-4 text-xs">
          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
            <div><span className="font-bold text-slate-600">Learner Name:</span> <strong className="text-slate-900 uppercase">{learner.first_name} {learner.last_name}</strong></div>
            <div><span className="font-bold text-slate-600">LIN (NIRA):</span> {learner.lin}</div>
            <div><span className="font-bold text-slate-600">Class & Stream:</span> {learner.current_class} ({learner.stream || 'A'})</div>
            <div><span className="font-bold text-slate-600">Gender:</span> {learner.gender === 'M' ? 'Male' : 'Female'}</div>
            <div><span className="font-bold text-slate-600">Academic Year:</span> 2026</div>
            <div><span className="font-bold text-slate-600">Term:</span> Term I</div>
          </div>
        </div>

        {/* 3. NLSC Academic Performance Table */}
        <table className="w-full border-collapse mb-4 text-xs text-left">
          <thead>
            <tr className="bg-blue-900 text-white uppercase text-[10px] tracking-wider">
              <th className="p-2 border border-blue-900">Subject</th>
              <th className="p-2 border border-blue-900 text-center">CA (20%)</th>
              <th className="p-2 border border-blue-900 text-center">Exam (80%)</th>
              <th className="p-2 border border-blue-900 text-center">Total (100%)</th>
              <th className="p-2 border border-blue-900 text-center">Grade</th>
              <th className="p-2 border border-blue-900 text-center">Descriptor</th>
            </tr>
          </thead>
          <tbody>
            {grades.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500 italic border">No subject grades recorded for this term.</td>
              </tr>
            ) : (
              grades.map((g, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="p-2 border border-slate-300 font-semibold">{g.subjects?.name || 'Subject'}</td>
                  <td className="p-2 border border-slate-300 text-center">{g.ca_score}</td>
                  <td className="p-2 border border-slate-300 text-center">{g.eoc_score}</td>
                  <td className="p-2 border border-slate-300 text-center font-bold">{g.totalScore}%</td>
                  <td className="p-2 border border-slate-300 text-center">
                    <span className={`inline-block w-6 h-6 leading-6 text-center text-white font-bold rounded ${
                      g.grade === 'A' ? 'bg-green-700' :
                      g.grade === 'B' ? 'bg-sky-700' :
                      g.grade === 'C' ? 'bg-amber-600' :
                      g.grade === 'D' ? 'bg-orange-600' : 'bg-red-700'
                    }`}>
                      {g.grade}
                    </span>
                  </td>
                  <td className="p-2 border border-slate-300 text-center">{g.descriptor}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* 4. Legend & Summary Block */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
          <div className="border border-slate-300 rounded p-2.5 bg-slate-50">
            <h4 className="font-bold text-blue-900 border-b pb-1 mb-1 text-[11px]">UNEB NLSC Grade Scale</h4>
            <ul className="space-y-0.5 text-[10px] text-slate-700">
              <li><strong>Grade A</strong> (80 - 100%): Exceptional (5 Pts)</li>
              <li><strong>Grade B</strong> (70 - 79%): Outstanding (4 Pts)</li>
              <li><strong>Grade C</strong> (60 - 69%): Satisfactory (3 Pts)</li>
              <li><strong>Grade D</strong> (50 - 59%): Basic (2 Pts)</li>
              <li><strong>Grade E</strong> (00 - 49%): Elementary (1 Pt)</li>
            </ul>
          </div>

          <div className="border border-slate-300 rounded p-2.5 bg-slate-50">
            <h4 className="font-bold text-blue-900 border-b pb-1 mb-1 text-[11px]">Term Summary</h4>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between"><span>Subjects Assessed:</span> <strong>{grades.length}</strong></div>
              <div className="flex justify-between"><span>Overall Status:</span> <strong className="text-green-700">Satisfactory Progress</strong></div>
              <div className="flex justify-between"><span>Next Term Starts:</span> <strong>14th September 2026</strong></div>
            </div>
          </div>
        </div>

        {/* 5. Remarks & Signatures */}
        <div className="border border-slate-300 rounded p-3 mb-6 space-y-2 text-xs">
          <div>
            <span className="font-bold text-blue-900">Class Teacher's Remarks:</span>
            <span className="italic text-slate-700 ml-2">Demonstrates solid understanding in continuous assessment tasks. Keep working hard in sciences.</span>
          </div>
          <div>
            <span className="font-bold text-blue-900">Headteacher's Remarks:</span>
            <span className="italic text-slate-700 ml-2">Good progress made this term. Commended for steady conduct.</span>
          </div>
        </div>

        {/* Signatures & Stamp */}
        <div className="grid grid-cols-3 gap-4 text-center text-xs mt-8">
          <div>
            <div className="border-t border-dashed border-slate-500 pt-1 font-bold">Class Teacher</div>
          </div>
          <div className="flex justify-center">
            <div className="w-24 h-12 border-2 border-dashed border-slate-400 rounded-full flex items-center justify-center text-[9px] text-slate-400">
              OFFICIAL STAMP
            </div>
          </div>
          <div>
            <div className="border-t border-dashed border-slate-500 pt-1 font-bold">Headteacher</div>
          </div>
        </div>

      </div>

      {/* CSS Rules to ensure clean printing */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm;
          }
          body {
            background-color: #ffffff !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}