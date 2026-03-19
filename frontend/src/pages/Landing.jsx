// import React from 'react';
// import { Link } from 'react-router-dom';
// import { Calendar, Users, Ticket, Star, ArrowRight, Check } from 'lucide-react';
// import { Button } from '@/components/ui/button';

// export default function Landing() {
//     const features = [
//         {
//             icon: Calendar,
//             title: 'Easy Event Creation',
//             description: 'Create and manage events with rich details, categories, and banner images',
//         },
//         {
//             icon: Users,
//             title: 'Smart Registration',
//             description: 'Real-time seat tracking with automatic availability updates',
//         },
//         {
//             icon: Ticket,
//             title: 'QR Code Tickets',
//             description: 'Digital tickets with unique QR codes for seamless event entry',
//         },
//         {
//             icon: Star,
//             title: 'Ratings & Feedback',
//             description: 'Collect valuable feedback to improve your future events',
//         },
//     ];

//     return (
//         <div className="min-h-screen bg-white" data-testid="landing-page">
//             {/* Navbar */}
//             <nav className="fixed top-0 left-0 right-0 z-50 glass-header">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                     <div className="flex items-center justify-between h-16">
//                         <div className="flex items-center gap-2">
//                             <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
//                                 <Calendar className="w-6 h-6 text-white" />
//                             </div>
//                             <span className="text-xl font-bold text-slate-800" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
//                                 EventMaster
//                             </span>
//                         </div>
//                         <div className="flex items-center gap-4">
//                             <Link to="/login">
//                                 <Button variant="ghost" data-testid="nav-login">Sign In</Button>
//                             </Link>
//                             <Link to="/register">
//                                 <Button className="bg-blue-600 hover:bg-blue-700" data-testid="nav-register">Get Started</Button>
//                             </Link>
//                         </div>
//                     </div>
//                 </div>
//             </nav>

//             {/* Hero Section */}
//             <section className="pt-32 pb-20 px-4">
//                 <div className="max-w-7xl mx-auto">
//                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
//                         <div className="animate-fadeIn">
//                             <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
//                                 Event Management Made Simple
//                             </span>
//                             <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-6" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
//                                 Create, Manage & Track Events{' '}
//                                 <span className="text-blue-600">Effortlessly</span>
//                             </h1>
//                             <p className="text-lg text-slate-600 mb-8 leading-relaxed">
//                                 The all-in-one platform for event organizers and attendees. 
//                                 Create memorable events, manage registrations with real-time seat tracking, 
//                                 and deliver digital QR tickets seamlessly.
//                             </p>
//                             <div className="flex flex-wrap gap-4">
//                                 <Link to="/register">
//                                     <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8" data-testid="hero-get-started">
//                                         Get Started Free
//                                         <ArrowRight className="w-5 h-5 ml-2" />
//                                     </Button>
//                                 </Link>
//                                 <Link to="/login">
//                                     <Button size="lg" variant="outline" className="text-lg px-8" data-testid="hero-sign-in">
//                                         Sign In
//                                     </Button>
//                                 </Link>
//                             </div>
//                         </div>
//                         <div className="relative animate-fadeIn stagger-1">
//                             <div className="relative z-10">
//                                 <img
//                                     src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop"
//                                     alt="Event conference"
//                                     className="rounded-2xl shadow-2xl"
//                                 />
//                             </div>
//                             <div className="absolute -bottom-6 -left-6 w-64 bg-white rounded-xl shadow-lg p-4 z-20 animate-fadeIn stagger-2">
//                                 <div className="flex items-center gap-3">
//                                     <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
//                                         <Check className="w-6 h-6 text-green-600" />
//                                     </div>
//                                     <div>
//                                         <p className="text-sm text-slate-500">Registration</p>
//                                         <p className="font-semibold text-slate-800">Successfully Confirmed!</p>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </section>

//             {/* Features Section */}
//             <section className="py-20 bg-slate-50">
//                 <div className="max-w-7xl mx-auto px-4">
//                     <div className="text-center mb-16">
//                         <h2 className="text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
//                             Everything You Need
//                         </h2>
//                         <p className="text-lg text-slate-600 max-w-2xl mx-auto">
//                             Powerful features to help you manage events from start to finish
//                         </p>
//                     </div>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                         {features.map((feature, index) => (
//                             <div
//                                 key={feature.title}
//                                 className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 animate-fadeIn"
//                                 style={{ animationDelay: `${index * 0.1}s` }}
//                             >
//                                 <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
//                                     <feature.icon className="w-6 h-6 text-blue-600" />
//                                 </div>
//                                 <h3 className="text-lg font-semibold text-slate-800 mb-2" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
//                                     {feature.title}
//                                 </h3>
//                                 <p className="text-slate-600 text-sm">{feature.description}</p>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </section>

//             {/* CTA Section */}
//             <section className="py-20">
//                 <div className="max-w-4xl mx-auto px-4 text-center">
//                     <h2 className="text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
//                         Ready to Get Started?
//                     </h2>
//                     <p className="text-lg text-slate-600 mb-8">
//                         Join thousands of event organizers who trust EventMaster to manage their events
//                     </p>
//                     <Link to="/register">
//                         <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-10" data-testid="cta-get-started">
//                             Create Your First Event
//                             <ArrowRight className="w-5 h-5 ml-2" />
//                         </Button>
//                     </Link>
//                 </div>
//             </section>

