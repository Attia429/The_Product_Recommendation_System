import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const handleSignup = () => {
    if (form.name && form.email && form.password) {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950 flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 pt-24 pb-16">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
              AI
            </div>
            <h2 className="text-2xl font-bold text-white">Create Account</h2>
            <p className="text-white/50 text-sm mt-1">Join RecoAI and discover your products</p>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-white/70 text-sm mb-1 block">Full Name</label>
              <input
                type="text"
                placeholder="Your Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 transition"
              />
            </div>
            <div>
              <label className="text-white/70 text-sm mb-1 block">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 transition"
              />
            </div>
            <div>
              <label className="text-white/70 text-sm mb-1 block">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 transition"
              />
            </div>

            <button
              onClick={handleSignup}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition mt-2"
            >
              Create Account
            </button>
          </div>

          <p className="text-center text-white/50 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition">
              Login
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Signup