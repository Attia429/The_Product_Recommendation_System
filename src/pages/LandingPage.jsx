import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-24 pb-16">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm text-blue-300 mb-8">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
          AI-Powered Recommendations
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Discover Products
          <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Made for You
          </span>
        </h1>

        <p className="text-white/60 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          Our AI analyzes your preferences and behavior to suggest the most relevant products — saving you time and helping you find exactly what you need.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/signup')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-lg shadow-blue-500/30"
          >
            Get Started →
          </button>
          <button
            onClick={() => navigate('/login')}
            className="bg-white/10 border border-white/20 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/20 transition-all duration-300"
          >
            Login
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-24 max-w-4xl w-full">
          {[
            { icon: '🤖', title: 'AI Powered', desc: 'Smart recommendations using machine learning algorithms' },
            { icon: '⚡', title: 'Real-Time', desc: 'Instant suggestions based on your browsing behavior' },
            { icon: '🎯', title: 'Personalized', desc: 'Tailored results that match your unique preferences' },
          ].map((f, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left hover:bg-white/10 transition">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default LandingPage