//             {/* Footer */}
//             <footer className="bg-slate-900 text-slate-400 py-12">
//                 <div className="max-w-7xl mx-auto px-4">
//                     <div className="flex flex-col md:flex-row items-center justify-between">
//                         <div className="flex items-center gap-2 mb-4 md:mb-0">
//                             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
//                                 <Calendar className="w-5 h-5 text-white" />
//                             </div>
//                             <span className="text-white font-bold" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
//                                 EventMaster
//                             </span>
//                         </div>
//                         <p className="text-sm">© 2024 EventMaster. All rights reserved.</p>
//                     </div>
//                 </div>
//             </footer>
//         </div>
//     );
// }


import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Ticket, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Landing() {

    const features = [
        {
            icon: Calendar,
            title: 'Easy Event Creation',
            description: 'Create and manage events with rich details, categories, and banner images',
        },
        {
            icon: Users,
            title: 'Smart Registration',
            description: 'Real-time seat tracking with automatic availability updates',
        },
        {
            icon: Ticket,
            title: 'QR Code Tickets',
            description: 'Digital tickets with unique QR codes for seamless event entry',
        },
        {
            icon: Star,
            title: 'Ratings & Feedback',
            description: 'Collect valuable feedback to improve your future events',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f0a1f] via-[#1a0f2e] to-[#0f0a1f] text-white">

            {/* NAVBAR */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">

                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Calendar className="text-white w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold tracking-wide font-[Poppins]">
                            EventNexus
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/login">
                            <Button variant="ghost" className="text-white hover:bg-white/10">
                                Sign In
                            </Button>
                        </Link>
                        <Link to="/register">
                            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90">
                                Get Started
                            </Button>
                        </Link>
                    </div>

                </div>
            </nav>

            {/* HERO */}
            <section className="pt-44 pb-28 px-4 text-center">

                <div className="max-w-5xl mx-auto animate-fadeIn">

                    <span className="px-5 py-2 bg-white/10 backdrop-blur-md text-gray-300 rounded-full text-sm font-[Inter]">
                        ● The new standard for event management
                    </span>

                    <h1 className="text-7xl md:text-9xl font-black leading-tight mt-10 mb-6 tracking-tight font-[Poppins]">
                        Experience Events <br />

                        <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent animate-gradient font-[Poppins]">
                            Like Never Before
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto font-[Inter]">
                        Discover extraordinary experiences, connect with like-minded people,
                        and organize unforgettable events—all on one stunning platform.
                    </p>

                    <div className="flex justify-center gap-4">
                        <Link to="/register">
                            <Button size="lg" className="bg-gradient-to-r from-pink-500 to-purple-600 px-12 py-6 text-lg hover:scale-105 transition duration-300">
                                Explore Events
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                    </div>

                </div>

            </section>

            {/* FEATURES */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4">

                    <div className="text-center mb-20">
                        <h2 className="text-5xl md:text-6xl font-bold mb-4 font-[Poppins]">
                            Features
                        </h2>
                        <p className="text-slate-400 text-lg font-[Inter]">
                            Everything you need to run events smoothly
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, i) => (
                            <div
                                key={i}
                                className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl hover:scale-105 hover:shadow-2xl transition duration-300"
                            >
                                <div className="w-14 h-14 bg-pink-500/20 rounded-xl flex items-center justify-center mb-5">
                                    <feature.icon className="text-pink-400 w-6 h-6" />
                                </div>

                                <h3 className="text-lg font-semibold mb-2 font-[Poppins]">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-slate-400 font-[Inter]">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>

                </div>
            </section>

            {/* CTA */}
            <section className="py-24 text-center">
                <h2 className="text-5xl md:text-6xl font-bold mb-4 font-[Poppins]">
                    Start Managing Events Today
                </h2>

                <p className="text-slate-400 mb-10 text-lg font-[Inter]">
                    Join EventNexus and build smarter events
                </p>

                <Link to="/register">
                    <Button size="lg" className="bg-gradient-to-r from-pink-500 to-purple-600 px-12 py-6 text-lg hover:scale-105 transition">
                        Create Event
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                </Link>
            </section>

            {/* FOOTER */}
            <footer className="bg-white/5 backdrop-blur-xl border-t border-white/10 py-12 text-slate-400">
                <div className="max-w-7xl mx-auto px-4 flex justify-between items-center flex-col md:flex-row">

                    <div className="flex items-center gap-2 mb-4 md:mb-0">
                        <div className="w-8 h-8 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Calendar className="text-white w-5 h-5" />
                        </div>
                        <span className="text-white font-semibold font-[Poppins]">
                            EventNexus
                        </span>
                    </div>

                    <p className="text-sm font-[Inter]">
                        © {new Date().getFullYear()} EventNexus. All rights reserved.
                    </p>

                </div>
            </footer>

            {/* ANIMATIONS */}
            <style>
                {`
                .animate-fadeIn {
                    animation: fadeIn 1s ease-in-out;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-gradient {
                    background-size: 200% auto;
                    animation: gradientMove 3s linear infinite;
                }

                @keyframes gradientMove {
                    0% {
                        background-position: 0% center;
                    }
                    100% {
                        background-position: 200% center;
                    }
                }
                `}
            </style>

        </div>
    );
}