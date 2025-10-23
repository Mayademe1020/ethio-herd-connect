
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Syringe, AlertTriangle, Calendar, Activity } from 'lucide-react';
import { useDateDisplay } from '@/hooks/useDateDisplay';

interface HealthDetailViewProps {
  language: 'am' | 'en';
  type: string;
  onBack: () => void;
}

export const HealthDetailView = ({ language, type, onBack }: HealthDetailViewProps) => {
  const mockHealthData = {
    vaccinations: [
      { id: '1', animal: 'ሞላ', vaccine: 'FMD', date: '2024-06-15', status: 'completed' },
      { id: '2', animal: 'አበባ', vaccine: 'Anthrax', date: '2024-06-10', status: 'completed' },
      { id: '3', animal: 'ገብሬ', vaccine: 'PPR', date: '2024-06-12', status: 'completed' }
    ],
    scheduled: [
      { id: '1', animal: 'ሞላ', task: 'Booster vaccination', date: '2024-06-25', type: 'vaccination' },
      { id: '2', animal: 'አበባ', task: 'Health checkup', date: '2024-06-28', type: 'checkup' }
    ],
    attention: [
      { id: '1', animal: 'ገብሬ', issue: 'Mild cough', severity: 'low', reported: '2024-06-18' }
    ]
  };

  const getTitle = () => {
    switch (type) {
      case 'vaccinations':
        return language === 'am' ? 'የክትባት መዝገቦች' : 'Vaccination Records';
      case 'scheduled':
        return language === 'am' ? 'የተመደቡ ስራዎች' : 'Scheduled Tasks';
      case 'attention':
        return language === 'am' ? 'ትኩረት የሚፈልጉ' : 'Need Attention';
      default:
        return language === 'am' ? 'የጤንነት ዝርዝር' : 'Health Details';
    }
  };

  const getData = () => {
    switch (type) {
      case 'vaccinations':
        return mockHealthData.vaccinations;
      case 'scheduled':
        return mockHealthData.scheduled;
      case 'attention':
        return mockHealthData.attention;
      default:
        return [];
    }
  };

  const renderVaccinations = () => (
    <div className="space-y-3">
      {mockHealthData.vaccinations.map((vaccination, index) => (
        <Card 
          key={vaccination.id} 
          className="hover-scale transition-all duration-300 hover:shadow-md"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Syringe className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">{vaccination.animal}</h4>
                  <p className="text-sm text-gray-600">{vaccination.vaccine}</p>
                  <p className="text-xs text-gray-500">{vaccination.date}</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                {language === 'am' ? 'ተጠናቅቋል' : 'Completed'}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderScheduled = () => (
    <div className="space-y-3">
      {mockHealthData.scheduled.map((task, index) => (
        <Card 
          key={task.id} 
          className="hover-scale transition-all duration-300 hover:shadow-md border-l-4 border-l-orange-500"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-medium">{task.animal}</h4>
                  <p className="text-sm text-gray-600">{task.task}</p>
                  <p className="text-xs text-gray-500">{task.date}</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                {language === 'am' ? 'ቀሪ' : 'Pending'}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderAttention = () => (
    <div className="space-y-3">
      {mockHealthData.attention.map((issue, index) => (
        <Card 
          key={issue.id} 
          className="hover-scale transition-all duration-300 hover:shadow-md border-l-4 border-l-yellow-500"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-medium">{issue.animal}</h4>
                  <p className="text-sm text-gray-600">{issue.issue}</p>
                  <p className="text-xs text-gray-500">
                    {language === 'am' ? 'ሪፖርት ተደርጓል:' : 'Reported:'} {issue.reported}
                  </p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                issue.severity === 'low' 
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {issue.severity === 'low' 
                  ? (language === 'am' ? 'ዝቅተኛ' : 'Low')
                  : (language === 'am' ? 'ከባድ' : 'High')
                }
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderContent = () => {
    switch (type) {
      case 'vaccinations':
        return renderVaccinations();
      case 'scheduled':
        return renderScheduled();
      case 'attention':
        return renderAttention();
      default:
        return <div>No data available</div>;
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="hover-scale transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === 'am' ? 'ተመለስ' : 'Back'}
        </Button>
        <h2 className="text-xl font-semibold">{getTitle()}</h2>
      </div>

      {renderContent()}
    </div>
  );
};
