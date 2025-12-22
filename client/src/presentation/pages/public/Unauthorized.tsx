import React from 'react';
import { Link } from '@tanstack/react-router';
import { ShieldAlert, ArrowLeft, Home, Lock } from 'lucide-react';
import { Button } from '@/presentation/components/shared/ui/button';
import { motion } from 'framer-motion';

/**
 * Unauthorized page component to display when a user doesn't have permission to access a resource
 */
export const UnauthorizedPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-amber-500 to-red-500" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-50 rounded-full blur-3xl opacity-50" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-slate-100 rounded-full blur-3xl opacity-50" />

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 md:p-10 text-center relative z-10"
            >
                <div className="mb-8 relative inline-block">
                    <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto rotate-3">
                        <ShieldAlert className="w-10 h-10 text-red-500 -rotate-3" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center shadow-sm">
                        <Lock className="w-4 h-4 text-slate-400" />
                    </div>
                </div>

                <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
                    Access Restricted
                </h1>

                <p className="text-slate-500 mb-8 leading-relaxed">
                    It looks like you don't have the necessary permissions to view this page. 
                    Please contact your system administrator if you believe this is an error.
                </p>

                <div className="space-y-3">
                    <Button asChild className="w-full h-11 font-semibold">
                        <Link to="/dashboard-selection">
                            <Home className="mr-2 h-4 w-4" />
                            Return to Dashboard
                        </Link>
                    </Button>

                    <Button 
                        variant="outline" 
                        onClick={() => window.history.back()}
                        className="w-full h-11 border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Go Back
                    </Button>
                </div>

                <div className="mt-10 pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-widest">
                        <div className="h-1 w-1 bg-slate-300 rounded-full" />
                        EnviroTrace Security
                        <div className="h-1 w-1 bg-slate-300 rounded-full" />
                    </div>
                </div>
            </motion.div>

            <p className="mt-8 text-slate-400 text-sm">
                &copy; {new Date().getFullYear()} Environmental Management System
            </p>
        </div>
    );
};

export default UnauthorizedPage;
