// Utility to transform backend product data to frontend format

const getCategoryBadge = (category) => {
    const badges = {
        'Electronics': '📱',
        'Sports': '⚽',
        'Accessories': '👜',
        'Home': '🏠',
        'Fashion': '👕',
        'Books': '📚',
        'Food': '🍕',
        'Beauty': '💄',
        'Toys': '🎮',
        'Garden': '🌱',
    }
    return badges[category] || '📦'
}

export const transformProductData = (backendProduct) => {
    return {
        ID: backendProduct.ID || backendProduct.id,
        id: backendProduct.ID || backendProduct.id,
        Name: backendProduct.Name || backendProduct.name,
        name: backendProduct.Name || backendProduct.name,
        Category: backendProduct.Category || backendProduct.category,
        category: backendProduct.Category || backendProduct.category,
        Brand: backendProduct.Brand || backendProduct.brand,
        brand: backendProduct.Brand || backendProduct.brand,
        Description: backendProduct.Description || backendProduct.description,
        description: backendProduct.Description || backendProduct.description,
        Rating: parseFloat(backendProduct.Rating || backendProduct.rating || 3.5),
        rating: parseFloat(backendProduct.Rating || backendProduct.rating || 3.5),
        ReviewCount: backendProduct.ReviewCount || backendProduct.review_count || 0,
        review_count: backendProduct.ReviewCount || backendProduct.review_count || 0,
        ImageURL: backendProduct.ImageURL || backendProduct.image_url || 'https://via.placeholder.com/300',
        image_url: backendProduct.ImageURL || backendProduct.image_url || 'https://via.placeholder.com/300',
        badge: getCategoryBadge(backendProduct.Category || backendProduct.category),
        price: Math.round(Math.random() * 200) + 20, // Generate random price for demo
    }
}

export const transformProductsList = (backendProducts) => {
    return backendProducts.map(transformProductData)
}

// Handle API errors gracefully
export const handleApiError = (error, fallbackData = []) => {
    console.error('API Error:', error.message)
    // Return fallback data or empty array
    return fallbackData
}

// Format rating for display
export const formatRating = (rating) => {
    return (Math.round(rating * 10) / 10).toFixed(1)
}

// Format review count
export const formatReviewCount = (count) => {
    if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
}

export default {
    transformProductData,
    transformProductsList,
    handleApiError,
    formatRating,
    formatReviewCount,
}
