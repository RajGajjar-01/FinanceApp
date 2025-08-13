import React, { useState, useEffect } from 'react';
import axios from 'axios'
// Note: axios should be installed in your environment
// This component assumes axios is available as a global or you'll import it

const DjangoCookieAPI = () => {
  const [data, setData] = useState(null);
  const [cookies, setCookies] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiUrl, setApiUrl] = useState('http://localhost:8000/api/test-cookies/');

  // Configure axios defaults
//   const configureAxios = () => {
//     if (typeof axios !== 'undefined') {
//       // Set default config for axios
//       axios.defaults.withCredentials = true;
//       axios.defaults.headers.common['Content-Type'] = 'application/json';
      
//       // Add request interceptor for debugging
//       axios.interceptors.request.use(
//         (config) => {
//           console.log('🚀 Request:', config.method?.toUpperCase(), config.url);
//           return config;
//         },
//         (error) => Promise.reject(error)
//       );

//       // Add response interceptor for debugging
//       axios.interceptors.response.use(
//         (response) => {
//           console.log('✅ Response:', response.status, response.config.url);
//           return response;
//         },
//         (error) => {
//           console.error('❌ Response Error:', error.response?.status, error.response?.statusText);
//           return Promise.reject(error);
//         }
//       );
//     }
//   };

  // Parse cookies from document.cookie
  const parseCookies = () => {
    const cookieString = document.cookie;
    const cookieObj = {};
    
    if (cookieString) {
      cookieString.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name && value) {
          cookieObj[name] = decodeURIComponent(value);
        }
      });
    }
    
    return cookieObj;
  };

  // Fetch data from Django API
  const fetchApiData = async () => {
    if (typeof axios === 'undefined') {
      setError('Axios is not available. Please make sure axios is installed and imported.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('📡 Calling Django API:', apiUrl);
      
      const response = await axios({
        method: 'POST',
        url: apiUrl,
        data: { message: 'hello' }, // Send body with 'hello' string
        withCredentials: true, // Important: This ensures cookies are sent and received
        timeout: 10000, // 10 second timeout
      });
      
      console.log('📦 Response Data:', response.data);
      console.log('🍪 Response Headers:', response.headers);
      
      setData(response.data);
      
      // Update cookies from document.cookie after the request
      setTimeout(() => {
        const currentCookies = parseCookies();
        setCookies(currentCookies);
        console.log('🍪 Parsed Cookies:', currentCookies);
      }, 100); // Small delay to ensure cookies are set
      
    } catch (err) {
      console.error('💥 API Error:', err);
      
      if (err.response) {
        // Server responded with error status
        setError(`Server Error: ${err.response.status} - ${err.response.statusText}`);
      } else if (err.request) {
        // Request was made but no response received
        setError('Network Error: No response from server. Check if Django server is running.');
      } else {
        // Something else happened
        setError(`Request Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Initialize axios and parse existing cookies on mount
  useEffect(() => {
    // configureAxios();
    setCookies(parseCookies());
  }, []);

  // Refresh cookies manually
  const refreshCookies = () => {
    const currentCookies = parseCookies();
    setCookies(currentCookies);
    console.log('🔄 Refreshed Cookies:', currentCookies);
  };

  // Clear specific cookie
  const clearCookie = (cookieName) => {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    refreshCookies();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white shadow-xl rounded-lg p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Django Cookie API Test</h1>
        <p className="text-gray-600 mb-8">Testing Django REST API with HttpOnly and Normal Cookies</p>
        
        {/* API URL Configuration */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Django API URL:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="http://localhost:8000/api/test-cookies/"
            />
            <button
              onClick={fetchApiData}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-6 rounded-md transition-colors duration-200 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </>
              ) : (
                <>
                  <span>🚀</span>
                  Call API
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* API Response Data */}
        {data && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span>📦</span>
              API Response Data
            </h2>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Message</p>
                  <p className="font-semibold text-lg text-blue-800">{data.message}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold text-green-600">{data.status}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600">Timestamp</p>
                <p className="font-mono text-sm text-gray-800">{data.timestamp}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Users ({data.users?.length || 0})</h3>
                <div className="grid gap-3">
                  {data.users?.map(user => (
                    <div key={user.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-800">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          ID: {user.id}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cookies Display */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
              <span>🍪</span>
              Cookies (JavaScript Accessible)
            </h2>
            <button
              onClick={refreshCookies}
              className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors"
            >
              🔄 Refresh
            </button>
          </div>
          
          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            {Object.keys(cookies).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(cookies).map(([name, value]) => (
                  <div key={name} className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{name}</p>
                      <p className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded mt-1 break-all">
                        {value}
                      </p>
                    </div>
                    <button
                      onClick={() => clearCookie(name)}
                      className="ml-4 bg-red-500 hover:bg-red-600 text-white text-xs font-medium py-1 px-3 rounded transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-2">No cookies found</p>
                <p className="text-sm text-gray-500">Call the API to set cookies</p>
              </div>
            )}
          </div>
          
          {/* HttpOnly Cookie Info */}
          <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <span>🔒</span>
              HttpOnly Cookie Information
            </h3>
            <p className="text-blue-700 text-sm leading-relaxed">
              The <code className="bg-blue-100 px-2 py-1 rounded font-mono">secure_token</code> cookie is set as HttpOnly by Django, 
              so it won't appear in the list above. This is a security feature that prevents JavaScript from accessing the cookie, 
              helping protect against XSS attacks. You can view it in your browser's Developer Tools:
            </p>
            <ul className="mt-2 text-blue-700 text-sm list-disc list-inside space-y-1">
              <li>Chrome/Edge: F12 → Application → Storage → Cookies</li>
              <li>Firefox: F12 → Storage → Cookies</li>
              <li>Safari: Develop → Web Inspector → Storage → Cookies</li>
            </ul>
          </div>
        </div>

        {/* Debug Information */}
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span>🐛</span>
            Debug Information
          </h3>
          <div className="space-y-2 text-sm">
            <p><strong>Current URL:</strong> <code className="bg-gray-200 px-1 rounded">{window.location.origin}</code></p>
            <p><strong>API URL:</strong> <code className="bg-gray-200 px-1 rounded">{apiUrl}</code></p>
            <p><strong>Axios Available:</strong> <span className={typeof axios !== 'undefined' ? 'text-green-600' : 'text-red-600'}>
              {typeof axios !== 'undefined' ? '✅ Yes' : '❌ No'}
            </span></p>
            <p><strong>Credentials:</strong> <code className="bg-gray-200 px-1 rounded">withCredentials: true</code></p>
          </div>
          
          <div className="mt-4 p-4 bg-white rounded border">
            <h4 className="font-medium text-gray-700 mb-2">Setup Checklist:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ Django server running on localhost:8000</li>
              <li>✅ CORS configured with CORS_ALLOW_CREDENTIALS = True</li>
              <li>✅ Axios installed and configured with withCredentials</li>
              <li>✅ React app running on allowed origin (localhost:3000 or 5173)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DjangoCookieAPI;