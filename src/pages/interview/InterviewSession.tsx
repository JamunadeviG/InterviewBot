import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, ChevronRight, AlertCircle, RefreshCw, Trophy } from 'lucide-react';
import { api } from '@/services/api';
import type { InterviewData } from '@/services/api';

export default function InterviewSession() {
    const location = useLocation();
    const navigate = useNavigate();
    const [resumeText] = useState(location.state?.resumeText);
    const [data, setData] = useState<InterviewData | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        if (!resumeText) {
            navigate('/interview/upload');
            return;
        }

        const fetchQuestions = async () => {
            try {
                setIsLoading(true);
                const result = await api.generateQuestions(resumeText);
                setData(result);
            } catch (err: any) {
                setError(err.message || 'Failed to generate interview questions.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuestions();
    }, [resumeText, navigate]);

    const handleNext = () => {
        if (!data) return;
        setAnswer('');
        if (currentQuestionIndex < data.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setCompleted(true);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <div className="text-center space-y-2">
                    <h2 className="text-xl font-semibold">Generating Your Interview...</h2>
                    <p className="text-muted-foreground max-w-md">
                        We're analyzing your resume to create a personalized set of technical and behavioral questions.
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
                <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                    <AlertCircle size={40} />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-red-600">Something went wrong</h2>
                    <p className="text-muted-foreground">{error}</p>
                </div>
                <Button onClick={() => window.location.reload()} variant="outline" className="gap-2">
                    <RefreshCw size={16} /> Try Again
                </Button>
            </div>
        );
    }

    if (completed && data) {
        return (
            <div className="container max-w-3xl py-12 px-4">
                <Card className="text-center p-8">
                    <div className="flex justify-center mb-6">
                        <div className="h-24 w-24 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 animate-bounce">
                            <Trophy size={48} />
                        </div>
                    </div>
                    <CardTitle className="text-3xl mb-4">Interview Completed!</CardTitle>
                    <CardDescription className="text-lg mb-8">
                        You've completed the practice session for the <strong>{data.candidateProfile.role}</strong> role.
                    </CardDescription>
                    <div className="flex justify-center gap-4">
                        <Button onClick={() => navigate('/interview/upload')} variant="outline">Start New Session</Button>
                        <Button onClick={() => navigate('/')}>Return Home</Button>
                    </div>
                </Card>
            </div>
        );
    }

    if (!data) return null;

    const currentQuestion = data.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / data.questions.length) * 100;

    return (
        <div className="container max-w-4xl py-8 px-4 h-[calc(100vh-4rem)]">
            <div className="mb-6 space-y-2">
                <div className="flex justify-between items-center text-sm text-muted-foreground mb-1">
                    <span>Question {currentQuestionIndex + 1} of {data.questions.length}</span>
                    <span>{Math.round(progress)}% Completed</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${((currentQuestionIndex + 1) / data.questions.length) * 100}%` }}
                    />
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestion.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="min-h-[400px] flex flex-col">
                        <CardHeader>
                            <div className="flex gap-2 mb-2">
                                <Badge variant={currentQuestion.type === 'Technical' ? "default" : "secondary"}>
                                    {currentQuestion.type}
                                </Badge>
                                <Badge variant="outline" className={
                                    currentQuestion.difficulty === 'Hard' ? "text-red-500 border-red-200" :
                                        currentQuestion.difficulty === 'Medium' ? "text-yellow-600 border-yellow-200" :
                                            "text-green-600 border-green-200"
                                }>
                                    {currentQuestion.difficulty}
                                </Badge>
                                <Badge variant="outline">{currentQuestion.topic}</Badge>
                            </div>
                            <CardTitle className="text-2xl leading-relaxed">
                                {currentQuestion.question}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <Textarea
                                placeholder="Type your answer here..."
                                className="h-full min-h-[200px] text-lg p-4 resize-none"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                autoFocus
                            />
                        </CardContent>
                        <CardFooter className="flex justify-between items-center bg-secondary/20 p-6">
                            <span className="text-sm text-muted-foreground flex items-center gap-2">
                                {answer.trim().length > 0 ? (
                                    <span className="text-green-600 flex items-center gap-1">
                                        <CheckCircle size={16} /> Answer recorded
                                    </span>
                                ) : (
                                    "Please type an answer to proceed"
                                )}
                            </span>
                            <Button
                                onClick={handleNext}
                                disabled={answer.trim().length === 0}
                                size="lg"
                                className="gap-2"
                            >
                                {currentQuestionIndex === data.questions.length - 1 ? 'Finish Interview' : 'Next Question'}
                                <ChevronRight size={16} />
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
