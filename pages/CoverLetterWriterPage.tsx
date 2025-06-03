
import React, { useState, useCallback } from 'react';
import Card from '../components/Card';
import TextArea from '../components/TextArea';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import Input from '../components/Input';
import { AlertType } from '../types';
import { generateText } from '../services/geminiService';

const CoverLetterWriterPage: React.FC = () => {
  const [jobDescription, setJobDescription] = useState<string>('');
  const [userSkills, setUserSkills] = useState<string>('');
  const [userExperience, setUserExperience] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [tone, setTone] = useState<'formal' | 'enthusiastic' | 'concise'>('formal');
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription || !userSkills || !userName) {
      setError("Please fill in your name, relevant skills/experience, and the job description.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    setGeneratedCoverLetter('');

    try {
      const prompt = `
        Write a compelling and professional cover letter for a job application.
        My Name: ${userName}
        My Key Skills: ${userSkills}
        My Relevant Experience Highlights: ${userExperience}
        
        Job Description I am applying for:
        ---
        ${jobDescription}
        ---

        The tone of the cover letter should be ${tone}.
        The letter should be tailored to the job description, highlighting how my skills and experience make me a strong candidate.
        Structure it like a standard cover letter with an introduction, body paragraphs, and a conclusion with a call to action.
        Ensure it is ATS-friendly and engaging.
      `;
      
      const coverLetter = await generateText(prompt, "You are an expert cover letter writing assistant.");
      setGeneratedCoverLetter(coverLetter);
      setSuccessMessage("Cover letter generated successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred during cover letter generation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && <Alert type={AlertType.ERROR} message={error} onClose={() => setError(null)} />}
      {successMessage && <Alert type={AlertType.SUCCESS} message={successMessage} onClose={() => setSuccessMessage(null)} />}

      <form onSubmit={handleSubmit}>
        <Card title="Your Information">
          <Input label="Your Full Name" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="e.g., Jane Doe" required />
          <TextArea
            label="Your Key Skills (comma-separated or brief sentences)"
            value={userSkills}
            onChange={(e) => setUserSkills(e.target.value)}
            rows={3}
            placeholder="e.g., Proficient in React, TypeScript, Node.js; Strong problem-solving abilities; Excellent team collaborator."
            required
          />
          <TextArea
            label="Highlights of Your Relevant Experience (brief summary)"
            value={userExperience}
            onChange={(e) => setUserExperience(e.target.value)}
            rows={4}
            placeholder="e.g., Led a project that increased user engagement by 15%; Developed and launched three major features for a SaaS product; Contributed to open-source projects."
          />
        </Card>

        <Card title="Job Details" className="mt-6">
          <TextArea
            label="Paste Job Description Here"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={8}
            placeholder="Paste the full job description from the company's posting."
            required
          />
        </Card>

        <Card title="Customize Tone" className="mt-6">
            <div className="flex space-x-4">
                {(['formal', 'enthusiastic', 'concise'] as const).map(t => (
                    <Button 
                        key={t}
                        type="button"
                        variant={tone === t ? 'primary' : 'outline'}
                        onClick={() => setTone(t)}
                    >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Button>
                ))}
            </div>
        </Card>
        
        <div className="mt-8 flex justify-end">
          <Button type="submit" size="lg" isLoading={loading} disabled={loading}>
            {loading ? 'Generating Cover Letter...' : '✨ Generate Cover Letter'}
          </Button>
        </div>
      </form>

      {generatedCoverLetter && (
        <Card title="Generated Cover Letter" className="mt-8">
          <TextArea
            value={generatedCoverLetter}
            readOnly // Or allow editing: onChange={(e) => setGeneratedCoverLetter(e.target.value)}
            rows={20}
            className="font-mono text-sm bg-gray-50"
          />
          <p className="mt-2 text-xs text-textSecondary">Review and edit the letter as needed before sending.</p>
        </Card>
      )}
    </div>
  );
};

export default CoverLetterWriterPage;
