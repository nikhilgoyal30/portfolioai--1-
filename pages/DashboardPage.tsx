import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import { NAVIGATION_ITEMS } from '../constants';

const DashboardPage: React.FC = () => {
  const features = NAVIGATION_ITEMS.filter(item => item.path !== '/dashboard');

  return (
    <div className="space-y-6">
      <Card title="Welcome to PortfolioAI!">
        <p className="text-textSecondary mb-4">
          Your all-in-one solution for building a compelling personal brand and accelerating your job search.
          Get started by exploring the tools below.
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Card key={feature.path} title={feature.name} className="hover:shadow-xl transition-shadow duration-300">
            <div className="flex flex-col items-center text-center space-y-3 p-4">
              <div className="text-primary text-4xl mb-2">
                {React.cloneElement(feature.icon as React.ReactElement<React.SVGProps<SVGSVGElement>>, { className: "w-12 h-12" })}
              </div>
              <p className="text-textSecondary text-sm h-16">
                {/* Placeholder descriptions, can be more specific */}
                {feature.name === 'Portfolio Builder' && 'Create a stunning online portfolio in minutes.'}
                {feature.name === 'CV Generator' && 'Generate an ATS-friendly CV tailored to your profile.'}
                {feature.name === 'Cover Letter Writer' && 'Craft compelling cover letters for specific jobs.'}
                {feature.name === 'Mock Interviewer' && 'Practice your interview skills with AI-driven feedback.'}
                {feature.name === 'Job Alerts' && 'Get personalized job opening alerts from various sources.'}
                {feature.name === 'Career Coaching' && 'Receive AI-powered career advice and skill analysis.'}
              </p>
              <Link to={feature.path} className="w-full">
                <Button variant="primary" fullWidth>
                  Go to {feature.name.split(' ')[0]}
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <Card title="Quick Tips">
        <ul className="list-disc list-inside text-textSecondary space-y-2">
          <li>Start by building your portfolio or generating a CV.</li>
          <li>Use the AI Cover Letter writer to tailor applications for specific roles.</li>
          <li>Practice common interview questions with our AI Mock Interviewer.</li>
          <li>Set up Job Alerts to stay updated on new opportunities.</li>
        </ul>
      </Card>
    </div>
  );
};

export default DashboardPage;