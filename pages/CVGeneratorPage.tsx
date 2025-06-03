import React, { useState, useCallback } from 'react';
import Card from '../components/Card';
import Input from '../components/Input';
import TextArea from '../components/TextArea';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { UserProfile, Experience, Education, AlertType } from '../types';
import { generateText, generateJson } from '../services/geminiService';

const initialCVProfile: Pick<UserProfile, 'name' | 'title' | 'email' | 'phone' | 'linkedin' | 'github' | 'skills' | 'experience' | 'education' | 'bio'> = {
  name: '',
  title: '',
  bio: '', // Summary for CV
  email: '',
  phone: '',
  linkedin: '',
  github: '',
  skills: [],
  experience: [{ id: 'exp1', title: '', company: '', startDate: '', endDate: '', responsibilities: [''] }],
  education: [{ id: 'edu1', institution: '', degree: '', fieldOfStudy: '', graduationDate: '' }],
};

const CVGeneratorPage: React.FC = () => {
  const [profile, setProfile] = useState(initialCVProfile);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [generatedCVText, setGeneratedCVText] = useState<string | null>(null);

  const handleChange = useCallback(<K extends keyof typeof initialCVProfile>(field: K, value: (typeof initialCVProfile)[K]) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleArrayChange = useCallback(
    (
      arrayName: 'experience' | 'education',
      index: number,
      field: keyof Experience | keyof Education, // Corrected type
      value: string | string[]
    ) => {
      setProfile(prev => {
        const newArray = [...prev[arrayName]];
        
        if (arrayName === 'experience') {
          const currentItem = newArray[index] as Experience;
          const fieldName = field as keyof Experience;
          let finalValue: string | string[];

          if (fieldName === 'responsibilities') {
            // Ensure value is string[] for responsibilities
            finalValue = Array.isArray(value) ? value : (typeof value === 'string' ? value.split(',').map(s=>s.trim()).filter(s => s) : []);
          } else {
            // Ensure value is string for other Experience fields
            finalValue = Array.isArray(value) ? value.join(', ') : String(value); 
          }
          
          newArray[index] = {
            ...currentItem,
            [fieldName]: finalValue,
          };
        } else { // arrayName === 'education'
          const currentItem = newArray[index] as Education;
          const fieldName = field as keyof Education;
          // Ensure value is string for Education fields
          const finalValue = Array.isArray(value) ? value.join(', ') : String(value);
          newArray[index] = {
            ...currentItem,
            [fieldName]: finalValue,
          };
        }
        
        return { ...prev, [arrayName]: newArray };
      });
    },
    []
  );

  const handleResponsibilityChange = useCallback((expIndex: number, respIndex: number, value: string) => {
    setProfile(prev => {
      const newExperience = [...prev.experience];
      newExperience[expIndex].responsibilities[respIndex] = value;
      return { ...prev, experience: newExperience };
    });
  }, []);
  
  const addResponsibility = useCallback((expIndex: number) => {
    setProfile(prev => {
        const newExperience = [...prev.experience];
        newExperience[expIndex].responsibilities.push('');
        return { ...prev, experience: newExperience };
    });
  }, []);

  const removeResponsibility = useCallback((expIndex: number, respIndex: number) => {
    setProfile(prev => {
        const newExperience = [...prev.experience];
        newExperience[expIndex].responsibilities = newExperience[expIndex].responsibilities.filter((_, i) => i !== respIndex);
        return { ...prev, experience: newExperience };
    });
  }, []);


  const addItem = useCallback((arrayName: 'experience' | 'education') => {
    setProfile(prev => {
      const newId = `${arrayName.substring(0,3)}${prev[arrayName].length + 1}`;
      const newItem = arrayName === 'experience' 
        ? { id: newId, title: '', company: '', startDate: '', endDate: '', responsibilities: [''] }
        : { id: newId, institution: '', degree: '', fieldOfStudy: '', graduationDate: '' };
      return { ...prev, [arrayName]: [...prev[arrayName] as any, newItem] }; // Cast to any to simplify union type with newItem
    });
  }, []);
  
  const removeItem = useCallback((arrayName: 'experience' | 'education', index: number) => {
    setProfile(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_: any, i: number) => i !== index),
    }));
  }, []);

  const handleAIGenerateSummary = async () => {
    if (!profile.title || profile.skills.length === 0 || profile.experience.length === 0) {
      setError("Please provide your title, skills, and at least one experience to generate a summary.");
      return;
    }
    setLoading(true); setError(null);
    try {
      const prompt = `Generate a professional summary for a CV. The person is a ${profile.title} with skills in ${profile.skills.join(', ')}. Key experiences include: ${profile.experience.map(exp => `${exp.title} at ${exp.company}`).join('; ')}. Keep it concise (3-4 sentences) and impactful, suitable for an ATS-friendly CV.`;
      const summary = await generateText(prompt, "You are an expert CV/resume writer.");
      handleChange('bio', summary);
      setSuccessMessage("Professional summary generated!");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate summary.");
    } finally {
      setLoading(false);
    }
  };

  const handleAIGenerateResponsibilities = async (expIndex: number) => {
    const exp = profile.experience[expIndex];
    if (!exp.title || !exp.company) {
        setError("Please provide job title and company to generate responsibilities.");
        return;
    }
    setLoading(true); setError(null);
    try {
        const prompt = `Generate 3-5 concise, action-oriented bullet points describing responsibilities and achievements for a ${exp.title} at ${exp.company}. Focus on quantifiable results if possible. The output should be a JSON array of strings. For example: ["Developed new feature X, resulting in Y% improvement.", "Led a team of Z engineers."].`;
        const responsibilitiesJson = await generateJson<string[]>(prompt, "You are an expert CV/resume writer creating bullet points.");
        if (responsibilitiesJson && Array.isArray(responsibilitiesJson)) {
            // The field here must be 'responsibilities' (a keyof Experience)
            handleArrayChange('experience', expIndex, 'responsibilities', responsibilitiesJson);
            setSuccessMessage(`Responsibilities for ${exp.title} generated!`);
        } else {
            setError("AI did not return valid responsibilities. Please try again or write manually.");
        }
    } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to generate responsibilities.");
    } finally {
        setLoading(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    setGeneratedCVText(null);

    try {
      const cvPrompt = `
        Create a plain text, ATS-friendly CV content based on the following information.
        Format it clearly with standard CV sections (Summary, Skills, Experience, Education).
        Use bullet points for responsibilities.

        Name: ${profile.name}
        Title: ${profile.title}
        Email: ${profile.email}
        Phone: ${profile.phone || 'N/A'}
        LinkedIn: ${profile.linkedin || 'N/A'}
        GitHub: ${profile.github || 'N/A'}

        Summary:
        ${profile.bio}

        Skills:
        ${profile.skills.join(', ')}

        Experience:
        ${profile.experience.map(exp => `
          ${exp.title} at ${exp.company} (${exp.startDate} - ${exp.endDate})
          ${exp.responsibilities.map(r => `- ${r}`).join('\n          ')}
        `).join('\n\n        ')}

        Education:
        ${profile.education.map(edu => `
          ${edu.degree} in ${edu.fieldOfStudy} - ${edu.institution} (${edu.graduationDate})
        `).join('\n\n        ')}

        The output should be well-formatted plain text. Do not use HTML or Markdown.
      `;
      
      const cvText = await generateText(cvPrompt, "You are an AI that formats CV data into clean, ATS-friendly plain text.");
      setGeneratedCVText(cvText);
      setSuccessMessage("CV content generated! Review below.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred during CV generation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && <Alert type={AlertType.ERROR} message={error} onClose={() => setError(null)} />}
      {successMessage && <Alert type={AlertType.SUCCESS} message={successMessage} onClose={() => setSuccessMessage(null)} />}

      <form onSubmit={handleSubmit}>
        <Card title="Personal Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name" value={profile.name} onChange={(e) => handleChange('name', e.target.value)} required />
            <Input label="Professional Title" value={profile.title} onChange={(e) => handleChange('title', e.target.value)} required />
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Input label="Email" type="email" value={profile.email} onChange={(e) => handleChange('email', e.target.value)} required />
            <Input label="Phone" type="tel" value={profile.phone} onChange={(e) => handleChange('phone', e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Input label="LinkedIn Profile URL" type="url" value={profile.linkedin} onChange={(e) => handleChange('linkedin', e.target.value)} />
            <Input label="GitHub Profile URL" type="url" value={profile.github} onChange={(e) => handleChange('github', e.target.value)} />
          </div>
        </Card>

        <Card title="Professional Summary" className="mt-6">
            <TextArea label="Summary" value={profile.bio} onChange={(e) => handleChange('bio', e.target.value)} rows={4} placeholder="A brief overview of your career, skills, and goals."/>
            <Button type="button" variant="outline" size="sm" onClick={handleAIGenerateSummary} disabled={loading} isLoading={loading && profile.bio === ''}>
                {loading && profile.bio === '' ? 'Generating...' : '✨ AI Generate Summary'}
            </Button>
        </Card>

        <Card title="Skills" className="mt-6">
          <Input 
            label="Skills (comma-separated)" 
            value={profile.skills.join(', ')} 
            onChange={(e) => handleChange('skills', e.target.value.split(',').map(s => s.trim()).filter(s => s))} 
            placeholder="e.g., Java, Python, SQL, Project Management" 
          />
        </Card>

        <Card title="Work Experience" className="mt-6">
          {profile.experience.map((exp, expIndex) => (
            <div key={exp.id} className="mb-6 p-4 border border-gray-200 rounded-md relative">
              <h4 className="font-semibold mb-2 text-textPrimary">Experience #{expIndex + 1}</h4>
              <Input label="Job Title" value={exp.title} onChange={(e) => handleArrayChange('experience', expIndex, 'title', e.target.value)} />
              <Input label="Company" value={exp.company} onChange={(e) => handleArrayChange('experience', expIndex, 'company', e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Start Date" type="text" placeholder="MM/YYYY" value={exp.startDate} onChange={(e) => handleArrayChange('experience', expIndex, 'startDate', e.target.value)} />
                <Input label="End Date" type="text" placeholder="MM/YYYY or Present" value={exp.endDate} onChange={(e) => handleArrayChange('experience', expIndex, 'endDate', e.target.value)} />
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-textPrimary mb-1">Responsibilities/Achievements (bullet points)</label>
                {exp.responsibilities.map((resp, respIndex) => (
                    <div key={respIndex} className="flex items-center mb-1">
                        <TextArea containerClassName="flex-grow mb-0" value={resp} onChange={(e) => handleResponsibilityChange(expIndex, respIndex, e.target.value)} rows={1} placeholder="e.g., Led a team of 5 developers..."/>
                        {exp.responsibilities.length > 1 && (
                           <Button type="button" variant="danger" size="sm" onClick={() => removeResponsibility(expIndex, respIndex)} className="ml-2 p-1 text-xs">X</Button>
                        )}
                    </div>
                ))}
                <Button type="button" variant="ghost" size="sm" onClick={() => addResponsibility(expIndex)} className="mt-1">Add Bullet Point</Button>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => handleAIGenerateResponsibilities(expIndex)} disabled={loading} className="my-2">
                {loading && profile.experience[expIndex].responsibilities.join('') === '' ? 'Generating...' : '✨ AI Gen Responsibilities'}
              </Button>
              {profile.experience.length > 1 && (
                <Button type="button" variant="danger" size="sm" onClick={() => removeItem('experience', expIndex)} className="absolute top-2 right-2">
                  Remove This Experience
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="secondary" onClick={() => addItem('experience')}>Add Experience</Button>
        </Card>

        <Card title="Education" className="mt-6">
          {profile.education.map((edu, index) => (
            <div key={edu.id} className="mb-6 p-4 border border-gray-200 rounded-md relative">
             <h4 className="font-semibold mb-2 text-textPrimary">Education #{index + 1}</h4>
              <Input label="Institution Name" value={edu.institution} onChange={(e) => handleArrayChange('education', index, 'institution', e.target.value)} />
              <Input label="Degree" value={edu.degree} onChange={(e) => handleArrayChange('education', index, 'degree', e.target.value)} />
              <Input label="Field of Study" value={edu.fieldOfStudy} onChange={(e) => handleArrayChange('education', index, 'fieldOfStudy', e.target.value)} />
              <Input label="Graduation Date" type="text" placeholder="MM/YYYY or Expected MM/YYYY" value={edu.graduationDate} onChange={(e) => handleArrayChange('education', index, 'graduationDate', e.target.value)} />
              {profile.education.length > 1 && (
                <Button type="button" variant="danger" size="sm" onClick={() => removeItem('education', index)} className="absolute top-2 right-2">
                 Remove This Education
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="secondary" onClick={() => addItem('education')}>Add Education</Button>
        </Card>
        
        <div className="mt-8 flex justify-end">
          <Button type="submit" size="lg" isLoading={loading} disabled={loading}>
            {loading ? 'Generating CV...' : 'Generate CV Content'}
          </Button>
        </div>
      </form>

      {generatedCVText && (
        <Card title="Generated CV Content (ATS-Friendly Text)" className="mt-8">
          <p className="text-sm text-textSecondary mb-2">This is a plain text version of your CV, optimized for Applicant Tracking Systems. You can copy this to a document editor for further formatting (e.g., PDF/DOCX).</p>
          <TextArea
            value={generatedCVText}
            readOnly
            rows={20}
            className="font-mono text-sm bg-gray-50"
          />
        </Card>
      )}
    </div>
  );
};

export default CVGeneratorPage;