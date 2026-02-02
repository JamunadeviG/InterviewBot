import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import type { Role } from "@/lib/types";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultTab?: "login" | "signup";
    onLoginSuccess: () => void;
}

export function AuthModal({
    isOpen,
    onClose,
    defaultTab = "login",
    onLoginSuccess,
}: AuthModalProps) {
    const [mode, setMode] = useState<"login" | "signup">(defaultTab);
    const [isLoading, setIsLoading] = useState(false);

    // Form States
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState<Role>("Software Engineer");

    // Reset form when opening/switching
    const switchMode = (newMode: "login" | "signup") => {
        setMode(newMode);
        setEmail("");
        setPassword("");
        setName("");
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.auth.login(email, password);
            onLoginSuccess();
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.auth.signup({ name, email, password, role });
            onLoginSuccess();
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl text-center">
                        {mode === "login" ? "Welcome Back" : "Create Account"}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {mode === "login"
                            ? "Enter your credentials to access your account."
                            : "Join InterviewBot to start your preparation journey."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="space-y-4">
                    {mode === "signup" && (
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {mode === "signup" && (
                        <div className="space-y-2">
                            <Label htmlFor="role">Target Role</Label>
                            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                                <SelectTrigger id="role">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Software Engineer">
                                        Software Engineer
                                    </SelectItem>
                                    <SelectItem value="Data Analyst">Data Analyst</SelectItem>
                                    <SelectItem value="ML Engineer">ML Engineer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading
                            ? mode === "login"
                                ? "Signing in..."
                                : "Creating account..."
                            : mode === "login"
                                ? "Sign In"
                                : "Sign Up"}
                    </Button>
                </form>

                <div className="mt-4 text-center text-sm">
                    {mode === "login" ? (
                        <p>
                            Don't have an account?{" "}
                            <button
                                type="button"
                                onClick={() => switchMode("signup")}
                                className="font-medium text-primary hover:underline"
                            >
                                Sign Up
                            </button>
                        </p>
                    ) : (
                        <p>
                            Already have an account?{" "}
                            <button
                                type="button"
                                onClick={() => switchMode("login")}
                                className="font-medium text-primary hover:underline"
                            >
                                Sign In
                            </button>
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
