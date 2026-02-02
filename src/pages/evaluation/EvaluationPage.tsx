import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import type { Evaluation } from "@/lib/types";
import { PageWrapper } from "@/components/layout/PageWrapper";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
} from "recharts";
import { Check, X, Lightbulb } from "lucide-react";

export default function EvaluationPage() {
    const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchEvaluation() {
            // Mock ID usage
            try {
                const data = await api.evaluation.get("int1");
                setEvaluation(data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchEvaluation();
    }, []);

    if (isLoading) {
        return <div className="container py-20 text-center">Loading evaluation...</div>;
    }

    if (!evaluation) return <div>Failed to load</div>;

    const chartData = [
        { subject: 'Technical', A: evaluation.breakdown.technical, fullMark: 100 },
        { subject: 'Communication', A: evaluation.breakdown.communication, fullMark: 100 },
        { subject: 'Problem Solving', A: evaluation.breakdown.problemSolving, fullMark: 100 },
        { subject: 'Confidence', A: evaluation.breakdown.confidence, fullMark: 100 },
    ];

    return (
        <PageWrapper className="container py-10 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Interview Performance</h1>
                    <p className="text-muted-foreground">Detailed analysis of your recent session.</p>
                </div>
                <Button asChild>
                    <Link to="/interview/upload">Practise Again</Link>
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Overall Score */}
                <Card>
                    <CardHeader>
                        <CardTitle>Overall Score</CardTitle>
                        <CardDescription>Your aggregated performance score.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-6">
                        <div className="relative flex items-center justify-center">
                            <svg className="h-40 w-40 -rotate-90" viewBox="0 0 100 100">
                                <circle
                                    className="text-muted stroke-current"
                                    strokeWidth="10"
                                    fill="transparent"
                                    r="40"
                                    cx="50"
                                    cy="50"
                                />
                                <circle
                                    className="text-primary stroke-current transition-all duration-1000 ease-out"
                                    strokeWidth="10"
                                    strokeDasharray={`${2 * Math.PI * 40}`}
                                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - evaluation.overallScore / 100)}`}
                                    strokeLinecap="round"
                                    fill="transparent"
                                    r="40"
                                    cx="50"
                                    cy="50"
                                />
                            </svg>
                            <div className="absolute text-4xl font-bold">{evaluation.overallScore}</div>
                        </div>
                        <p className="mt-4 text-center text-muted-foreground">
                            Great job! You are in the top 15% of candidates.
                        </p>
                    </CardContent>
                </Card>

                {/* Radar Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Skill Breakdown</CardTitle>
                        <CardDescription>Analysis across key competency areas.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                                <PolarGrid className="stroke-muted" />
                                <PolarAngleAxis dataKey="subject" className="text-sm font-medium" />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name="Score"
                                    dataKey="A"
                                    stroke="hsl(var(--primary))"
                                    fill="hsl(var(--primary))"
                                    fillOpacity={0.5}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Feedback Sections */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                            <Check className="h-5 w-5" /> Strengths
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {evaluation.feedback.strengths.map((str, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                                    {str}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                <Card className="bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                            <X className="h-5 w-5" /> Areas to Improve
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {evaluation.feedback.weaknesses.map((weak, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                                    {weak}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                            <Lightbulb className="h-5 w-5" /> Detailed Suggestions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {evaluation.feedback.suggestions.map((sug, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                                    {sug}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </PageWrapper>
    );
}
