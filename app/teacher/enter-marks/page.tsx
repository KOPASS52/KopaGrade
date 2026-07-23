'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { calculateNLSCGrade } from '@/lib/grading';

export default function EnterMarksPage() {
  const [learners, setLearners] = useState([]);
  const [subjects, setSubjects] = useState([]);
  
  // Form state
  const [selectedLearner, setSelectedLearner] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [year, setYear] = useState('2026');
  const [term, setTerm] = useState('1');
  const [caScore, setCaScore] = useState('');
  const [eocScore, setEocScore] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 1. Fetch Learners and Subjects from Supabase when the page loads
  useEffect(() => {
    async function fetchData() {
      const { data: learnersData } = await supabase.from('learners').select('id, first_name, last_name, lin');
      const { data: subjectsData } = await supabase.from('subjects').select('id, name, subject_code');
      
      if (learnersData) setLearners(learnersData);
      if (subjectsData) setSubjects(subjectsData);
    }
    fetchData();
  }, []);

  // 2. Submit and Save to Database
  const handleSaveGrade = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Calculate grade breakdown (20% CA, 80% EoC)
      const gradeResult = calculateNLSCGrade(Number(caScore), 20, Number(eocScore), 100);

      // Get current logged-in teacher ID
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in as a teacher to save grades.');
      }

      // Save to Supabase using UPSERT
      const { data, error } = await supabase
        .from('grades')
        .upsert(
          {
            learner_id: selectedLearner,
            subject_id: selectedSubject,
            teacher_id: user.id,
            year: Number(year),
            term: Number(term),
            ca_score: gradeResult.caContribution,  // Stored out of 20
            eoc_score: gradeResult.eocContribution, // Stored out of 80
          },
          { onConflict: 'learner_id, subject_id, year, term' } // Prevents duplicates
        );

      if (error) throw error;

      setMessage({ 
        type: 'success', 
        text: `Grade successfully saved! Final Grade: ${gradeResult.grade} (${gradeResult.totalScore}%)` 
      });

      // Clear input fields
      setCaScore('');
      setEocScore('');

    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md my-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Enter Student Grades (NLSC)</h2>

      {message.text && (
        <div className={`p-4 mb-4 rounded-md text-sm ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSaveGrade} className="space-y-4">
        {/* Learner Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Learner</label>
          <select 
            value={selectedLearner} 
            onChange={(e) => setSelectedLearner(e.target.value)}
            className="w-full border p-2 rounded mt-1" 
            required
          >
            <option value="">-- Choose Learner --</option>
            {learners.map((l) => (
              <option key={l.id} value={l.id}>{l.first_name} {l.last_name} ({l.lin})</option>
            ))}
          </select>
        </div>

        {/* Subject Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Subject</label>
          <select 
            value={selectedSubject} 
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full border p-2 rounded mt-1" 
            required
          >
            <option value="">-- Choose Subject --</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.subject_code})</option>
            ))}
          </select>
        </div>

        {/* Year and Term Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Year</label>
            <input 
              type="number" 
              value={year} 
              onChange={(e) => setYear(e.target.value)} 
              className="w-full border p-2 rounded mt-1" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Term</label>
            <select 
              value={term} 
              onChange={(e) => setTerm(e.target.value)} 
              className="w-full border p-2 rounded mt-1"
            >
              <option value="1">Term 1</option>
              <option value="2">Term 2</option>
              <option value="3">Term 3</option>
            </select>
          </div>
        </div>

        {/* Continuous Assessment & End of Term Exam */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">CA Score (Out of 20)</label>
            <input 
              type="number" 
              step="0.1" 
              max="20" 
              value={caScore} 
              onChange={(e) => setCaScore(e.target.value)} 
              className="w-full border p-2 rounded mt-1" 
              placeholder="e.g. 15.5" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Exam Score (Out of 100)</label>
            <input 
              type="number" 
              step="0.1" 
              max="100" 
              value={eocScore} 
              onChange={(e) => setEocScore(e.target.value)} 
              className="w-full border p-2 rounded mt-1" 
              placeholder="e.g. 68" 
              required 
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {loading ? 'Saving Grade...' : 'Save Grade to Database'}
        </button>
      </form>
    </div>
  );
}