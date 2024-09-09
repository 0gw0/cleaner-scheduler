import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from "@/components/ui/button";
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const hiddenPaths = ['/', '/login', '/signup'];

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userType'); 
    router.push('/login');
    router.push('/login').then(() => {
      if (router.pathname !== '/login') {
        window.location.href = '/login';
      }
    });
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (hiddenPaths.includes(router.pathname)) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/homepage">
                <span className="text-xl font-bold">Logo</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                  href="/schedule"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Schedule
              </Link>
              <Link
                href="/clientprofile"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Client Profile
              </Link>
              <Link
                href="/workerprofile"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Worker Profile
              </Link>
              <Link
                href="/payroll"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Payroll
              </Link>
              <Link
                href="/settings"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Settings
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
          <div className="sm:hidden flex items-center">
            <button onClick={toggleMenu} className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="sm:hidden py-4 space-y-1">
            <Link
              href="/schedule"
              className="block px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              Schedule
            </Link>
            <Link
              href="/clientprofile"
              className="block px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              Client Profile
            </Link>
            <Link
              href="/workerprofile"
              className="block px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              Worker Profile
            </Link>
            <Link
              href="/payroll"
              className="block px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              Payroll
            </Link>
            <Link
              href="/settings"
              className="block px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              Settings
            </Link>
            <div className="px-4 py-2">
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;