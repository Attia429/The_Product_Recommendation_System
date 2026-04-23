import { Link, useNavigate, useLocation } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const isLanding = location.pathname === '/'

  return (
    <nav className="w-full px-8 py-4 flex justify-between items-center bg-white/10 backdrop-blur-md border-b border-white/20 fixed top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
          AI
        </div>
        <span className="text-white font-bold text-lg tracking-wide">RecoAI</span>
      </div>

      <div className="flex items-center gap-4">
        {isLanding ? (
          <>
            <button
              onClick={() => navigate('/login')}
              className="text-white/80 hover:text-white text-sm font-medium transition"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:opacity-90 transition"
            >
              Sign Up
            </button>
          </>
        ) : (
          <>
            <Link to="/dashboard" className="text-white/80 hover:text-white text-sm font-medium transition">Dashboard</Link>
            <Link to="/products" className="text-white/80 hover:text-white text-sm font-medium transition">Products</Link>
            <button
              onClick={() => navigate('/')}
              className="bg-white/20 hover:bg-white/30 text-white px-5 py-2 rounded-full text-sm font-medium transition"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar