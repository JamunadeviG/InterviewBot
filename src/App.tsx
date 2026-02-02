import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import HomePage from "./pages/home/HomePage";
import RoadmapPage from "./pages/roadmap/RoadmapPage";
import InterviewPage from "./pages/interview/InterviewPage";
import ResumeUpload from "./pages/interview/ResumeUpload";
import InterviewSession from "./pages/interview/InterviewSession";
import EvaluationPage from "./pages/evaluation/EvaluationPage";
import ContactPage from "./pages/contact/ContactPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="roadmap" element={<RoadmapPage />} />
          <Route path="interview" element={<InterviewPage />} />
          <Route path="interview/upload" element={<ResumeUpload />} />
          <Route path="interview/session" element={<InterviewSession />} />
          <Route path="evaluation" element={<EvaluationPage />} />
          <Route path="contact" element={<ContactPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
