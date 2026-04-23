// API Service for connecting to the backend
const API_BASE_URL = 'http://localhost:5000/api'

// Helper function to handle API responses
const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message || `API Error: ${response.status}`)
    }
    return response.json()
}

// Health check
export const checkHealth = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/health`)
        return await handleResponse(response)
    } catch (error) {
        console.error('Health check failed:', error)
        throw error
    }
}

// Get dataset statistics
export const getStatistics = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/statistics`)
        return await handleResponse(response)
    } catch (error) {
        console.error('Failed to fetch statistics:', error)
        throw error
    }
}

// Search products
export const searchProducts = async (query, limit = 10) => {
    try {
        const params = new URLSearchParams()
        params.append('q', query)
        params.append('limit', limit)

        const response = await fetch(`${API_BASE_URL}/products/search?${params}`)
        return await handleResponse(response)
    } catch (error) {
        console.error('Failed to search products:', error)
        throw error
    }
}

// Get single product by ID
export const getProductById = async (productId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`)
        return await handleResponse(response)
    } catch (error) {
        console.error(`Failed to fetch product ${productId}:`, error)
        throw error
    }
}

// Get top-rated products
export const getTopRatedProducts = async (limit = 10) => {
    try {
        const params = new URLSearchParams()
        params.append('limit', limit)

        const response = await fetch(`${API_BASE_URL}/products/top-rated?${params}`)
        return await handleResponse(response)
    } catch (error) {
        console.error('Failed to fetch top-rated products:', error)
        throw error
    }
}

// Get popular products
export const getPopularProducts = async (limit = 10) => {
    try {
        const params = new URLSearchParams()
        params.append('limit', limit)

        const response = await fetch(`${API_BASE_URL}/products/popular?${params}`)
        return await handleResponse(response)
    } catch (error) {
        console.error('Failed to fetch popular products:', error)
        throw error
    }
}

// Get content-based recommendations
export const getContentBasedRecommendations = async (productName, nRecommendations = 5) => {
    try {
        const response = await fetch(`${API_BASE_URL}/recommendations/content-based`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                product_name: productName,
                n_recommendations: nRecommendations,
            }),
        })
        return await handleResponse(response)
    } catch (error) {
        console.error('Failed to get content-based recommendations:', error)
        throw error
    }
}

// Get collaborative filtering recommendations
export const getCollaborativeRecommendations = async (userId, nRecommendations = 5) => {
    try {
        const response = await fetch(`${API_BASE_URL}/recommendations/collaborative`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                n_recommendations: nRecommendations,
            }),
        })
        return await handleResponse(response)
    } catch (error) {
        console.error('Failed to get collaborative recommendations:', error)
        throw error
    }
}

// Get hybrid recommendations (BEST)
export const getHybridRecommendations = async (userId, productName, nRecommendations = 5) => {
    try {
        const response = await fetch(`${API_BASE_URL}/recommendations/hybrid`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                product_name: productName,
                n_recommendations: nRecommendations,
                content_weight: 0.4,
                collab_weight: 0.6,
            }),
        })
        return await handleResponse(response)
    } catch (error) {
        console.error('Failed to get hybrid recommendations:', error)
        throw error
    }
}

// Get user ratings history
export const getUserRatings = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/ratings`)
        return await handleResponse(response)
    } catch (error) {
        console.error(`Failed to fetch user ${userId} ratings:`, error)
        throw error
    }
}

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

// Sign up new user
export const signup = async (name, email, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                email,
                password,
            }),
        })
        return await handleResponse(response)
    } catch (error) {
        console.error('Signup failed:', error)
        throw error
    }
}

// Login user
export const login = async (email, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
            }),
        })
        return await handleResponse(response)
    } catch (error) {
        console.error('Login failed:', error)
        throw error
    }
}

// Logout user
export const logout = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        return await handleResponse(response)
    } catch (error) {
        console.error('Logout failed:', error)
        throw error
    }
}

export default {
    checkHealth,
    getStatistics,
    searchProducts,
    getProductById,
    getTopRatedProducts,
    getPopularProducts,
    getContentBasedRecommendations,
    getCollaborativeRecommendations,
    getHybridRecommendations,
    getUserRatings,
    signup,
    login,
    logout,
}
