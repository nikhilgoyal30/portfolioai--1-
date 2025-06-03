
import React, { useState } from 'react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Select from '../components/Select';
import Alert from '../components/Alert';
import { JobAlert, AlertType } from '../types'; // Assuming JobAlert type is defined

interface AlertSettings {
  keywords: string;
  sources: string[];
  frequency: 'daily' | 'weekly' | 'instant';
  location: string;
}

const availableSources = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'indeed', label: 'Indeed' },
  { value: 'wellfound', label: 'Wellfound (AngelList)' },
  { value: 'company_rss', label: 'Company Careers RSS (Example)' },
];

const JobAlertsPage: React.FC = () => {
  const [settings, setSettings] = useState<AlertSettings>({
    keywords: '',
    sources: ['linkedin'],
    frequency: 'daily',
    location: '',
  });
  const [mockAlerts, setMockAlerts] = useState<JobAlert[]>([]);
  const [message, setMessage] = useState<{ type: AlertType; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setSettings(prev => ({ ...prev, sources: selectedOptions }));
  };
  
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save settings to a backend and trigger alert processing.
    console.log("Saving alert settings:", settings);
    setMessage({ type: AlertType.SUCCESS, text: 'Job alert settings saved! (Simulated)' });
    
    // Simulate fetching some alerts
    setMockAlerts([
      { id: '1', title: `Software Engineer - ${settings.keywords || 'React'}`, company: 'Tech Solutions Inc.', location: settings.location || 'Remote', description: 'Exciting opportunity for a skilled engineer...', url: '#', source: settings.sources[0] || 'linkedin', datePosted: new Date().toLocaleDateString() },
      { id: '2', title: `Frontend Developer - ${settings.keywords || 'JavaScript'}`, company: 'Web Innovations LLC', location: settings.location || 'New York, NY', description: 'Join our dynamic frontend team...', url: '#', source: settings.sources[0] || 'linkedin', datePosted: new Date(Date.now() - 86400000).toLocaleDateString() },
    ]);
  };

  return (
    <div className="space-y-6">
      {message && <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />}

      <Card title="Configure Job Alerts">
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <Input
            label="Keywords (e.g., React Developer, Product Manager)"
            name="keywords"
            value={settings.keywords}
            onChange={handleChange}
            placeholder="Enter job titles, skills, or company names"
            required
          />
          <Input
            label="Location (e.g., Remote, New York, San Francisco)"
            name="location"
            value={settings.location}
            onChange={handleChange}
            placeholder="Leave blank for worldwide"
          />
          <div>
            <label htmlFor="sources" className="block text-sm font-medium text-textPrimary mb-1">Job Sources (Ctrl/Cmd + Click to select multiple)</label>
            <select
              id="sources"
              name="sources"
              multiple
              value={settings.sources}
              onChange={handleSourceChange}
              className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary h-32"
            >
              {availableSources.map(source => (
                <option key={source.value} value={source.value}>{source.label}</option>
              ))}
            </select>
          </div>
          <Select
            label="Alert Frequency"
            name="frequency"
            value={settings.frequency}
            onChange={handleChange}
            options={[
              { value: 'instant', label: 'Instant (As available)' },
              { value: 'daily', label: 'Daily Digest' },
              { value: 'weekly', label: 'Weekly Summary' },
            ]}
          />
          <div className="flex justify-end">
            <Button type="submit" variant="primary">Save Alert Settings</Button>
          </div>
        </form>
      </Card>

      {mockAlerts.length > 0 && (
        <Card title="Recent Job Alerts (Simulated)" className="mt-6">
          <div className="space-y-4">
            {mockAlerts.map(alert => (
              <div key={alert.id} className="p-4 border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-primary">{alert.title}</h3>
                <p className="text-sm text-textPrimary">{alert.company} - {alert.location}</p>
                <p className="text-xs text-textSecondary mt-1">Source: {alert.source} | Posted: {alert.datePosted}</p>
                <p className="text-sm text-textSecondary mt-2 truncate">{alert.description}</p>
                <div className="mt-3 flex space-x-2">
                    <Button variant="secondary" size="sm" onClick={() => window.open(alert.url, '_blank')}>View Job</Button>
                    <Button variant="outline" size="sm">Apply with Profile (Simulated)</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
       {mockAlerts.length === 0 && settings.keywords && (
        <Card className="mt-6">
            <p className="text-textSecondary text-center py-4">No simulated alerts match your current criteria. Try saving settings to see examples.</p>
        </Card>
       )}
    </div>
  );
};

export default JobAlertsPage;
