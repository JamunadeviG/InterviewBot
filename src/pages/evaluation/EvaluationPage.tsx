import { useLocation, useNavigate } from "react-router-dom";
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
import { Check, Lightbulb, Trophy, FileText, Loader2, ArrowRight, Star, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { motion } from "framer-motion";

interface EvalScore {
    technical_accuracy: number;
    depth_of_knowledge: number;
    communication_clarity: number;
    practical_understanding: number;
    completeness: number;
}

interface EvaluationResult {
    question: string;
    answer: string;
    overall_score: number;
    scores: EvalScore;
    strengths: string[];
    areas_for_improvement: string[];
    feedback: string;
    follow_up_question?: string;
}

interface Profile {
    role: string;
    experienceLevel: string;
    skills: string[];
}

interface ReportData {
    overall_summary: string;
    overall_rating: number;
    strengths: Array<{ area: string; description: string; example: string }>;
    improvements: Array<{ area: string; description: string; suggestion: string }>;
    skill_breakdown: Array<{ skill: string; score: number; assessment: string }>;
    recommendation: string;
    rationale: string;
    next_steps: string[];
    interviewer_notes?: string;
}

export default function EvaluationPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const evaluations = location.state?.evaluations as EvaluationResult[] | undefined;
    const profile = location.state?.profile as Profile | undefined;

    const [report, setReport] = useState<ReportData | null>(null);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);

    useEffect(() => {
        if (!evaluations) {
            navigate('/interview/upload');
        }
    }, [evaluations, navigate]);

    if (!evaluations) return null;

    // Calculate aggregated scores for summary
    const count = evaluations.length;
    const avgScore = Math.round(evaluations.reduce((acc: number, curr: EvaluationResult) => acc + curr.overall_score, 0) / count);

    const handleGenerateReport = async () => {
        try {
            setIsGeneratingReport(true);
            const reportData = await api.generateReport({
                candidate_name: "User",
                position: profile?.role || "Software Engineer",
                interview_date: new Date().toLocaleDateString(),
                skills: profile?.skills.join(', '),
                experience_level: profile?.experienceLevel,
                total_questions: count,
                average_scores: JSON.stringify({
                    overall: avgScore,
                    technical: evaluations.reduce((acc: number, e: EvaluationResult) => acc + e.scores.technical_accuracy, 0) / count,
                    communication: evaluations.reduce((acc: number, e: EvaluationResult) => acc + e.scores.communication_clarity, 0) / count,
                }),
                questions_list: evaluations.map((e: EvaluationResult) => e.question),
                answers_list: evaluations.map((e: EvaluationResult) => e.answer),
                detailed_scores: JSON.stringify(evaluations.map((e: EvaluationResult) => e.scores))
            });
            setReport(reportData);
        } catch (err) {
            console.error("Failed to generate report:", err);
        } finally {
            setIsGeneratingReport(false);
        }
    };

    const breakdown = evaluations.reduce((acc: any, curr: EvaluationResult) => ({
        technical: acc.technical + curr.scores.technical_accuracy,
        communication: acc.communication + curr.scores.communication_clarity,
        problemSolving: acc.problemSolving + curr.scores.practical_understanding,
        confidence: acc.confidence + curr.scores.depth_of_knowledge,
    }), { technical: 0, communication: 0, problemSolving: 0, confidence: 0 });

    const chartData = [
        { subject: 'Technical', A: Math.round((breakdown.technical / count) * 10), fullMark: 100 },
        { subject: 'Communication', A: Math.round((breakdown.communication / count) * 10), fullMark: 100 },
        { subject: 'Problem Solving', A: Math.round((breakdown.problemSolving / count) * 10), fullMark: 100 },
        { subject: 'Knowledge', A: Math.round((breakdown.confidence / count) * 10), fullMark: 100 },
    ];

    return (
        <PageWrapper className="container py-10 space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">Interview Performance</h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        Detailed analysis for <Badge variant="secondary">{profile?.role || 'the position'}</Badge>
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => navigate('/interview/upload')}>
                        Practise Again
                    </Button>
                    {!report && (
                        <Button onClick={handleGenerateReport} disabled={isGeneratingReport} className="gap-2">
                            {isGeneratingReport ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                            Generate Full HR Report
                        </Button>
                    )}
                </div>
            </div>

            {/* Top Summary Cards */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="relative overflow-hidden border-primary/20 shadow-lg">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Trophy size={100} />
                    </div>
                    <CardHeader>
                        <CardTitle>Overall Score</CardTitle>
                        <CardDescription>Aggregated performance metric</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-6">
                        <div className="relative flex items-center justify-center">
                            <svg className="h-40 w-40 -rotate-90" viewBox="0 0 100 100">
                                <circle className="text-muted stroke-current" strokeWidth="10" fill="transparent" r="40" cx="50" cy="50" />
                                <circle
                                    className="text-primary stroke-current transition-all duration-1000 ease-out"
                                    strokeWidth="10"
                                    strokeDasharray={`${2 * Math.PI * 40}`}
                                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - avgScore / 100)}`}
                                    strokeLinecap="round"
                                    fill="transparent"
                                    r="40"
                                    cx="50"
                                    cy="50"
                                />
                            </svg>
                            <div className="absolute text-4xl font-bold">{avgScore}</div>
                        </div>
                        <p className="mt-4 text-center font-medium">
                            {avgScore >= 80 ? "Top Talent: Ready for Hire" : avgScore >= 60 ? "Solid Candidate: Minor Improvements Needed" : "Growth Needed: Keep Practising"}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-primary/20 shadow-lg">
                    <CardHeader>
                        <CardTitle>Competency Map</CardTitle>
                        <CardDescription>Analysis across key focus areas</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                                <PolarGrid className="stroke-muted" />
                                <PolarAngleAxis dataKey="subject" className="text-sm font-medium" />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Score" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed AI Report UI - Rendered when generated */}
            {report && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <Separator />
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-8 w-1 bg-primary rounded-full" />
                        <h2 className="text-2xl font-bold">Comprehensive Report</h2>
                        <Badge variant="outline" className="ml-auto bg-green-50 text-green-700 border-green-200">
                            {report.recommendation}
                        </Badge>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="md:col-span-2 shadow-sm">
                            <CardHeader className="bg-muted/30">
                                <CardTitle className="text-lg flex items-center gap-2"><Info className="h-4 w-4" /> Performance Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{report.overall_summary}</p>
                                <div className="mt-4 pt-4 border-t italic text-sm text-primary">
                                    <strong>Interviewer Rationale:</strong> {report.rationale}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader className="bg-muted/30">
                                <CardTitle className="text-lg flex items-center gap-2"><Star className="h-4 w-4 text-yellow-500" /> Skill Assessment</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                {report.skill_breakdown.map((s, i) => (
                                    <div key={i} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">{s.skill}</span>
                                            <span>{s.score}/10</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-primary" style={{ width: `${s.score * 10}%` }} />
                                        </div>
                                        <p className="text-xs text-muted-foreground">{s.assessment}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="border-green-100 dark:border-green-900 shadow-sm">
                            <CardHeader className="bg-green-50/50 dark:bg-green-900/10">
                                <CardTitle className="text-lg text-green-700 flex items-center gap-2"><Check className="h-5 w-5" /> Executive Strengths</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                {report.strengths.map((s, i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs shrink-0">{i + 1}</div>
                                        <div>
                                            <h4 className="font-bold text-sm">{s.area}</h4>
                                            <p className="text-sm text-muted-foreground">{s.description}</p>
                                            <p className="text-xs mt-1 text-green-600 font-medium italic">Example: "{s.example}"</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="border-orange-100 dark:border-orange-900 shadow-sm">
                            <CardHeader className="bg-orange-50/50 dark:bg-orange-900/10">
                                <CardTitle className="text-lg text-orange-700 flex items-center gap-2"><Lightbulb className="h-5 w-5" /> Recommended Improvements</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                {report.improvements.map((im, i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 text-xs shrink-0">{i + 1}</div>
                                        <div>
                                            <h4 className="font-bold text-sm">{im.area}</h4>
                                            <p className="text-sm text-muted-foreground">{im.description}</p>
                                            <div className="mt-2 text-xs bg-orange-50 dark:bg-orange-900/20 p-2 rounded flex items-center gap-2">
                                                <ArrowRight className="h-3 w-3 text-orange-600" />
                                                <span className="text-orange-800 dark:text-orange-300">Suggestion: {im.suggestion}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Suggested Next Steps</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {report.next_steps.map((step, i) => (
                                    <Badge key={i} variant="secondary" className="bg-white dark:bg-zinc-800 px-3 py-1 flex items-center gap-2 border">
                                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                        {step}
                                    </Badge>
                                ))}
                            </div>
                            {report.interviewer_notes && (
                                <p className="mt-4 text-xs text-muted-foreground bg-white/50 dark:bg-black/20 p-3 rounded">
                                    <strong>Reflective Notes:</strong> {report.interviewer_notes}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {!report && (
                <div className="space-y-6">
                    <Separator />
                    <h3 className="text-xl font-bold flex items-center gap-2"><FileText className="h-5 w-5" /> Question-by-Question Review</h3>
                    <div className="grid gap-4">
                        {evaluations.map((ev, i) => (
                            <Card key={i} className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="pt-6 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-semibold text-primary leading-tight">Q: {ev.question}</h4>
                                        <Badge variant="outline" className="bg-primary/5">{ev.overall_score}/100</Badge>
                                    </div>
                                    <div className="text-sm bg-muted/40 p-4 rounded-md border text-muted-foreground relative">
                                        <div className="absolute top-2 right-2 opacity-50"><Badge variant="outline" className="text-[10px] scale-75">YOUR ANSWER</Badge></div>
                                        {ev.answer}
                                    </div>
                                    <div className="flex items-start gap-2 pt-2">
                                        <div className="mt-1 h-5 w-5 text-green-500 shrink-0"><Check size={18} /></div>
                                        <p className="text-sm font-medium">{ev.feedback}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </PageWrapper>
    );
}
