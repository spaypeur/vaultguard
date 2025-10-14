import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
  DocumentCheckIcon,
  Cog6ToothIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../stores/authStore';

export default function Layout() {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  // Define navigation items with role-based access
  const getNavigationItems = () => {
    const baseNavigation = [
      { name: 'Dashboard', href: '/', icon: HomeIcon, roles: ['client', 'advisor', 'admin', 'family_member', 'auditor'] },
      { name: 'Portfolio', href: '/portfolio', icon: BriefcaseIcon, roles: ['client', 'advisor', 'admin', 'family_member'] },
      { name: 'Threats', href: '/threats', icon: ShieldCheckIcon, roles: ['client', 'advisor', 'admin', 'auditor'] },
      { name: 'Compliance', href: '/compliance', icon: DocumentCheckIcon, roles: ['client', 'advisor', 'admin', 'auditor'] },
    ];

    const advancedNavigation = [
      { name: 'Tax Reports', href: '/tax-report', icon: DocumentTextIcon, roles: ['client'] },
      { name: 'Expert Recovery', href: '/expert-recovery', icon: WrenchScrewdriverIcon, roles: ['client', 'advisor'] },
    ];

    // const adminNavigation = [
    //   { name: 'Admin Panel', href: '/admin', icon: UserGroupIcon, roles: ['admin'] },
    // ];

    const settingsNavigation = [
      { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, roles: ['client', 'advisor', 'admin', 'family_member', 'auditor'] },
    ];

    let navigation = [...baseNavigation];

    // Add advanced services for clients
    if (user?.role === 'client') {
      navigation = [...navigation, ...advancedNavigation];
    }

    // Add admin panel for admins (removed - using source code instead)
    // if (user?.role === 'admin') {
    //   navigation = [...navigation, ...advancedNavigation, ...adminNavigation];
    // }

    // Add advisors access to advanced services
    if (user?.role === 'advisor') {
      navigation = [...navigation, ...advancedNavigation];
    }

    // Add settings last
    navigation = [...navigation, ...settingsNavigation];

    // Filter navigation based on user role
    return navigation.filter(item => item.roles.includes(user?.role || ''));
  };

  const navigation = getNavigationItems();

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gray-900 border-r border-gray-800">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-gray-800">
            <ShieldCheckIcon className="w-8 h-8 text-cyan-500" />
            <span className="ml-3 text-xl font-bold text-white">VaultGuard</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-cyan-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}