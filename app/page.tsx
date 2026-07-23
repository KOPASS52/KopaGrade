import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center p-6">
      <div className="max-w-xl w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl text-center space-y-6">
        
        {/* School Identity Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-blue-400 uppercase">
            Koboko Parents SS
          </h1>
          <p className="text-amber-400 italic text-sm font-medium">
            "Together for Excellence"
          </p>
          <p className="text-slate-400 text-xs uppercase tracking-widest pt-2">
            NLSC Assessment & Grading Portal
          </p>
        </div>

        <hr className="border-slate-700" />

        {/* Quick Access Navigation */}
        <div className="grid grid-cols-1 gap-4 pt-2">
          <Link
            href="/admin/dashboard"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
          >
            📊 Admin Dashboard
          </Link>

          <Link
            href="/teacher/enter-marks"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
          >
            ✏️ Teacher Marks Entry
          </Link>
        </div>

        <div className="text-xs text-slate-500 pt-4">
          Powered by National Lower Secondary Curriculum (NLSC) Engine
        </div>
      </div>
    </div>
  );
}