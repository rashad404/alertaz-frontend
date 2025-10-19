"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import alertsService, { AlertType, PersonalAlert, ChannelValidationResponse } from '@/lib/api/alerts';
import authService from '@/lib/api/auth';
import ServiceSelection from './steps/ServiceSelection';
import AssetSelection from './steps/AssetSelection';
import ConditionBuilder from './steps/ConditionBuilder';
import NotificationChannels from './steps/NotificationChannels';
import AlertConfirmation from './steps/AlertConfirmation';

export interface WizardData {
  alertType?: AlertType;
  asset?: string;
  name?: string;
  conditions?: {
    field: string;
    operator: string;
    value: number | string;
  };
  notification_channels?: string[];
  check_frequency?: number;
  is_recurring?: boolean;
}

interface AlertCreationWizardProps {
  onComplete?: (alert: PersonalAlert) => void;
  onCancel?: () => void;
}

const AlertCreationWizard: React.FC<AlertCreationWizardProps> = ({ onComplete, onCancel }) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [alertTypes, setAlertTypes] = useState<AlertType[]>([]);
  const [wizardData, setWizardData] = useState<WizardData>({
    check_frequency: 300,
    is_recurring: true,
  });
  const [channelValidation, setChannelValidation] = useState<ChannelValidationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthentication();
    loadAlertTypes();
  }, []);

  const checkAuthentication = async () => {
    const user = await authService.getCurrentUser();
    setIsAuthenticated(!!user);

    if (!user && typeof window !== 'undefined') {
      // Store current URL for returning after authentication
      authService.setReturnUrl(window.location.pathname + window.location.search);
    }
  };

  const loadAlertTypes = async () => {
    try {
      const types = await alertsService.getAlertTypes();
      setAlertTypes(types);
    } catch (error) {
      console.error('Failed to load alert types:', error);
      setError('Failed to load alert types. Please try again.');
    }
  };

  const validateChannels = async (channels: string[]) => {
    try {
      const validation = await alertsService.validateChannels(channels);
      setChannelValidation(validation);
      return validation;
    } catch (error) {
      console.error('Failed to validate channels:', error);
      return null;
    }
  };

  const handleNext = async () => {
    if (!isAuthenticated && currentStep === 4) {
      // Redirect to authentication if not logged in
      router.push('/auth/login?return=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (currentStep === 4) {
      // Validate channels before moving to confirmation
      const validation = await validateChannels(wizardData.notification_channels || []);
      if (!validation || !validation.all_channels_ready) {
        setError('Please configure all selected notification channels first.');
        return;
      }
    }

    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDataUpdate = (data: Partial<WizardData>) => {
    setWizardData(prev => ({ ...prev, ...data }));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login?return=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (!wizardData.alertType || !wizardData.name || !wizardData.conditions || !wizardData.notification_channels?.length) {
      setError('Please complete all required fields.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const alertData: PersonalAlert = {
        alert_type_id: wizardData.alertType.id,
        name: wizardData.name,
        asset: wizardData.asset,
        conditions: wizardData.conditions as any,
        notification_channels: wizardData.notification_channels,
        check_frequency: wizardData.check_frequency,
        is_recurring: wizardData.is_recurring,
      };

      const createdAlert = await alertsService.createAlert(alertData);

      if (onComplete) {
        onComplete(createdAlert);
      } else {
        router.push('/alerts');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create alert. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Select Service', component: ServiceSelection },
    { number: 2, title: 'Choose Asset', component: AssetSelection },
    { number: 3, title: 'Set Conditions', component: ConditionBuilder },
    { number: 4, title: 'Notification Channels', component: NotificationChannels },
    { number: 5, title: 'Confirm & Create', component: AlertConfirmation },
  ];

  const StepComponent = steps[currentStep - 1].component;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`flex items-center ${step.number < steps.length ? 'flex-1' : ''}`}
            >
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold
                  ${currentStep >= step.number
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                  }
                `}
              >
                {currentStep > step.number ? '✓' : step.number}
              </div>
              {step.number < steps.length && (
                <div
                  className={`h-1 flex-1 mx-2 ${
                    currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {steps[currentStep - 1].title}
          </h2>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <StepComponent
          data={wizardData}
          onUpdate={handleDataUpdate}
          alertTypes={alertTypes}
          channelValidation={channelValidation}
          onValidateChannels={validateChannels}
          isAuthenticated={isAuthenticated}
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={currentStep === 1 ? onCancel : handleBack}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          {currentStep === 1 ? 'Cancel' : 'Back'}
        </button>

        {currentStep < 5 ? (
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Create Alert'}
          </button>
        )}
      </div>
    </div>
  );
};

export default AlertCreationWizard;