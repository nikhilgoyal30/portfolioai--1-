
import React, { useState, useCallback } from 'react';
import Card from '../components/Card';
import TextArea from '../components/TextArea';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import Input from '../components/Input'; // For specific query types like skill gap
import { AlertType } from '../types';
import { generateText, generateTextWithGoogleSearch } from '../services/geminiService';

interface GroundingSource {
  web?: { uri: string; title: string };
  pdf?: { uri: string; title: string }; // Example, adapt as per actual API response
}

const CareerCoachingPage: React.FC = () => {
  const [userQuery, setUserQuery] = useState<string>('');
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSkills, setCurrentSkills] = useState<string>('');
  const [targetRole, setTargetRole] = useState<string>('');
  const [useGoogleSearch, setUseGoogleSearch] = useState<boolean>(false);


  const predefinedQueries = [
    "What are common career paths for a software engineer?",
    "How can I improve my resume for a data scientist role?",
    "What skills are in demand for UI/UX designers in 2024?",
    "How do I negotiate a salary offer effectively?",
    "Suggest some good online courses for learning cloud computing.",
  ];

  const handlePredefinedQuery = (query: string) => {
    setUserQuery(query);
    // Optionally trigger submission directly or let user click submit
    // handleSubmitQuery(query); 
  };

  const handleSubmitQuery = async (queryToSubmit?: string) => {
    const finalQuery = queryToSubmit || userQuery;
    if (!finalQuery.trim()) {
      setError("Please enter your question or select a predefined one.");
      return;
    }

    setLoading(true);
    setError(null);
    setAiAdvice('');
    setSources([]);

    try {
      let adviceText = '';
      let fetchedSources: any[] = [];

      if (useGoogleSearch) {
        const result = await generateTextWithGoogleSearch(finalQuery);
        adviceText = result.text;
        fetchedSources = result.sources;
      } else {
        adviceText = await generateText(finalQuery, "You are an experienced AI career coach. Provide insightful and actionable advice.");
      }
      
      setAiAdvice(adviceText);
      if (fetchedSources.length > 0) {
        setSources(fetchedSources.map(s => s.web ? {web: {uri: s.web.uri, title: s.web.title}} : s)); // Basic mapping
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred while fetching advice.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkillGapAnalysis = async () => {
    if (!currentSkills.trim() || !targetRole.trim()) {
        setError("Please enter your current skills and target role for skill gap analysis.");
        return;
    }
    const query = `I am a professional with skills in ${currentSkills}. I want to transition into a ${targetRole} role. What are the key skill gaps I might have, and how can I address them? Please provide actionable advice and suggest resources if possible.`;
    setUserQuery(query); // Set it so user sees what was asked
    handleSubmitQuery(query); // Submit this specific query
  };

  return (
    <div className="space-y-6">
      {error && <Alert type={AlertType.ERROR} message={error} onClose={() => setError(null)} />}

      <Card title="Ask Your Career Question">
        <TextArea
          label="Your Question or Topic"
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          rows={5}
          placeholder="e.g., How can I prepare for a technical interview for a FAANG company? or What are the latest trends in AI product management?"
        />
        <div className="my-3">
            <label className="flex items-center space-x-2 text-sm text-textPrimary">
                <input 
                    type="checkbox" 
                    checked={useGoogleSearch} 
                    onChange={(e) => setUseGoogleSearch(e.target.checked)}
                    className="form-checkbox h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span>Use Google Search for up-to-date information (good for recent trends, news)</span>
            </label>
        </div>
        <Button onClick={() => handleSubmitQuery()} isLoading={loading} disabled={loading || !userQuery.trim()}>
          {loading ? 'Getting Advice...' : 'Get AI Coaching'}
        </Button>
        
        <div className="mt-4">
            <h4 className="text-sm font-medium text-textPrimary mb-2">Or, select a common question:</h4>
            <div className="flex flex-wrap gap-2">
                {predefinedQueries.map((q, i) => (
                    <Button key={i} variant="outline" size="sm" onClick={() => handlePredefinedQuery(q)}>
                        {q.substring(0,50)}{q.length > 50 ? '...' : ''}
                    </Button>
                ))}
            </div>
        </div>
      </Card>

      <Card title="Skill Gap Analysis" className="mt-6">
        <Input 
            label="Your Current Skills (comma-separated)"
            value={currentSkills}
            onChange={(e) => setCurrentSkills(e.target.value)}
            placeholder="e.g., Python, SQL, Data Analysis"
        />
        <Input 
            label="Your Target Role"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g., Machine Learning Engineer, Senior Frontend Developer"
        />
        <Button onClick={handleSkillGapAnalysis} isLoading={loading} disabled={loading || !currentSkills.trim() || !targetRole.trim()} className="mt-2">
            Analyze Skill Gap
        </Button>
      </Card>


      {loading && !aiAdvice && (
        <div className="flex justify-center py-8"><LoadingSpinner /></div>
      )}

      {aiAdvice && (
        <Card title="AI Career Coach Says:" className="mt-8">
          <div className="prose prose-sm max-w-none text-textPrimary" dangerouslySetInnerHTML={{ __html: aiAdvice.replace(/\n/g, '<br />') }}></div>
          {sources.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <h5 className="text-sm font-semibold text-textPrimary mb-2">Sources from Google Search:</h5>
              <ul className="list-disc list-inside space-y-1">
                {sources.map((source, index) => source.web && (
                  <li key={index} className="text-xs">
                    <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {source.web.title || source.web.uri}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default CareerCoachingPage;
