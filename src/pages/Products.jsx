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
  { id: 7, name: 'Sunglasses', category: 'Accessories', description: 'UV400 polarized sunglasses with lightweight titanium frame for all-day comfort.', rating: 4.3, price: 49, badge: '🕶️' },
  { id: 8, name: 'Bluetooth Speaker', category: 'Electronics', description: 'Portable waterproof speaker with 360° surround sound and 20hr playtime.', rating: 4.7, price: 69, badge: '🔊' },
]

const categories = ['All', 'Electronics', 'Sports', 'Accessories']

function Products() {
  const [active, setActive] = useState('All')

  const filtered = active === 'All'
    ? allProducts
    : allProducts.filter(p => p.category === active)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950 flex flex-col">
      <Navbar />

      <main className="flex-1 px-6 pt-28 pb-16 max-w-6xl mx-auto w-full">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">All Products</h1>
          <p className="text-white/50">Browse and explore our full product catalog</p>
        </div>

        {/* Category Filter */}
        <div className="flex gap-3 mb-10 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition ${
                active === cat
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white border border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map(p => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Products