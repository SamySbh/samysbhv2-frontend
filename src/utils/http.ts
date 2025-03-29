
export function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('accessToken');
    return token ? {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    } : {
        'Content-Type': 'application/json'
    };
}

export async function authFetch(url: string, options: RequestInit = {}) {
    const headers = { 
        ...getAuthHeaders(),
        ...(options.headers || {})
    };
    
    return fetch(url, {
        ...options,
        headers
    });
}