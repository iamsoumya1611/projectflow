import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
    return (
        <div className="min-h-screen bg-[#14141D] flex flex-col">
            {/* Hero Section */}
            <div className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16 md:py-24"
                style={{ 
                    backgroundImage: 'radial-gradient(circle at center, rgba(74, 144, 226, 0.1) 0%, rgba(20, 20, 29, 0) 70%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}>
                <div className="text-center max-w-4xl mx-auto">
                    <div className="inline-block mb-6 px-4 py-1 bg-[#2D2D44] rounded-full">
                        <span className="text-[#50E3C2] text-sm font-medium">Project Management Redefined</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
                        Streamline Your Projects with <span className="text-[#4A90E2]">ProjectFlow</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-[#A0A0B0] mb-10 max-w-3xl mx-auto leading-relaxed">
                        A modern, intuitive project management tool designed to help teams organize, track, and collaborate on projects with unprecedented efficiency.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
                        <Link
                            to="/register"
                            className="px-8 py-4 border border-transparent text-base font-medium rounded-lg text-white bg-[#4A90E2] hover:bg-[#3a7bc8] md:py-4 md:text-lg md:px-12 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-[#4A90E2]/20"
                        >
                            Get Started Free
                        </Link>
                        <Link
                            to="/login"
                            className="px-8 py-4 border border-[#4A90E2] text-base font-medium rounded-lg text-[#4A90E2] bg-transparent hover:bg-[#4A90E2] hover:text-white md:py-4 md:text-lg md:px-12 transition-all duration-300 transform hover:-translate-y-1"
                        >
                            Sign In
                        </Link>
                    </div>
                    
                    {/* Stats Preview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto mt-16">
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-white mb-2">10K+</div>
                            <div className="text-[#A0A0B0] text-sm">Projects Managed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-white mb-2">50K+</div>
                            <div className="text-[#A0A0B0] text-sm">Tasks Completed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-white mb-2">5K+</div>
                            <div className="text-[#A0A0B0] text-sm">Teams Empowered</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-white mb-2">99%</div>
                            <div className="text-[#A0A0B0] text-sm">Uptime</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-20 bg-[#1F1F2E]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                            Powerful Features for Modern Teams
                        </h2>
                        <p className="text-xl text-[#A0A0B0] max-w-3xl mx-auto">
                            Everything you need to manage projects effectively and collaborate seamlessly
                        </p>
                    </div>

                    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-[#2D2D44] rounded-xl p-8 border border-[#2D2D44] hover:border-[#4A90E2] transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl">
                            <div className="text-[#4A90E2] text-4xl mb-6">
                                <i className="fas fa-tasks"></i>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">Task Management</h3>
                            <p className="text-[#A0A0B0] mb-6">
                                Create, assign, and track tasks with detailed descriptions, due dates, and priority levels.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-center text-[#A0A0B0]">
                                    <i className="fas fa-check-circle text-[#50E3C2] mr-2"></i>
                                    <span>Drag & drop interface</span>
                                </li>
                                <li className="flex items-center text-[#A0A0B0]">
                                    <i className="fas fa-check-circle text-[#50E3C2] mr-2"></i>
                                    <span>Priority levels</span>
                                </li>
                                <li className="flex items-center text-[#A0A0B0]">
                                    <i className="fas fa-check-circle text-[#50E3C2] mr-2"></i>
                                    <span>Deadline tracking</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-[#2D2D44] rounded-xl p-8 border border-[#2D2D44] hover:border-[#4A90E2] transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl">
                            <div className="text-[#4A90E2] text-4xl mb-6">
                                <i className="fas fa-project-diagram"></i>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">Project Tracking</h3>
                            <p className="text-[#A0A0B0] mb-6">
                                Visualize project progress with Gantt charts and Kanban boards for better workflow management.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-center text-[#A0A0B0]">
                                    <i className="fas fa-check-circle text-[#50E3C2] mr-2"></i>
                                    <span>Gantt charts</span>
                                </li>
                                <li className="flex items-center text-[#A0A0B0]">
                                    <i className="fas fa-check-circle text-[#50E3C2] mr-2"></i>
                                    <span>Kanban boards</span>
                                </li>
                                <li className="flex items-center text-[#A0A0B0]">
                                    <i className="fas fa-check-circle text-[#50E3C2] mr-2"></i>
                                    <span>Progress tracking</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-[#2D2D44] rounded-xl p-8 border border-[#2D2D44] hover:border-[#4A90E2] transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl">
                            <div className="text-[#4A90E2] text-4xl mb-6">
                                <i className="fas fa-comments"></i>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">Team Collaboration</h3>
                            <p className="text-[#A0A0B0] mb-6">
                                Real-time commenting and notifications to keep everyone on the same page.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-center text-[#A0A0B0]">
                                    <i className="fas fa-check-circle text-[#50E3C2] mr-2"></i>
                                    <span>Real-time chat</span>
                                </li>
                                <li className="flex items-center text-[#A0A0B0]">
                                    <i className="fas fa-check-circle text-[#50E3C2] mr-2"></i>
                                    <span>File sharing</span>
                                </li>
                                <li className="flex items-center text-[#A0A0B0]">
                                    <i className="fas fa-check-circle text-[#50E3C2] mr-2"></i>
                                    <span>Notifications</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-20 bg-gradient-to-r from-[#4A90E2]/10 to-[#50E3C2]/10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
                        Ready to Transform Your Project Management?
                    </h2>
                    <p className="text-xl text-[#A0A0B0] mb-10 max-w-3xl mx-auto">
                        Join thousands of teams who use ProjectFlow to streamline their workflows and boost productivity.
                    </p>
                    <Link
                        to="/register"
                        className="inline-block px-10 py-4 border border-transparent text-base font-medium rounded-lg text-white bg-[#4A90E2] hover:bg-[#3a7bc8] transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-[#4A90E2]/30"
                    >
                        Start Your Free Trial
                    </Link>
                    <p className="text-[#A0A0B0] text-sm mt-4">
                        No credit card required. 14-day free trial.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Landing;