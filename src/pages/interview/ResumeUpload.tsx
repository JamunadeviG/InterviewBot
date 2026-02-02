import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { api } from '@/services/api';

const ResumeUpload = () => {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (file: File) => {
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(file.type)) {
            setError('Please upload a valid PDF or DOCX file.');
            return;
        }
        setFile(file);
        setError(null);
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsLoading(true);
        setError(null);

        try {
            const data = await api.uploadResume(file);
            navigate('/interview/session', { state: { resumeText: data.text } });
        } catch (err: any) {
            setError(err.message || 'Failed to upload resume. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-2xl py-12 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="w-full">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-bold">Upload Your Resume</CardTitle>
                        <CardDescription>
                            Upload your resume (PDF or DOCX) to start a personalized AI-driven interview session.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div
                            className={`
                        border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
                        ${isDragging ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary/50'}
                        ${file ? 'bg-green-50/50 border-green-500' : ''}
                    `}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".pdf,.docx"
                                onChange={handleChange}
                            />

                            <div className="flex flex-col items-center gap-4">
                                {file ? (
                                    <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                        <FileText size={32} />
                                    </div>
                                ) : (
                                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                        <Upload size={32} />
                                    </div>
                                )}

                                <div>
                                    {file ? (
                                        <p className="text-lg font-medium text-green-700">{file.name}</p>
                                    ) : (
                                        <>
                                            <p className="text-lg font-medium">Click or drag file to upload</p>
                                            <p className="text-sm text-gray-500">Supports PDF, DOCX (Max 5MB)</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <div className="mt-6 flex justify-end">
                            <Button
                                size="lg"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpload();
                                }}
                                disabled={!file || isLoading}
                                className="w-full sm:w-auto"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Analyzing Resume...
                                    </>
                                ) : (
                                    'Start Interview'
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default ResumeUpload;
