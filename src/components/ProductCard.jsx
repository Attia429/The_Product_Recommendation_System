function ProductCard({ name, category, description, rating, price, badge }) {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 hover:bg-white/15 hover:scale-105 transition-all duration-300 cursor-pointer">
      <div className="flex justify-between items-start mb-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-2xl">
          {badge}
        </div>
        <span className="bg-blue-500/30 text-blue-200 text-xs px-3 py-1 rounded-full font-medium">
          {category}
        </span>
      </div>
      <h3 className="text-white font-semibold text-lg mb-1">{name}</h3>
      <p className="text-white/60 text-sm mb-4 leading-relaxed">{description}</p>
      <div className="flex justify-between items-center">
        <span className="text-yellow-400 text-sm">{'★'.repeat(Math.floor(rating))} <span className="text-white/50">{rating}/5</span></span>
        <span className="text-white font-bold text-lg">${price}</span>
      </div>
      <button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-xl text-sm font-medium hover:opacity-90 transition">
        View Product
      </button>
    </div>
  )
}

export default ProductCard