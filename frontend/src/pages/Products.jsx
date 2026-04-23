import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import api from '../services/api'
import { transformProductsList } from '../utils/dataTransform'

function Products() {
    const [allProducts, setAllProducts] = useState([])
    const [active, setActive] = useState('All')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [categories, setCategories] = useState(['All'])

    // Fetch products on component mount
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await api.getPopularProducts(100)
                const products = data.data || data.products || data.recommendations || []
                const transformed = transformProductsList(products)
                setAllProducts(transformed)

                // Extract unique categories
                const uniqueCategories = ['All', ...new Set(transformed.map(p => p.category))]
                setCategories(uniqueCategories)
            } catch (err) {
                console.error('Failed to fetch products:', err)
                setError(err.message)
                setAllProducts([])
                setCategories(['All'])
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [])

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

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 text-red-200">
                        ⚠️ {error}
                    </div>
                )}

                {/* Category Filter */}
                <div className="flex gap-3 mb-10 flex-wrap">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActive(cat)}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition ${active === cat
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white border border-white/20'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-20">
                        <p className="text-4xl mb-4 animate-spin">⚙️</p>
                        <p className="text-white/50">Loading products...</p>
                    </div>
                )}

                {/* Products Grid */}
                {!loading && (
                    <>
                        {filtered.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {filtered.map(p => (
                                    <ProductCard key={p.id} {...p} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <p className="text-4xl mb-4">📭</p>
                                <p className="text-white/50">No products found in this category</p>
                            </div>
                        )}
                    </>
                )}
            </main>

            <Footer />
        </div>
    )
}

export default Products