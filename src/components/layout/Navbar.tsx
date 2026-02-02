import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bot, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const isLoggedIn = true; // TODO: Mock auth state

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Roadmap", href: "/roadmap" },
        { name: "Interview", href: "/interview" },
        { name: "Evaluation", href: "/evaluation" },
        { name: "Login", href: "/login" },
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
                        <Button variant="ghost" size="sm" className="gap-2">
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" asChild>
                                <Link to="/login">Login</Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link to="/signup">Signup</Link>
                            </Button>
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
                                        asChild
                                    >
                                        <Link to="/login" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                                    </Button>
                                    <Button
                                        className="w-full justify-start"
                                        asChild
                                    >
                                        <Link to="/signup" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
}
