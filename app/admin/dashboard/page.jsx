'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { calculateNLSCGrade } from '../../../lib/grading';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { Users, GraduationCap, Award, BookOpen, TrendingUp, RefreshCw } from 'lucide-react';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLearners: 0,
    totalTeachers: 0,
    averageScore: 0,
    topSubject: 'N/A'
  });

  const [gradeDistribution, setGradeDistribution] = useState([]);
  const [subjectAverages, setSubjectAverages] = useState([]);

  useEffect(() => {
    fetchDashboardAnalytics();
  }, []);

  async function fetchDashboardAnalytics() {
    setLoading(true);
    try {
      // 1. Fetch Counts
      const { count: learnersCount } = await supabase.from('learners').select('*', { count: 'exact', head: true });
      const { count: teachersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher');

      // 2. Fetch Grades with Subject Names
      const { data: gradesData, error } = await supabase
        .from('grades')
        .select('*, subjects(name)');

      if (error) throw error;

      if (gradesData && gradesData.length > 0) {
        // Trackers
        const gradeCounts = { A: 0, B: 0, C: 0, D: 0, E: 0 };
        const subjectMap = {};
        let totalScoreSum = 0;

        gradesData.forEach(g => {
          // Calculate score using NLSC engine
          const result = calculateNLSCGrade(g.ca_score, 20, g.eoc_score, 80);
          
          // Increment grade band count
          if (gradeCounts[result.grade] !== undefined) {
            gradeCounts[result.grade] += 1;
          }

          totalScoreSum += result.totalScore;

          // Track scores per subject for averages
          const subjectName = g.subjects?.name || 'Unknown';
          if (!subjectMap[subjectName]) {
            subjectMap[subjectName] = { total: 0, count: 0 };
          }
          subjectMap[subjectName].total += result.totalScore;
          subjectMap[subjectName].count += 1;
        });

        // Format Grade Distribution for Chart
        const formattedGrades = [
          { grade: 'Grade A (Exceptional)', count: gradeCounts.A, color: '#15803d' },
          { grade: 'Grade B (Outstanding)', count: gradeCounts.B, color: '#0369a1' },
          { grade: 'Grade C (Satisfactory)', count: gradeCounts.C, color: '#d97706' },
          { grade: 'Grade D (Basic)', count: gradeCounts.D, color: '#ea580c' },
          { grade: 'Grade E (Elementary)', count: gradeCounts.E, color: '#b91c1c' },
        ];

        // Format Subject Averages for Chart
        const formattedSubjects = Object.keys(subjectMap).map(sub => {
          const avg = Math.round(subjectMap[sub].total / subjectMap[sub].count);
          return { subject: sub, average: avg };
        }).sort((a, b) => b.average - a.average);

        // Find top performing subject
        const bestSubject = formattedSubjects.length > 0 ? formattedSubjects[0].subject : 'N/A';
        const overallAverage = Math.round(totalScoreSum / gradesData.length);

        setStats({
          totalLearners: learnersCount || 0,
          totalTeachers: teachersCount || 0,
          averageScore: overallAverage,
          topSubject: bestSubject
        });

        setGradeDistribution(formattedGrades);
        setSubjectAverages(formattedSubjects);
      }
    } catch (err) {
      console.error('Analytics Error:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        Analyzing Performance Data...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Administrator Performance Dashboard</h1>
          <p className="text-sm text-slate-500">Continuous Assessment & Term Analytics (New Curriculum)</p>
        </div>
        <button
          onClick={fetchDashboardAnalytics}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Data
        </button>
      </div>

      {/* 1. Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Learners</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.totalLearners}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Teaching Staff</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.totalTeachers}</h3>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">School Average</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.averageScore}%</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Top Subject</p>
            <h3 className="text-lg font-bold text-slate-900 mt-1 truncate max-w-[130px]">{stats.topSubject}</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Award className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 2. Performance Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Chart 1: Grade Band Distribution (A - E) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="font-bold text-slate-800 text-base">UNEB Grade Band Distribution</h2>
              <p className="text-xs text-slate-500">Total number of students in each A–E descriptor band</p>
            </div>
            <BookOpen className="w-5 h-5 text-slate-400" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="grade" 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  interval={0}
                  angle={-10}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(226, 232, 240, 0.4)' }}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Average Score per Subject */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="font-bold text-slate-800 text-base">Subject Performance Comparison</h2>
              <p className="text-xs text-slate-500">Average percentage achieved per subject</p>
            </div>
            <TrendingUp className="w-5 h-5 text-slate-400" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectAverages} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis dataKey="subject" type="category" tick={{ fontSize: 11, fill: '#334155' }} width={100} />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Average Score']}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="average" fill="#1e3a8a" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}