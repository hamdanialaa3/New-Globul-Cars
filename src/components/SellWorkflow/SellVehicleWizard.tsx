
import React from 'react';
import { WizardOrchestrator } from './WizardOrchestrator';
import { logger } from '../../services/logger-service';
import { AlertTriangle } from 'lucide-react';

interface SellVehicleWizardProps {
  initialStep?: number;
  onComplete: () => void;
  onCancel: () => void;
  initialVehicleType?: string;
  mode?: 'create' | 'edit';
  existingCarId?: string;
}

// Error Boundary Implementation
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('SellWizard Error Boundary caught error', error, { errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center bg-white rounded-lg shadow-lg border border-red-100">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-xl font-bold mb-2 text-gray-900">Something went wrong</h3>
          <p className="text-gray-600 mb-6">We saved your progress locally. Please try refreshing the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const SellVehicleWizard: React.FC<SellVehicleWizardProps> = (props) => (
  <ErrorBoundary>
    <WizardOrchestrator
      onComplete={props.onComplete}
      onCancel={props.onCancel}
    />
  </ErrorBoundary>
);

export default SellVehicleWizard;
