import React, { useState, useEffect, useCallback } from 'react';
import Card from '../components/Card';
import TextArea from '../components/TextArea';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { MockInterviewQuestion, InterviewFeedback, AlertType } from '../types';
import { generateText, generateJson } from '../services/geminiService';
import Select from '../components/Select';
import Input from '../components/Input'; // Added missing import

interface InterviewSession {
  question: MockInterviewQuestion;
  answer: string;
  feedback?: InterviewFeedback;
}

const questionTypes = [
    { value: 'behavioral', label: 'Behavioral' },
    { value: 'technical-general', label: 'Technical (General)' },
    { value: 'technical-frontend', label: 'Technical (Frontend)' },
    { value: 'technical-backend', label: 'Technical (Backend)' },
    { value: 'technical-data', label: 'Technical (Data Structures & Algo)' },
];

const MockInterviewPage: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState<MockInterviewQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [interviewHistory, setInterviewHistory] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestionType, setSelectedQuestionType] = useState<string>('behavioral');
  const [jobRole, setJobRole] = useState<string>('Software Engineer'); // User can specify role

  const fetchNewQuestion = useCallback(async () => {
    setLoading(true);
    setError(null);
    setCurrentQuestion(null);
    setUserAnswer('');
    setFeedback(null);
    try {
      const prompt = `Generate one ${selectedQuestionType} interview question suitable for a ${jobRole} candidate. Return as a JSON object with "id" (string, unique) and "question" (string). Example: {"id": "q123", "question": "Tell me about a time you failed."}`;
      const questionData = await generateJson<Omit<MockInterviewQuestion, 'type'>>(prompt, "You are an AI interview question generator.");
      if (questionData && questionData.question) {
        setCurrentQuestion({ ...questionData, type: selectedQuestionType.startsWith('technical') ? 'technical' : 'behavioral' });
      } else {
        setError("Failed to fetch a new question. The AI returned an unexpected format.");
        // Fallback question
        setCurrentQuestion({ id: 'fallback1', type: 'behavioral', question: "Tell me about yourself." });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch question.");
      setCurrentQuestion({ id: 'fallback_err', type: 'behavioral', question: "What are your strengths?" });
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedQuestionType, jobRole]);

  useEffect(() => {
    fetchNewQuestion();
  }, [fetchNewQuestion]); // Runs on initial mount and when fetchNewQuestion changes (due to selectedQuestionType or jobRole)

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !userAnswer) {
      setError("Please answer the current question first.");
      return;
    }
    setLoading(true);
    setError(null);
    setFeedback(null);
    try {
      const prompt = `
        I am practicing for an interview.
        The question asked was: "${currentQuestion.question}"
        My answer was: "${userAnswer}"
        
        Please provide feedback on my answer. 
        The feedback should be a JSON object with the following structure:
        {
          "clarity": <score_1_to_5>,
          "relevance": <score_1_to_5>,
          "confidence_impression": <score_1_to_5_based_on_text_choice_and_structure>,
          "suggestions": ["suggestion 1", "suggestion 2", ...]
        }
        Suggestions should be actionable tips to improve the answer.
        Focus on content, structure, and impact.
      `;
      const feedbackData = await generateJson<InterviewFeedback>(prompt, "You are an AI interview coach providing constructive feedback.");
      
      if (feedbackData && typeof feedbackData.clarity === 'number') {
        setFeedback(feedbackData);
        setInterviewHistory(prev => [...prev, { question: currentQuestion, answer: userAnswer, feedback: feedbackData }]);
      } else {
        setError("AI returned feedback in an unexpected format. Trying to get text feedback.");
        const textFeedback = await generateText(prompt, "You are an AI interview coach providing constructive feedback.");
        setFeedback({clarity: 0, relevance: 0, confidence: 0, suggestions: [textFeedback]}); // confidence renamed to confidence_impression by AI
        setInterviewHistory(prev => [...prev, { question: currentQuestion, answer: userAnswer, feedback: {clarity: 0, relevance: 0, confidence: 0, suggestions: [textFeedback]} }]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get feedback.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && <Alert type={AlertType.ERROR} message={error} onClose={() => setError(null)} />}
      
      <Card title="Interview Settings">
        <div className="grid md:grid-cols-2 gap-4">
          <Input 
            label="Target Job Role" 
            value={jobRole} 
            onChange={(e) => setJobRole(e.target.value)} 
            placeholder="e.g., Frontend Developer, Product Manager"
          />
          <Select 
            label="Question Type"
            options={questionTypes}
            value={selectedQuestionType}
            onChange={(e) => setSelectedQuestionType(e.target.value)}
          />
        </div>
         <Button onClick={fetchNewQuestion} isLoading={loading && !currentQuestion} disabled={loading && !currentQuestion} className="mt-4">
            {loading && !currentQuestion ? 'Loading New Question...' : 'Get New Question'}
          </Button>
      </Card>

      {loading && !currentQuestion && <div className="flex justify-center py-8"><LoadingSpinner /></div>}

      {currentQuestion && (
        <Card title="Current Question">
          <p className="text-lg font-medium text-textPrimary mb-4">{currentQuestion.question}</p>
          <TextArea
            label="Your Answer"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            rows={6}
            placeholder="Type your answer here..."
          />
          <Button onClick={handleSubmitAnswer} isLoading={loading && !!userAnswer} disabled={loading || !userAnswer.trim()} className="mt-4">
            {loading && !!userAnswer ? 'Getting Feedback...' : 'Submit Answer & Get Feedback'}
          </Button>
        </Card>
      )}

      {feedback && (
        <Card title="AI Feedback" className="mt-6 bg-blue-50 border-blue-200">
          <h4 className="text-md font-semibold text-blue-700 mb-2">Scores (out of 5):</h4>
          <ul className="list-disc list-inside text-blue-600 space-y-1 mb-3">
            <li>Clarity: {feedback.clarity || feedback.clarity === 0 ? feedback.clarity : 'N/A'}</li>
            <li>Relevance: {feedback.relevance || feedback.relevance === 0 ? feedback.relevance : 'N/A'}</li>
            <li>Confidence (Impression): {(feedback as any).confidence_impression || feedback.confidence || 'N/A'}</li>
          </ul>
          <h4 className="text-md font-semibold text-blue-700 mb-2">Suggestions for Improvement:</h4>
          {feedback.suggestions && feedback.suggestions.length > 0 ? (
            <ul className="list-disc list-inside text-blue-600 space-y-1">
              {feedback.suggestions.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          ) : (
            <p className="text-blue-600">No specific suggestions provided, or an error occurred retrieving them.</p>
          )}
        </Card>
      )}

      {interviewHistory.length > 0 && (
        <Card title="Interview History" className="mt-8">
          {interviewHistory.slice().reverse().map((session, index) => (
            <div key={index} className="mb-4 p-3 border border-gray-200 rounded-md">
              <p className="font-semibold text-textPrimary">Q: {session.question.question}</p>
              <p className="text-sm text-textSecondary mt-1 mb-2">A: {session.answer.substring(0,150)}...</p>
              {session.feedback && (
                 <p className="text-xs text-blue-500">Feedback received (Clarity: {session.feedback.clarity || 'N/A'})</p>
              )}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};

export default MockInterviewPage;