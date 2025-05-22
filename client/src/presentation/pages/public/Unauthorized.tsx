import React from 'react';
import { Link } from '@tanstack/react-router';

/**
 * Unauthorized page component to display when a user doesn't have permission to access a resource
 */
export const UnauthorizedPage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                <div className="mb-6">
                    <svg
                        className="w-16 h-16 text-red-500 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>

                <p className="text-gray-600 mb-6">
                    You don't have permission to access this page. Please contact your administrator
                    if you believe this is an error.
                </p>

                <div className="flex flex-col gap-3">
                    <Link
                        to="/"
                        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200"
                    >
                        Return to Dashboard
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md transition duration-200"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UnauthorizedPage;
