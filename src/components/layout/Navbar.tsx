import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bot, LogOut, Menu, User, Settings, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { AuthModal } from "./AuthModal";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    // Auth State
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authTab, setAuthTab] = useState<"login" | "signup">("login");

    const openAuth = (tab: "login" | "signup") => {
        setAuthTab(tab);
        setShowAuthModal(true);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
    };

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Roadmap", href: "/roadmap" },
        { name: "Interview", href: "/interview/upload" },
        { name: "Evaluation", href: "/evaluation" },
        { name: "Contact", href: "/contact" },
    ];

    return (
        <>
            <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
                            <Bot className="h-6 w-6 text-primary" />
                            <span>InterviewBot</span>
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                to={link.href}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-primary",
                                    location.pathname === link.href
                                        ? "text-primary"
                                        : "text-muted-foreground"
                                )}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        {isLoggedIn ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src="/avatars/01.png" alt="@user" />
                                            <AvatarFallback>AD</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">Alex Dev</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                alex@example.com
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <LayoutDashboard className="mr-2 h-4 w-4" />
                                        <span>Dashboard</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="flex gap-2">
                                <Button variant="ghost" onClick={() => openAuth("login")}>
                                    Sign In
                                </Button>
                                <Button onClick={() => openAuth("signup")}>Sign Up</Button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>

                {/* Mobile Nav */}
                {isMenuOpen && (
                    <div className="md:hidden border-t p-4 space-y-4 bg-background">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                to={link.href}
                                className={cn(
                                    "block text-sm font-medium transition-colors hover:text-primary",
                                    location.pathname === link.href
                                        ? "text-primary"
                                        : "text-muted-foreground"
                                )}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="pt-4 border-t">
                            {isLoggedIn ? (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start gap-2 text-red-500"
                                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </Button>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start"
                                        onClick={() => { openAuth("login"); setIsMenuOpen(false); }}
                                    >
                                        Sign In
                                    </Button>
                                    <Button
                                        className="w-full justify-start"
                                        onClick={() => { openAuth("signup"); setIsMenuOpen(false); }}
                                    >
                                        Sign Up
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                defaultTab={authTab}
                onLoginSuccess={() => setIsLoggedIn(true)}
            />
        </>
    );
}
