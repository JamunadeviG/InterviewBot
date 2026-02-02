"use client";

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
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
import type { Section } from "@/lib/types";
import { getRoles, getProgress, logAnalytics, api } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { Roadmap, Role } from "@/lib/types";

export default function RoadmapPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userId } = useParams<{ userId: string }>();

  const [role, setRole] = useState<Role>("Software Engineer");
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // ----------------- Check authentication -----------------
  useEffect(() => {
    const currentUser = api.auth.getCurrentUser();
    if (!currentUser) {
      navigate("/login");
      return;
    }
    // Optional: Check if userId in URL matches current user
    if (userId && currentUser.id !== userId) {
      console.warn("URL userId does not match logged in user");
      // We could redirect, but for now let's just allow it (or maybe the API will block it?)
      // Ideally we redirect to the correct user URL:
      navigate(`/roadmap/${currentUser.id}`);
    }
  }, [navigate, userId]);

  // ----------------- Fetch role from URL query -----------------
  useEffect(() => {
    const roleParam = searchParams.get("role") as Role;
    if (roleParam && ["Software Engineer", "Data Scientist", "ML Engineer"].includes(roleParam)) {
      setRole(roleParam);
    }
  }, [searchParams]);

  // ----------------- Load roadmap & progress -----------------
  useEffect(() => {
    const loadData = async () => {
      const currentUser = api.auth.getCurrentUser();
      if (!currentUser) return;

      setLoading(true);
      try {
        const rolesData = await getRoles();
        setAvailableRoles(rolesData);

        const userProgress = await getProgress(role);
        setRoadmap({ role, sections: userProgress });
      } catch (error) {
        console.error("Error loading roadmap:", error);
        alert((error as Error).message || "Failed to load roadmap");
        if (error instanceof Error && error.message === "Authentication required") {
          navigate("/login");
        }
        setRoadmap(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [role, navigate]);

  // ----------------- Handle marking resource completed -----------------
  const markAsCompleted = async (itemId: string, resourceId: string) => {
    if (!roadmap) return;

    const currentUser = api.auth.getCurrentUser();
    if (!currentUser) return;

    // 1. Optimistic Update (Frontend state)
    let updatedTopicCompletedResources: string[] = [];

    const updatedRoadmap = {
      ...roadmap,
      sections: roadmap.sections.map((section) => ({
        ...section,
        items: section.items.map((item) => {
          if (item.id !== itemId) return item;

          // Toggle logic
          const updatedResources = item.completedResources.includes(resourceId)
            ? item.completedResources.filter(r => r !== resourceId)
            : [...item.completedResources, resourceId];

          updatedTopicCompletedResources = updatedResources;

          const status =
            updatedResources.length === 0
              ? "not-started"
              : updatedResources.length >= item.resources.length
                ? "completed"
                : "in-progress";

          return {
            ...item,
            completedResources: updatedResources,
            status,
          };
        }),
      })),
    };

    // Update UI immediately
    setRoadmap(updatedRoadmap);

    // 2. Persist to Backend (Topic Level Only)
    try {
      if (!userId) throw new Error("No User ID");
      setIsSaving(true);
      await api.roadmap.saveTopicProgress(role, itemId, updatedTopicCompletedResources);
      await logAnalytics(currentUser.id, "resource_completed", { role, itemId, resourceId });
      console.log("Progress saved successfully to DB");
    } catch (error) {
      console.error("Error saving progress:", error);
      alert("Failed to save progress. Please check your connection.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    // Keep userId in URL
    if (userId) {
      navigate(`/roadmap/${userId}?role=${newRole}`);
    } else {
      navigate(`/roadmap?role=${newRole}`);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === "completed") return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (status === "in-progress") return <Clock className="h-5 w-5 text-blue-500" />;
    return <Circle className="h-5 w-5 text-muted-foreground" />;
  };

  const getSectionProgress = (section: Section) => {
    if (!roadmap) return 0;
    const total = section.items.length;
    const completed = section.items.filter((i: any) => i.status === "completed").length;
    return Math.round((completed / total) * 100);
  };

  if (loading) return <PageWrapper className="container py-10">Loading roadmap...</PageWrapper>;
  if (!roadmap) return <PageWrapper className="container py-10">Failed to load roadmap</PageWrapper>;

  return (
    <PageWrapper className="container py-10 space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Learning Roadmap</h1>
          {isSaving && <Badge variant="secondary" className="animate-pulse">Saving...</Badge>}
        </div>
        <Select value={role} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableRoles.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {roadmap.sections.map((section, idx) => {
        const progress = getSectionProgress(section);
        return (
          <div key={idx} className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <span className="text-sm text-muted-foreground">{progress}% Completed</span>
            </div>

            <div className="w-full h-2 bg-secondary rounded">
              <div className="h-2 bg-green-500 rounded" style={{ width: `${progress}%` }} />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.items.map((item) => {
                const itemProgress = (item.completedResources.length / item.resources.length) * 100;
                return (
                  <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <Badge className="mb-2">{item.status}</Badge>
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                          <CardDescription>{item.description}</CardDescription>
                        </div>
                        {getStatusIcon(item.status)}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="w-full h-2 bg-secondary rounded">
                        <div className="h-2 bg-blue-500 rounded" style={{ width: `${itemProgress}%` }} />
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {item.completedResources.length} / {item.resources.length} resources
                        </span>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/roadmap/${userId}/${role}/${item.id}`)}>
                          View Details <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>

                      {item.resources.map((res) => {
                        const done = item.completedResources.includes(res.id);
                        return (
                          <div key={res.id} className="flex items-center gap-2 text-sm">
                            {done ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4" />}
                            <a
                              href={res.url}
                              target="_blank"
                              className={`underline ${done ? "line-through text-muted-foreground" : ""}`}
                              onClick={(e) => { e.preventDefault(); markAsCompleted(item.id, res.id); window.open(res.url, "_blank"); }}
                            >
                              {res.title}
                            </a>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </PageWrapper>
  );
}
