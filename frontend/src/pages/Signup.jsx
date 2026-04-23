import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import api from '../services/api'

function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all fields')
      return
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await api.signup(form.name, form.email, form.password)

      if (response.success) {
        // Auto-login after signup
        const loginResponse = await api.login(form.email, form.password)

        if (loginResponse.success) {
          localStorage.setItem('user', JSON.stringify(loginResponse.user))
          localStorage.setItem('token', loginResponse.token)

          navigate('/dashboard')
        } else {
          setError('Account created but login failed. Please login manually.')
        }
      } else {
        setError(response.error || 'Signup failed')
      }
    } catch (err) {
      console.error('Signup error:', err)
      setError(err.message || 'An error occurred during signup')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSignup()
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

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 mb-4">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-white/70 text-sm mb-1 block">Full Name</label>
              <input
                type="text"
                placeholder="Your Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                onKeyPress={handleKeyPress}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 transition"
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-white/70 text-sm mb-1 block">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onKeyPress={handleKeyPress}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 transition"
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-white/70 text-sm mb-1 block">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyPress={handleKeyPress}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 transition"
                disabled={loading}
              />
            </div>

            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
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