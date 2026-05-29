import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'

const allProducts = [
  { id: 1, name: 'Wireless Headphones', category: 'Electronics', description: 'Premium noise-cancelling headphones with 30hr battery life and crystal clear sound.', rating: 4.8, price: 99, badge: '🎧' },
  { id: 2, name: 'Smart Watch', category: 'Electronics', description: 'Track your fitness, notifications and health metrics with this sleek smartwatch.', rating: 4.6, price: 149, badge: '⌚' },
  { id: 3, name: 'Running Shoes', category: 'Sports', description: 'Lightweight and comfortable shoes designed for long distance running.', rating: 4.5, price: 79, badge: '👟' },
  { id: 4, name: 'Laptop Backpack', category: 'Accessories', description: 'Water-resistant backpack with USB charging port and multiple compartments.', rating: 4.7, price: 59, badge: '🎒' },
  { id: 5, name: 'Mechanical Keyboard', category: 'Electronics', description: 'RGB backlit mechanical keyboard with tactile switches for a satisfying typing experience.', rating: 4.9, price: 129, badge: '⌨️' },
  { id: 6, name: 'Yoga Mat', category: 'Sports', description: 'Non-slip eco-friendly yoga mat with alignment lines for perfect posture.', rating: 4.4, price: 35, badge: '🧘' },
]

function Dashboard() {
  const [search, setSearch] = useState('')
  const [searched, setSearched] = useState(false)

  const filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  const handleSearch = () => {
    setSearched(true)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  const displayed = searched ? filtered.slice(0, 4) : allProducts.slice(0, 4)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950 flex flex-col">
      <Navbar />

      <main className="flex-1 px-6 pt-28 pb-16 max-w-6xl mx-auto w-full">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-white/50">Here are your AI-powered product recommendations</p>
        </div>

        {/* Search Bar */}
        <div className="flex gap-3 mb-12">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-lg">🔍</span>
            <input
              type="text"
              placeholder="Search products (e.g. Electronics, Shoes...)"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                if (e.target.value === '') setSearched(false)
              }}
              onKeyDown={handleKeyDown}
              className="w-full bg-white/10 border border-white/20 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 transition text-sm"
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:opacity-90 transition"
          >
            Search
          </button>
        </div>

        {/* Results */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-white font-semibold text-xl">
            {searched ? `Results for "${search}"` : 'Recommended for You'}
          </h2>
          <span className="text-white/40 text-sm">{displayed.length} products</span>
        </div>

        {displayed.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayed.map(p => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-white/50">No products found for "{search}"</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default Dashboard