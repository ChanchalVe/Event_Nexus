// import React from 'react';
// import { NavLink, useNavigate } from 'react-router-dom';
// import { useAuth } from '@/context/AuthContext';
// import { 
//     Calendar, 
//     LayoutDashboard, 
//     Ticket, 
//     PlusCircle, 
//     BarChart3, 
//     Bell, 
//     LogOut, 
//     User,
//     Home
// } from 'lucide-react';
// import { Button } from '@/components/ui/button';

// export const Sidebar = () => {
//     const { user, logout } = useAuth();
//     const navigate = useNavigate();
//     const isOrganizer = user?.role === 'organizer';

//     const handleLogout = () => {
//         logout();
//         navigate('/login');
//     };

//     const userLinks = [
//         { to: '/dashboard', icon: LayoutDashboard, label: 'Browse Events' },
//         { to: '/my-tickets', icon: Ticket, label: 'My Tickets' },
//         { to: '/notifications', icon: Bell, label: 'Notifications' },
//     ];

//     const organizerLinks = [
//         { to: '/dashboard', icon: LayoutDashboard, label: 'Browse Events' },
//         { to: '/organizer/events', icon: Calendar, label: 'My Events' },
//         { to: '/organizer/create', icon: PlusCircle, label: 'Create Event' },
//         { to: '/organizer/analytics', icon: BarChart3, label: 'Analytics' },
//         { to: '/notifications', icon: Bell, label: 'Notifications' },
//     ];

//     const links = isOrganizer ? organizerLinks : userLinks;

//     return (
//         <aside className="sidebar" data-testid="sidebar">
//             <div className="p-6 border-b border-slate-200">
//                 <NavLink to="/" className="flex items-center gap-2">
//                     <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
//                         <Calendar className="w-6 h-6 text-white" />
//                     </div>
//                     <span className="text-xl font-bold text-slate-800" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
//                         EventMaster
//                     </span>
//                 </NavLink>
//             </div>

//             <nav className="p-4 space-y-1">
//                 {links.map((link) => (
//                     <NavLink
//                         key={link.to}
//                         to={link.to}
//                         className={({ isActive }) =>
//                             `sidebar-link ${isActive ? 'active' : ''}`
//                         }
//                         data-testid={`nav-${link.label.toLowerCase().replace(/\s/g, '-')}`}
//                     >
//                         <link.icon className="w-5 h-5" />
//                         <span>{link.label}</span>
//                     </NavLink>
//                 ))}
//             </nav>

//             <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-white">
//                 <div className="flex items-center gap-3 px-4 py-3 mb-2">
//                     <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
//                         <User className="w-5 h-5 text-blue-600" />
//                     </div>
//                     <div className="flex-1 min-w-0">
//                         <p className="text-sm font-medium text-slate-800 truncate">{user?.name}</p>
//                         <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
//                     </div>
//                 </div>
//                 <Button
//                     variant="ghost"
//                     className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50"
//                     onClick={handleLogout}
//                     data-testid="logout-btn"
//                 >
//                     <LogOut className="w-5 h-5 mr-3" />
//                     Logout
//                 </Button>
//             </div>
//         </aside>
//     );
// };

// export default Sidebar;
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
    Calendar, 
    LayoutDashboard, 
    Ticket, 
    PlusCircle, 
    BarChart3, 
    Bell, 
    LogOut, 
    User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const isOrganizer = user?.role === 'organizer';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const userLinks = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Browse Events' },
        { to: '/my-tickets', icon: Ticket, label: 'My Tickets' },
        { to: '/notifications', icon: Bell, label: 'Notifications' },
    ];

    const organizerLinks = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Browse Events' },
        { to: '/organizer/events', icon: Calendar, label: 'My Events' },
        { to: '/organizer/create', icon: PlusCircle, label: 'Create Event' },
        { to: '/organizer/analytics', icon: BarChart3, label: 'Analytics' },
        { to: '/notifications', icon: Bell, label: 'Notifications' },
    ];

    const links = isOrganizer ? organizerLinks : userLinks;

    return (
        <aside className="sidebar" data-testid="sidebar">
            {/* Logo */}
            <div style={{
                padding: '24px',
                borderBottom: '1px solid rgba(139, 92, 246, 0.15)',
            }}>
                <NavLink to="/" className="flex items-center gap-3" style={{ textDecoration: 'none' }}>
                    <div style={{
                        width: 40,
                        height: 40,
                        background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 16px rgba(139, 92, 246, 0.4)',
                    }}>
                        <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <span style={{
                        fontFamily: 'Barlow Condensed, sans-serif',
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: '#f0eeff',
                        letterSpacing: '0.02em',
                    }}>
                        EventMaster
                    </span>
                </NavLink>
            </div>

            {/* Nav links */}
            <nav style={{ padding: '16px 0', flex: 1 }}>
                <p style={{
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    color: 'var(--text-muted)',
                    padding: '0 20px 8px',
                    textTransform: 'uppercase',
                }}>
                    Navigation
                </p>
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        data-testid={`nav-${link.label.toLowerCase().replace(/\s/g, '-')}`}
                    >
                        <link.icon className="w-4 h-4" style={{ flexShrink: 0 }} />
                        <span>{link.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* User section */}
            <div style={{
                padding: '16px',
                borderTop: '1px solid rgba(139, 92, 246, 0.15)',
                background: 'rgba(0,0,0,0.15)',
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: 'rgba(139, 92, 246, 0.08)',
                    marginBottom: 8,
                }}>
                    <div style={{
                        width: 36,
                        height: 36,
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(236,72,153,0.3))',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(139,92,246,0.3)',
                        flexShrink: 0,
                    }}>
                        <User className="w-4 h-4" style={{ color: 'var(--purple-bright)' }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <p style={{
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}>{user?.name}</p>
                        <p style={{
                            fontSize: '0.7rem',
                            color: 'var(--text-muted)',
                            textTransform: 'capitalize',
                        }}>{user?.role}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    data-testid="logout-btn"
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--text-muted)',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(248,113,113,0.1)';
                        e.currentTarget.style.color = '#f87171';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-muted)';
                    }}
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;