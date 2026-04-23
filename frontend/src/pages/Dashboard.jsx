import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import api from '../services/api'
import { transformProductsList } from '../utils/dataTransform'

function Dashboard() {
  const [allProducts, setAllProducts] = useState([])
  const [search, setSearch] = useState('')
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch popular products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await api.getPopularProducts(20)
        const products = data.data || data.products || data.recommendations || []
        const transformed = transformProductsList(products)
        setAllProducts(transformed)
      } catch (err) {
        console.error('Failed to fetch products:', err)
        setError(err.message)
        setAllProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Handle search
  const handleSearch = async () => {
    if (!search.trim()) return

    try {
      setLoading(true)
      setError(null)
      const data = await api.searchProducts(search, 20)
      const products = data.data || data.products || data.recommendations || []
      const transformed = transformProductsList(products)
      setAllProducts(transformed)
      setSearched(true)
    } catch (err) {
      console.error('Search failed:', err)
      setError(err.message)
      setAllProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleInputChange = (e) => {
    setSearch(e.target.value)
    if (e.target.value === '') {
      setSearched(false)
    }
  }

  const displayed = allProducts.slice(0, 8)

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
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="w-full bg-white/10 border border-white/20 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 transition text-sm"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? '🔄' : 'Search'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 text-red-200">
            ⚠️ {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <p className="text-4xl mb-4 animate-spin">⚙️</p>
            <p className="text-white/50">Loading recommendations...</p>
          </div>
        )}

        {/* Results */}
        {!loading && (
          <>
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
                <p className="text-white/50">
                  {search ? `No products found for "${search}"` : 'No products available'}
                </p>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default Dashboard