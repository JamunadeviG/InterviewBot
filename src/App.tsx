import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import HomePage from "./pages/home/HomePage";
import RoadmapPage from "./pages/roadmap/RoadmapPage";
import TopicPage from "./pages/roadmap/TopicPage";
import InterviewPage from "./pages/interview/InterviewPage";
import EvaluationPage from "./pages/evaluation/EvaluationPage";
import ContactPage from "./pages/contact/ContactPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="roadmap/:userId" element={<RoadmapPage />} />
          <Route path="roadmap/:userId/:role/:topicId" element={<TopicPage />} />
          <Route path="interview" element={<InterviewPage />} />
          <Route path="evaluation" element={<EvaluationPage />} />
          <Route path="contact" element={<ContactPage />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
