import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const hiddenPaths = ["/", "/login", "/signup"];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (hiddenPaths.includes(router.pathname)) {
    return null;
  }

  const navLinks = [
    { href: "/schedule", label: "Schedule", roles: ["worker", "admin", "root"] },
    { href: "/clientprofile", label: "Client Profiles", roles: ["admin", "root"] },
    { href: "/workermanagement", label: "Worker Management", roles: ["admin", "root"] },
    { href: "/payrolls", label: "Manage Payrolls Requests", roles: ["admin", "root"] },
    { href: "/managetasks", label: "Manage Tasks", roles: ["admin", "root"] },
    { href: "/profile", label: "Profile", roles: ["admin", "worker"] },
    { href: "/workermc", label: "Manage Leaves", roles: [ "worker"] },
    { href: "/manageAdmins", label: "Manage Admins", roles: [ "root"] },
  ];

  const filteredNavLinks = navLinks.filter((link) =>
    link.roles.includes(user?.role || "")
  );

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard">
                <Image
                  src="/logo.png"
                  alt="fraser"
                  width={40}
                  height={40}
                  className="h-10 w-auto"
                />
              </Link>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {filteredNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden md:ml-6 md:flex md:items-center">
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-1">
            {filteredNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              >
                {link.label}
              </Link>
            ))}
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
