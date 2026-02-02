import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Bot, Map, MessageSquare, Mic, TrendingUp } from "lucide-react";

export default function HomePage() {
    const features = [
        {
            title: "Role-Specific Roadmaps",
            description: "Structured learning paths for Software Engineers, Data Analysts, and ML Engineers.",
            icon: Map,
        },
        {
            title: "AI Mock Interviews",
            description: "Practice with our intelligent chatbot that simulates real interview scenarios.",
            icon: MessageSquare,
        },
        {
            title: "Voice Integration",
            description: "Speak naturally to the AI interviewer for a realistic experience.",
            icon: Mic,
        },
        {
            title: "Detailed Evaluation",
            description: "Get comprehensive feedback on your technical and soft skills.",
            icon: TrendingUp,
        },
    ];

    return (
        <PageWrapper>
            {/* Hero Section */}
            <section className="container flex flex-col items-center justify-center space-y-8 py-24 text-center md:py-32">
                <div className="space-y-4 max-w-3xl">
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        Master Your Next Tech Interview
                    </h1>
                    <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                        Prepare with AI-driven mock interviews, personalized roadmaps, and detailed performance analysis.
                    </p>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row">
                    <Button size="lg" className="px-8" asChild>
                        <Link to="/interview">Start Interview</Link>
                    </Button>
                    <Button size="lg" variant="outline" className="px-8" asChild>
                        <Link to="/roadmap">View Roadmap</Link>
                    </Button>
                </div>
            </section>

            {/* Features Section */}
            <section className="container py-12 md:py-24 lg:py-32 bg-secondary/20 rounded-t-3xl border-t">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature, index) => (
                        <Card key={index} className="border-none shadow-none bg-background/60 backdrop-blur-sm">
                            <CardHeader>
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                    <feature.icon className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle>{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-base">
                                    {feature.description}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="container py-24 text-center">
                <div className="relative rounded-3xl bg-primary px-6 py-16 md:px-12 overflow-hidden">
                    <div className="relative z-10 mx-auto max-w-2xl space-y-6 text-primary-foreground">
                        <h2 className="text-3xl font-bold sm:text-4xl">Ready to Ace Your Interview?</h2>
                        <p className="text-primary-foreground/80 text-lg">
                            Join thousands of developers who have landed their dream jobs using InterviewBot.
                        </p>
                        <Button size="lg" variant="secondary" asChild className="font-semibold">
                            <Link to="/signup">Get Started for Free</Link>
                        </Button>
                    </div>
                    <Bot className="absolute -bottom-12 -right-12 h-64 w-64 opacity-10 text-primary-foreground rotate-12" />
                </div>
            </section>
        </PageWrapper>
    );
}
