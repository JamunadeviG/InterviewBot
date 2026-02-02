<<<<<<< HEAD
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { api } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await api.auth.login(email, password);
      const user = data.user;

      // 🔥 Save user globally
      localStorage.setItem("user", JSON.stringify(user));

      // user.id is your userId
      console.log("Logged in userId:", user.id);

      navigate(`/roadmap/${user.id}`);
    } catch (error: any) {
      alert(error.message);
      console.error("Login failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center py-20 min-h-[calc(100vh-4rem)]">
      <PageWrapper className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your email and password to access your account.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
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
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>

              <div className="text-center text-sm">
                Don't have an account?{" "}
                <Link to="/signup" className="underline text-primary">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </PageWrapper>
    </div>
  );
}
=======
import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, KeyRound, Mail, Lock, ShieldCheck } from 'lucide-react';
import { api } from '@/services/api';

const LoginPage = () => {
    const location = useLocation();
    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const signupMessage = (location.state as any)?.message;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await api.login(credentials);
            navigate('/interview/upload');
        } catch (err: any) {
            setError(err.message || 'Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-md py-12 px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="shadow-2xl border-primary/10">
                    <CardHeader className="text-center space-y-1">
                        <div className="mx-auto bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center mb-2">
                            <KeyRound className="text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                        <CardDescription>
                            Enter your credentials to access your dashboard.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {signupMessage && (
                            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm text-center">
                                {signupMessage}
                            </div>
                        )}
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        className="pl-10"
                                        placeholder="name@example.com"
                                        required
                                        value={credentials.email}
                                        onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <Link to="#" className="text-sm text-primary hover:underline">Forgot password?</Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        className="pl-10"
                                        required
                                        value={credentials.password}
                                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex gap-2">
                                    <ShieldCheck className="h-4 w-4 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? <Loader2 className="animate-spin" /> : 'Secure Login'}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center flex-col gap-2">
                        <p className="text-sm text-muted-foreground">
                            New to InterviewBot? <Link to="/signup" className="text-primary hover:underline font-medium">Create account</Link>
                        </p>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
};

export default LoginPage;
>>>>>>> b99cfa8efe1765988d2c04740ec6b97308feb9aa
