import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center p-6">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl text-center space-y-6">
        
        {/* School Branding */}
        <div className="space-y-2">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold border-2 border-amber-400">
            KP
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white uppercase pt-2">
            Koboko Parents SS
          </h1>
          <p className="text-amber-400 italic text-xs font-medium">
            "Together for Excellence"
          </p>
          <p className="text-slate-400 text-xs uppercase tracking-widest pt-1">
            NLSC Assessment Portal
          </p>
        </div>

        <hr className="border-slate-700" />

        {/* Universal Login Call to Action */}
        <div className="space-y-3 pt-2">
          <Link
            href="/login"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-4 rounded-xl transition shadow-lg flex items-center justify-center gap-2 text-sm tracking-wide"
          >
            🔐 Staff & Teacher Login
          </Link>
          <p className="text-slate-400 text-xs">
            Enter your credentials to access your specific portal space.
          </p>
        </div>

        <div className="text-[11px] text-slate-500 pt-4 border-t border-slate-700/50">
          Uganda National Lower Secondary Curriculum System
        </div>
      </div>
    </div>
  );
}