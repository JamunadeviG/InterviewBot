import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, ArrowLeft, ExternalLink } from "lucide-react";
import { getProgress, logAnalytics, api } from "@/lib/api";
import type { Roadmap, RoadmapItem, Role } from "@/lib/types";

export default function TopicPage() {
  const { role, topicId, userId } = useParams<{ role: string; topicId: string; userId: string }>();

  // ...

  // Update back button
  // <Button variant="outline" onClick={() => navigate(`/roadmap/${userId}?role=${role}`)}>

  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [topic, setTopic] = useState<RoadmapItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = api.auth.getCurrentUser();
    if (!currentUser) {
      navigate("/login");
      return;
    }
  }, [navigate]);

  useEffect(() => {
    const loadData = async () => {
      if (!role || !topicId) return;
      const currentUser = api.auth.getCurrentUser();
      if (!currentUser) return;

      try {
        const userProgressSections = await getProgress(role as Role);

        setRoadmap({ role: role as Role, sections: userProgressSections });

        // Find the topic
        for (const section of userProgressSections) {
          const found = section.items.find((item: RoadmapItem) => item.id === topicId);
          if (found) {
            setTopic(found);
            break;
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [role, topicId, navigate]);

  const markResourceCompleted = async (resourceId: string) => {
    if (!roadmap || !topic || !role) return;
    const currentUser = api.auth.getCurrentUser();
    if (!currentUser) return;

    // Toggle resource completion
    const updatedCompletedResources = topic.completedResources.includes(resourceId)
      ? topic.completedResources.filter(id => id !== resourceId)
      : [...topic.completedResources, resourceId];

    const updatedTopic = {
      ...topic,
      completedResources: updatedCompletedResources,
    };
    updatedTopic.status =
      updatedTopic.completedResources.length >= topic.resources.length
        ? "completed"
        : updatedTopic.completedResources.length > 0
          ? "in-progress"
          : "not-started";

    const updatedRoadmap = {
      ...roadmap,
      sections: roadmap.sections.map(section => ({
        ...section,
        items: section.items.map(item => item.id === topicId ? updatedTopic : item),
      }))
    };

    setRoadmap(updatedRoadmap);
    setTopic(updatedTopic);

    try {
      // Use new granular save
      await api.roadmap.saveTopicProgress(role as Role, topic.id, updatedCompletedResources);
      await logAnalytics(currentUser.id, 'resource_completed', { role, topicId, resourceId, topicTitle: topic.title });
    } catch (error) {
      console.error("Failed to save progress", error);
    }
  };

  if (loading) return <PageWrapper className="container py-10 text-center">Loading...</PageWrapper>;
  if (!topic || !roadmap) return <PageWrapper className="container py-10 text-center">Topic not found</PageWrapper>;

  const progress = (topic.completedResources.length / topic.resources.length) * 100;

  return (
    <PageWrapper className="container py-10 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate(`/roadmap/${userId}?role=${role}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Roadmap
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{topic.title}</h1>
          <p className="text-muted-foreground">{topic.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Badge variant={topic.status === "completed" ? "default" : "secondary"}>{topic.status}</Badge>
        <span className="text-sm text-muted-foreground">{topic.completedResources.length} / {topic.resources.length} resources completed</span>
      </div>

      <div className="w-full h-3 bg-secondary rounded">
        <div className="h-3 bg-blue-500 rounded transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Learning Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {topic.resources.map(resource => {
            const isCompleted = topic.completedResources.includes(resource.id);
            return (
              <div key={resource.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <button onClick={() => markResourceCompleted(resource.id)}>
                  {isCompleted ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Circle className="h-5 w-5 text-muted-foreground hover:text-blue-500" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{resource.type}</Badge>
                    <a href={resource.url} target="_blank" rel="noopener noreferrer" className={`font-medium hover:underline ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                      {resource.title}
                    </a>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
