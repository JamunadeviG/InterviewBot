import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import type { InterviewSession, Message } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Mic, Send, Bot, User, StopCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function InterviewPage() {
    const [session, setSession] = useState<InterviewSession | null>(null);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Start interview on mount
        async function startInterview() {
            // Mock role, ideally passed from previous selection
            const newSession = await api.interview.start("Software Engineer");
            setSession(newSession);
        }
        startInterview();
    }, []);

    useEffect(() => {
        // Auto scroll to bottom
        if (scrollRef.current) {
            // Find the viewport inside scroll area which actually scrolls
            const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }
    }, [session?.messages]);

    const handleSend = async () => {
        if (!input.trim() || !session) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            sender: "user",
            text: input,
            timestamp: new Date().toISOString(),
        };

        setSession((prev) =>
            prev ? { ...prev, messages: [...prev.messages, userMsg] } : null
        );
        setInput("");
        setIsLoading(true);

        try {
            const botResponse = await api.interview.answer();
            setSession((prev) =>
                prev ? { ...prev, messages: [...prev.messages, botResponse] } : null
            );
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleRecording = () => {
        setIsRecording(!isRecording);
        // Visual mock only
        if (!isRecording) {
            setTimeout(() => {
                setInput("I believe the time complexity is O(n log n) because...");
                setIsRecording(false);
            }, 2000);
        }
    };

    const endInterview = () => {
        navigate("/evaluation");
    };

    if (!session) {
        return (
            <div className="container py-20 flex justify-center">
                <div className="animate-pulse space-y-4">
                    <div className="h-12 w-48 bg-secondary rounded"></div>
                    <div className="h-64 w-96 bg-secondary rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <PageWrapper className="container py-6 h-[calc(100vh-4rem)] flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Bot className="h-6 w-6 text-primary" />
                        AI Interviewer
                    </h1>
                    <p className="text-sm text-muted-foreground">{session.role} Interview</p>
                </div>
                <div className="flex items-center gap-4">
                    <Badge variant="outline" className="px-3 py-1 text-sm">
                        Question {session.step} / {session.totalSteps}
                    </Badge>
                    <Button variant="destructive" size="sm" onClick={endInterview}>
                        End Interview
                    </Button>
                </div>
            </div>

            {/* Chat Area */}
            <Card className="flex-1 overflow-hidden flex flex-col p-0">
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                    <div className="space-y-4">
                        {session.messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={cn(
                                    "flex gap-3 max-w-[80%]",
                                    msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                                )}
                            >
                                <div
                                    className={cn(
                                        "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                                        msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                                    )}
                                >
                                    {msg.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                </div>
                                <div
                                    className={cn(
                                        "rounded-lg px-4 py-2 text-sm",
                                        msg.sender === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted"
                                    )}
                                >
                                    {msg.text}
                                    <div className="text-[10px] opacity-70 mt-1 text-right">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3 max-w-[80%] mr-auto">
                                <div className="h-8 w-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shrink-0">
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div className="bg-muted rounded-lg px-4 py-2 text-sm flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 border-t bg-background/50 backdrop-blur-sm flex gap-2">
                    <Button
                        size="icon"
                        variant={isRecording ? "destructive" : "outline"}
                        onClick={toggleRecording}
                        className={cn("shrink-0 transition-all", isRecording && "animate-pulse Scale-110")}
                    >
                        {isRecording ? <StopCircle className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </Button>
                    <Input
                        placeholder="Type your answer..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        disabled={isLoading}
                        className="flex-1"
                        autoFocus
                    />
                    <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="icon">
                        <Send className="h-5 w-5" />
                    </Button>
                </div>
            </Card>
        </PageWrapper>
    );
}
