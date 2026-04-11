import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center text-indigo-600 mb-2">
          Healthcare
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Microservices Platform
        </p>

        <div className="bg-indigo-50 p-6 rounded-lg mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Tailwind Test
          </h2>
          <p className="text-gray-700 mb-4">
            Click the button below to test Tailwind styling is working:
          </p>
          <button
            onClick={() => setCount((count) => count + 1)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 active:scale-95"
          >
            Count: {count}
          </button>
        </div>

        <div className="space-y-3">
          <a
            href="#"
            className="block text-center px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
          >
            Login
          </a>
          <a
            href="#"
            className="block text-center px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
          >
            Register
          </a>
        </div>
      </div>
    </div>
  )
}

export default App
