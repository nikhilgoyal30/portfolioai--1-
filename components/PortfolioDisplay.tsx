import React from 'react';
import { UserProfile, Project, Experience, Education } from '../types'; // Assuming types are in ../types

interface PortfolioDisplayProps {
  portfolioData: UserProfile;
}

const PortfolioDisplay: React.FC<PortfolioDisplayProps> = ({ portfolioData }) => {
  const { name, title, bio, email, phone, linkedin, github, skills, projects, experience, education } = portfolioData;

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg text-textPrimary">
      {/* Header */}
      {name && <h1 className="text-4xl font-bold text-primary mb-1 text-center">{name}</h1>}
      {title && <h2 className="text-2xl text-textSecondary mb-6 text-center">{title}</h2>}

      {/* Contact Info */}
      {(email || phone || linkedin || github) && (
         <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold text-primary mb-3 border-b pb-2">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {email && (
                    <p><strong>Email:</strong> <a href={`mailto:${email}`} className="text-primary hover:underline">{email}</a></p>
                )}
                {phone && <p><strong>Phone:</strong> {phone}</p>}
                {linkedin && (
                    <p><strong>LinkedIn:</strong> <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{linkedin}</a></p>
                )}
                {github && (
                    <p><strong>GitHub:</strong> <a href={github} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{github}</a></p>
                )}
            </div>
        </div>
      )}
      
      {/* Bio / Summary */}
      {bio && (
        <section className="mb-8">
          <h3 className="text-2xl font-semibold text-primary mb-3 border-b pb-2">About Me</h3>
          <p className="text-textPrimary leading-relaxed whitespace-pre-line">{bio}</p>
        </section>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <section className="mb-8">
          <h3 className="text-2xl font-semibold text-primary mb-3 border-b pb-2">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span key={index} className="bg-secondary-light text-secondary-dark text-sm font-medium px-3 py-1 rounded-full">
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <section className="mb-8">
          <h3 className="text-2xl font-semibold text-primary mb-3 border-b pb-2">Experience</h3>
          {experience.map((exp: Experience) => (
            <div key={exp.id} className="mb-6 p-4 border border-gray-200 rounded-md shadow-sm">
              <h4 className="text-xl font-bold text-gray-700">{exp.title}</h4>
              <p className="text-md text-gray-600 font-semibold">{exp.company}</p>
              <p className="text-sm text-gray-500 mb-2">{exp.startDate} - {exp.endDate}</p>
              {exp.responsibilities && exp.responsibilities.length > 0 && (
                <ul className="list-disc list-inside text-textPrimary space-y-1 pl-4 text-sm">
                  {exp.responsibilities.map((responsibility, i) => (
                    <li key={i}>{responsibility}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <section className="mb-8">
          <h3 className="text-2xl font-semibold text-primary mb-3 border-b pb-2">Projects</h3>
          {projects.map((project: Project) => (
            <div key={project.id} className="mb-6 p-4 border border-gray-200 rounded-md shadow-sm">
              <h4 className="text-xl font-bold text-gray-700">{project.name}</h4>
              {project.description && <p className="text-textPrimary my-2 text-sm leading-relaxed">{project.description}</p>}
              {project.technologies && project.technologies.length > 0 && (
                <div className="my-2">
                  <p className="text-sm font-semibold text-textPrimary mb-1">Technologies Used:</p>
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.map((tech, index) => (
                      <span key={index} className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-3 space-x-4">
                {project.url && (
                  <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm font-medium">
                    View Project
                  </a>
                )}
                {project.repoUrl && (
                  <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm font-medium">
                    View Code
                  </a>
                )}
              </div>
            </div>
          ))}
        </section>
      )}
      
      {/* Education */}
      {education && education.length > 0 && (
        <section className="mb-8">
          <h3 className="text-2xl font-semibold text-primary mb-3 border-b pb-2">Education</h3>
          {education.map((edu: Education) => (
            <div key={edu.id} className="mb-4 p-4 border border-gray-200 rounded-md shadow-sm">
              <h4 className="text-xl font-bold text-gray-700">{edu.degree} in {edu.fieldOfStudy}</h4>
              <p className="text-md text-gray-600 font-semibold">{edu.institution}</p>
              <p className="text-sm text-gray-500">{edu.graduationDate}</p>
            </div>
          ))}
        </section>
      )}

    </div>
  );
};

export default PortfolioDisplay;
