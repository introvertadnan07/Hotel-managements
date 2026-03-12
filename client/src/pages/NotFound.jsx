import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center px-6 text-center transition-colors duration-300">

      {/* Big 404 */}
      <div className="relative mb-8">
        <p className="text-[160px] md:text-[220px] font-playfair font-bold text-gray-100 dark:text-gray-800 leading-none select-none">
          404
        </p>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-gray-900 dark:bg-white rounded-2xl flex items-center justify-center shadow-lg mb-2">
            <svg className="w-8 h-8 text-white dark:text-gray-900" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          </div>
        </div>
      </div>

      <h1 className="text-2xl md:text-3xl font-playfair text-gray-900 dark:text-white mb-3">
        Page Not Found
      </h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base max-w-sm mb-8">
        The page you're looking for doesn't exist or has been moved. Let's get you back home.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => navigate("/")}
          className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium text-sm hover:opacity-80 transition"
        >
          Go Home
        </button>
        <button
          onClick={() => navigate(-1)}
          className="px-8 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-full font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          Go Back
        </button>
      </div>

    </div>
  );
};

export default NotFound;