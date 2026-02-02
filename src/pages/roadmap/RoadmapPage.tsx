import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Roadmap, Role } from "@/lib/types";
import { PageWrapper } from "@/components/layout/PageWrapper";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Clock, ArrowRight } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function RoadmapPage() {
    const [role, setRole] = useState<Role>("Software Engineer");
    const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        async function fetchRoadmap() {
            setIsLoading(true);
            try {
                const data = await api.roadmap.get(role);
                setRoadmap(data);
            } catch (error) {
                console.error("Failed to fetch roadmap", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchRoadmap();
    }, [role]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
                return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case "in-progress":
                return <Clock className="h-5 w-5 text-blue-500" />;
            default:
                return <Circle className="h-5 w-5 text-muted-foreground" />;
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case "completed":
                return "default"; // or "success" if we had it, default is primary
            case "in-progress":
                return "secondary";
            default:
                return "outline";
        }
    };

    return (
        <PageWrapper className="container py-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Learning Roadmap</h1>
                    <p className="text-muted-foreground">
                        Follow this structured path to master {role} skills.
                    </p>
                </div>
                <div className="w-full md:w-[200px]">
                    <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Software Engineer">Software Engineer</SelectItem>
                            <SelectItem value="Data Analyst">Data Analyst</SelectItem>
                            <SelectItem value="ML Engineer">ML Engineer</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {isLoading ? (
                <div className="grid gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-40 rounded-lg bg-secondary/50 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="space-y-8">
                    {roadmap?.sections.map((section, idx) => (
                        <div key={idx} className="space-y-4">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                                    {idx + 1}
                                </span>
                                {section.title}
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {section.items.map((item) => (
                                    <Card key={item.id} className="relative overflow-hidden transition-all hover:shadow-md">
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <Badge variant={getStatusBadgeVariant(item.status)} className="mb-2">
                                                    {item.status.replace("-", " ")}
                                                </Badge>
                                                {getStatusIcon(item.status)}
                                            </div>
                                            <CardTitle className="text-lg">{item.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription>{item.description}</CardDescription>
                                            <div className="mt-4 flex justify-end">
                                                {item.status !== "completed" ? (
                                                    <Button variant="ghost" size="sm" className="gap-1 text-primary">
                                                        Start Learning <ArrowRight className="h-4 w-4" />
                                                    </Button>
                                                ) : (
                                                    <Button variant="ghost" size="sm" className="gap-1 text-green-600 pointer-events-none">
                                                        Review
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </PageWrapper>
    );
}
