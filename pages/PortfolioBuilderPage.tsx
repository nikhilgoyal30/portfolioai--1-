
import React, { useState, useCallback } from 'react';
import Card from '../components/Card';
import Input from '../components/Input';
import TextArea from '../components/TextArea';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import PortfolioDisplay from '../components/PortfolioDisplay'; // Import the new component
import { UserProfile, Project, AlertType, Experience, Education } from '../types';
import { generateText, generateJson } from '../services/geminiService';

const initialUserProfile: UserProfile = {
  name: '',
  title: '',
  bio: '',
  email: '',
  phone: '',
  linkedin: '',
  github: '',
  skills: [],
  projects: [{ id: 'proj1', name: '', description: '', technologies: [], url: '', repoUrl: '' }],
  experience: [{ id: 'exp1', title: '', company: '', startDate: '', endDate: '', responsibilities: [''] }],
  education: [{ id: 'edu1', institution: '', degree: '', fieldOfStudy: '', graduationDate: '' }],
};

const PortfolioBuilderPage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(initialUserProfile);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [portfolioJsonData, setPortfolioJsonData] = useState<UserProfile | null>(null); // For structured data
  const [generatedPortfolioHtml, setGeneratedPortfolioHtml] = useState<string | null>(null); // For raw HTML fallback

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSkillChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile(prev => ({ ...prev, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s) }));
  }, []);

  const handleProjectChange = useCallback((index: number, field: keyof Project, value: string | string[]) => {
    setProfile(prev => ({
      ...prev,
      projects: prev.projects.map((p, i) =>
        i === index ? { ...p, [field]: Array.isArray(value) ? value : value } : p
      ),
    }));
  }, []);
  
  const addProject = useCallback(() => {
    setProfile(prev => ({
      ...prev,
      projects: [...prev.projects, { id: `proj${prev.projects.length + 1}`, name: '', description: '', technologies: [], url: '', repoUrl: '' }],
    }));
  }, []);

  const removeProject = useCallback((index: number) => {
    setProfile(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  }, []);

  // Handlers for Experience (similar to projects)
  const handleExperienceChange = useCallback((index: number, field: keyof Experience, value: string | string[]) => {
    setProfile(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === index ? { ...exp, [field]: Array.isArray(value) ? value.filter(s=>s.trim()) : value } : exp // Ensure responsibilities are filtered
      ),
    }));
  }, []);

  const addExperience = useCallback(() => {
    setProfile(prev => ({
      ...prev,
      experience: [...prev.experience, { id: `exp${prev.experience.length + 1}`, title: '', company: '', startDate: '', endDate: '', responsibilities: [''] }],
    }));
  }, []);

  const removeExperience = useCallback((index: number) => {
    setProfile(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  }, []);
  
  const handleResponsibilityChange = (expIndex: number, respIndex: number, value: string) => {
    setProfile(prev => {
      const newExperience = [...prev.experience];
      newExperience[expIndex].responsibilities[respIndex] = value;
      return { ...prev, experience: newExperience };
    });
  };

  const addResponsibility = (expIndex: number) => {
    setProfile(prev => {
      const newExperience = [...prev.experience];
      newExperience[expIndex].responsibilities.push('');
      return { ...prev, experience: newExperience };
    });
  };

  const removeResponsibility = (expIndex: number, respIndex: number) => {
    setProfile(prev => {
      const newExperience = [...prev.experience];
      newExperience[expIndex].responsibilities = newExperience[expIndex].responsibilities.filter((_, i) => i !== respIndex);
      if (newExperience[expIndex].responsibilities.length === 0) { // Add an empty one if all removed
        newExperience[expIndex].responsibilities.push('');
      }
      return { ...prev, experience: newExperience };
    });
  };


  // Handlers for Education
  const handleEducationChange = useCallback((index: number, field: keyof Education, value: string) => {
     setProfile(prev => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      ),
    }));
  }, []);

  const addEducation = useCallback(() => {
    setProfile(prev => ({
      ...prev,
      education: [...prev.education, { id: `edu${prev.education.length + 1}`, institution: '', degree: '', fieldOfStudy: '', graduationDate: '' }],
    }));
  }, []);

  const removeEducation = useCallback((index: number) => {
    setProfile(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  }, []);


  const handleAIGenerateBio = async () => {
    if (!profile.name || profile.skills.length === 0) {
      setError("Please provide your name and some skills to generate a bio.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const prompt = `Generate a compelling professional bio for ${profile.name}, a ${profile.title || 'professional'} with skills in ${profile.skills.join(', ')}. Highlight key strengths and career aspirations. Make it around 100-150 words.`;
      const bio = await generateText(prompt, "You are an expert career branding assistant.");
      setProfile(prev => ({ ...prev, bio }));
      setSuccessMessage("Bio generated successfully!");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate bio.");
      setSuccessMessage(null);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAIGenerateProjectDescription = async (projectIndex: number) => {
    const project = profile.projects[projectIndex];
    if (!project.name || project.technologies.length === 0) {
      setError("Please provide project name and technologies to generate a description.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const prompt = `Generate a concise and impactful project description for a project named "${project.name}" which uses technologies like ${project.technologies.join(', ')}. Focus on the project's purpose and key features. About 50-75 words.`;
      const description = await generateText(prompt, "You are an expert technical writer specializing in project summaries.");
      handleProjectChange(projectIndex, 'description', description);
      setSuccessMessage(`Description for ${project.name} generated!`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate project description.");
      setSuccessMessage(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    setGeneratedPortfolioHtml(null);
    setPortfolioJsonData(null);

    try {
      const portfolioObjectPrompt = `
        Generate a JSON object representing a user's portfolio, strictly conforming to the following TypeScript interface structure:
        interface Project { id: string; name: string; description: string; technologies: string[]; url?: string; repoUrl?: string; }
        interface Experience { id: string; title: string; company: string; startDate: string; endDate: string; responsibilities: string[]; }
        interface Education { id: string; institution: string; degree: string; fieldOfStudy: string; graduationDate: string; }
        interface UserProfile {
          name: string; title: string; bio: string; email: string; phone?: string; linkedin?: string; github?: string;
          skills: string[]; projects: Project[]; experience: Experience[]; education: Education[];
        }
        
        Populate the UserProfile JSON object based on this data:
        Name: ${profile.name}
        Title: ${profile.title}
        Bio: "${profile.bio.replace(/"/g, '\\"')}"
        Email: ${profile.email}
        Phone: ${profile.phone || ''}
        LinkedIn: ${profile.linkedin || ''}
        GitHub: ${profile.github || ''}
        Skills: [${profile.skills.map(s => `"${s.replace(/"/g, '\\"')}"`).join(', ')}]
        Projects: [${profile.projects.map(p => `{ "id": "${p.id}", "name": "${p.name.replace(/"/g, '\\"')}", "description": "${p.description.replace(/"/g, '\\"')}", "technologies": [${p.technologies.map(t => `"${t.replace(/"/g, '\\"')}"`).join(', ')}], "url": "${p.url || ''}", "repoUrl": "${p.repoUrl || ''}" }`).join(', ')}]
        Experience: [${profile.experience.map(exp => `{ "id": "${exp.id}", "title": "${exp.title.replace(/"/g, '\\"')}", "company": "${exp.company.replace(/"/g, '\\"')}", "startDate": "${exp.startDate}", "endDate": "${exp.endDate}", "responsibilities": [${exp.responsibilities.map(r => `"${r.replace(/"/g, '\\"')}"`).join(', ')}] }`).join(', ')}]
        Education: [${profile.education.map(edu => `{ "id": "${edu.id}", "institution": "${edu.institution.replace(/"/g, '\\"')}", "degree": "${edu.degree.replace(/"/g, '\\"')}", "fieldOfStudy": "${edu.fieldOfStudy.replace(/"/g, '\\"')}", "graduationDate": "${edu.graduationDate}" }`).join(', ')}]
        
        Provide only the complete JSON object as the output. Do not include any other text or markdown such as \`\`\`json.
        If an optional field (phone, linkedin, github, project url, repoUrl) is empty, either omit it or set its value to an empty string in the JSON.
        Ensure all string values within the JSON are properly escaped.
        `;
      
      const structuredPortfolio = await generateJson<UserProfile>(portfolioObjectPrompt, "You are an AI assistant that structures user data into a UserProfile JSON object.");

      if (structuredPortfolio && structuredPortfolio.name) {
        setPortfolioJsonData(structuredPortfolio);
        setSuccessMessage("Portfolio content generated successfully for display!");
      } else {
        setError("Failed to generate structured portfolio data. Attempting raw HTML generation as fallback...");
        const portfolioHtmlPrompt = `
          Create a simple, modern, single-page HTML portfolio for ${profile.name}. Use inline Tailwind CSS.
          Include: Name, Title, Bio: "${profile.bio}", Skills: ${profile.skills.join(', ')},
          Projects: ${profile.projects.map(p => `Name: ${p.name}, Desc: ${p.description}, Tech: ${p.technologies.join(', ')}`).join('; ')},
          Contact: Email: ${profile.email}, LinkedIn: ${profile.linkedin || ''}, GitHub: ${profile.github || ''}.
          The output should be a single block of HTML code.
        `;
        const htmlContent = await generateText(portfolioHtmlPrompt, "You are an AI web developer that creates HTML with Tailwind CSS.");
        if (htmlContent.trim().toLowerCase().startsWith('<!doctype html>') || htmlContent.trim().toLowerCase().startsWith('<html>') || htmlContent.trim().toLowerCase().startsWith('<div')) {
          setGeneratedPortfolioHtml(htmlContent);
          setSuccessMessage("Raw HTML portfolio generated as a fallback. JSON generation was not successful.");
          setError(null); 
        } else {
          let errorDetails = "AI failed to generate structured data and also did not return valid HTML. ";
          if(structuredPortfolio){
            errorDetails += `JSON attempt returned: ${JSON.stringify(structuredPortfolio).substring(0,100)}... `
          }
          errorDetails += `HTML attempt returned: ${htmlContent.substring(0, 100)}...`;
          setError(errorDetails);
        }
      }
    } catch (err) {
      console.error("Error during portfolio generation:", err);
      setError(err instanceof Error ? `Portfolio Generation Error: ${err.message}` : "An unknown error occurred during portfolio generation.");
      setPortfolioJsonData(null);
      setGeneratedPortfolioHtml(null);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-6 pb-12">
      {error && <Alert type={AlertType.ERROR} message={error} onClose={() => setError(null)} />}
      {successMessage && <Alert type={AlertType.SUCCESS} message={successMessage} onClose={() => setSuccessMessage(null)} />}

      <form onSubmit={handleSubmit}>
        <Card title="Personal Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name" name="name" value={profile.name} onChange={handleChange} required />
            <Input label="Professional Title (e.g., Software Engineer)" name="title" value={profile.title} onChange={handleChange} required />
          </div>
          <TextArea label="Bio / About Me" name="bio" value={profile.bio} onChange={handleChange} rows={5} />
          <Button type="button" variant="outline" size="sm" onClick={handleAIGenerateBio} disabled={loading && profile.bio === ''} isLoading={loading && profile.bio === ''}>
            {loading && profile.bio === '' ? 'Generating...' : '✨ AI Generate Bio'}
          </Button>
        </Card>

        <Card title="Contact Information" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Email" name="email" type="email" value={profile.email} onChange={handleChange} required />
            <Input label="Phone (Optional)" name="phone" type="tel" value={profile.phone} onChange={handleChange} />
            <Input label="LinkedIn Profile URL (Optional)" name="linkedin" type="url" value={profile.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/yourprofile"/>
            <Input label="GitHub Profile URL (Optional)" name="github" type="url" value={profile.github} onChange={handleChange} placeholder="https://github.com/yourusername" />
          </div>
        </Card>

        <Card title="Skills" className="mt-6">
          <Input 
            label="Skills (comma-separated)" 
            name="skills" 
            value={profile.skills.join(', ')} 
            onChange={handleSkillChange} 
            placeholder="e.g., React, TypeScript, Node.js, Agile" 
          />
        </Card>
        
        {/* Experience Section in Form */}
        <Card title="Work Experience" className="mt-6">
          {profile.experience.map((exp, index) => (
            <div key={exp.id} className="mb-6 p-4 border border-gray-200 rounded-md relative">
              <h4 className="font-semibold mb-2 text-textPrimary">Experience #{index + 1}</h4>
              <Input label="Job Title" value={exp.title} onChange={(e) => handleExperienceChange(index, 'title', e.target.value)} />
              <Input label="Company" value={exp.company} onChange={(e) => handleExperienceChange(index, 'company', e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                  <Input label="Start Date" type="text" placeholder="MM/YYYY" value={exp.startDate} onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)} />
                  <Input label="End Date" type="text" placeholder="MM/YYYY or Present" value={exp.endDate} onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)} />
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-textPrimary mb-1">Responsibilities (one per line or AI generate)</label>
                {exp.responsibilities.map((resp, respIndex) => (
                  <div key={respIndex} className="flex items-center mb-1">
                    <TextArea containerClassName="flex-grow mb-0" value={resp} onChange={(e) => handleResponsibilityChange(index, respIndex, e.target.value)} rows={1} placeholder={`Responsibility ${respIndex + 1}`}/>
                    {exp.responsibilities.length > 1 && (
                      <Button type="button" variant="danger" size="sm" onClick={() => removeResponsibility(index, respIndex)} className="ml-2 p-1 text-xs">X</Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="ghost" size="sm" onClick={() => addResponsibility(index)} className="mt-1 text-xs">Add Responsibility</Button>
              </div>
              {profile.experience.length > 1 && (
                <Button type="button" variant="danger" size="sm" onClick={() => removeExperience(index)} className="absolute top-2 right-2">Remove</Button>
              )}
            </div>
          ))}
          <Button type="button" variant="secondary" onClick={addExperience}>Add Experience</Button>
        </Card>

        {/* Education Section in Form */}
        <Card title="Education" className="mt-6">
          {profile.education.map((edu, index) => (
            <div key={edu.id} className="mb-6 p-4 border border-gray-200 rounded-md relative">
              <h4 className="font-semibold mb-2 text-textPrimary">Education #{index + 1}</h4>
              <Input label="Institution Name" value={edu.institution} onChange={(e) => handleEducationChange(index, 'institution', e.target.value)} />
              <Input label="Degree" value={edu.degree} onChange={(e) => handleEducationChange(index, 'degree', e.target.value)} />
              <Input label="Field of Study" value={edu.fieldOfStudy} onChange={(e) => handleEducationChange(index, 'fieldOfStudy', e.target.value)} />
              <Input label="Graduation Date" type="text" placeholder="MM/YYYY or Expected MM/YYYY" value={edu.graduationDate} onChange={(e) => handleEducationChange(index, 'graduationDate', e.target.value)} />
              {profile.education.length > 1 && (
                <Button type="button" variant="danger" size="sm" onClick={() => removeEducation(index)} className="absolute top-2 right-2">Remove</Button>
              )}
            </div>
          ))}
          <Button type="button" variant="secondary" onClick={addEducation}>Add Education</Button>
        </Card>

        <Card title="Projects" className="mt-6">
          {profile.projects.map((project, index) => (
            <div key={project.id} className="mb-6 p-4 border border-gray-200 rounded-md relative">
              <Input
                label={`Project ${index + 1} Name`}
                value={project.name}
                onChange={(e) => handleProjectChange(index, 'name', e.target.value)}
                required
              />
              <TextArea
                label="Description"
                value={project.description}
                onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                rows={3}
              />
               <Button type="button" variant="outline" size="sm" onClick={() => handleAIGenerateProjectDescription(index)} disabled={loading && profile.projects[index].description === ''} className="my-2">
                {loading && profile.projects[index].description === '' ? 'Generating...' : '✨ AI Gen Desc.'}
              </Button>
              <Input
                label="Technologies (comma-separated)"
                value={project.technologies.join(', ')}
                onChange={(e) => handleProjectChange(index, 'technologies', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                placeholder="e.g., Next.js, Tailwind CSS, Supabase"
              />
              <Input
                label="Project URL (Optional)"
                type="url"
                value={project.url || ''}
                onChange={(e) => handleProjectChange(index, 'url', e.target.value)}
                placeholder="https://yourprojectlive.com"
              />
              <Input
                label="Repository URL (Optional)"
                type="url"
                value={project.repoUrl || ''}
                onChange={(e) => handleProjectChange(index, 'repoUrl', e.target.value)}
                placeholder="https://github.com/user/project-repo"
              />
              {profile.projects.length > 1 && (
                <Button type="button" variant="danger" size="sm" onClick={() => removeProject(index)} className="absolute top-2 right-2">
                  Remove
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="secondary" onClick={addProject}>Add Another Project</Button>
        </Card>
        
        <div className="mt-8 flex justify-end">
          <Button type="submit" size="lg" isLoading={loading} disabled={loading}>
            {loading ? 'Generating Portfolio...' : 'Generate Portfolio Content'}
          </Button>
        </div>
      </form>

      {/* Preview Section */}
      {portfolioJsonData && (
        <Card title="Generated Portfolio Preview" className="mt-8">
          <PortfolioDisplay portfolioData={portfolioJsonData} />
        </Card>
      )}

      {!portfolioJsonData && generatedPortfolioHtml && (
        <Card title="Generated Portfolio Preview (Raw HTML)" className="mt-8">
          <p className="text-sm text-textSecondary mb-2">
            Displaying raw HTML as structured data generation was not successful. You can copy and save this as an HTML file.
          </p>
          <div className="p-4 border border-gray-300 rounded-md bg-gray-50 max-h-96 overflow-y-auto">
            <div dangerouslySetInnerHTML={{ __html: generatedPortfolioHtml }} />
          </div>
           <TextArea
            label="Portfolio HTML Code (Fallback)"
            value={generatedPortfolioHtml}
            readOnly
            rows={10}
            className="mt-4 font-mono text-sm"
          />
        </Card>
      )}
    </div>
  );
};

export default PortfolioBuilderPage;
    