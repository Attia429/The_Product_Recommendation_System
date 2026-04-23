function Footer() {
  return (
    <footer className="w-full px-8 py-8 bg-white/5 border-t border-white/10 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
            AI
          </div>
          <span className="text-white font-semibold">RecoAI</span>
        </div>
        <p className="text-white/50 text-sm">AI-powered product recommendations, just for you.</p>
        <div className="flex gap-6 text-white/40 text-xs">
          <span className="hover:text-white/70 cursor-pointer transition">About</span>
          <span className="hover:text-white/70 cursor-pointer transition">Privacy</span>
          <span className="hover:text-white/70 cursor-pointer transition">Contact</span>
        </div>
        <p className="text-white/30 text-xs mt-2">© 2025 RecoAI. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer