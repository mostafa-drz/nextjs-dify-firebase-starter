'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { checkEnvStatus, EnvStatus } from '@/lib/config/env-validation';

interface EnvValidationProps {
  showOnError?: boolean;
  className?: string;
}

export function EnvValidation({ showOnError = true, className = '' }: EnvValidationProps) {
  const [envStatus, setEnvStatus] = useState<EnvStatus | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const checkEnvironment = async () => {
    setIsChecking(true);
    try {
      const status = checkEnvStatus();
      setEnvStatus(status);
    } catch (error) {
      console.error('Environment validation error:', error);
      setEnvStatus({
        isValid: false,
        missingVars: [],
        errors: ['Failed to validate environment variables'],
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkEnvironment();
  }, []);

  // Don't render anything if environment is valid and we only show on error
  if (showOnError && envStatus?.isValid) {
    return null;
  }

  // Don't render anything while checking
  if (isChecking) {
    return null;
  }

  // Don't render if no status yet
  if (!envStatus) {
    return null;
  }

  return (
    <div className={className}>
      {envStatus.isValid ? (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            All environment variables are properly configured.
          </AlertDescription>
        </Alert>
      ) : (
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Environment Configuration Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Missing required environment variables. The application may not function correctly.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-red-800">Missing Variables:</h4>
              <ul className="list-inside list-disc space-y-1 text-sm text-red-700">
                {envStatus.missingVars.map((varName) => (
                  <li key={varName} className="font-mono">
                    {varName}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-red-800">Errors:</h4>
              <ul className="list-inside list-disc space-y-1 text-sm text-red-700">
                {envStatus.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={checkEnvironment}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Recheck Environment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Hook to check environment status
 */
export function useEnvValidation() {
  const [envStatus, setEnvStatus] = useState<EnvStatus | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const checkEnvironment = async () => {
    setIsChecking(true);
    try {
      const status = checkEnvStatus();
      setEnvStatus(status);
    } catch (error) {
      console.error('Environment validation error:', error);
      setEnvStatus({
        isValid: false,
        missingVars: [],
        errors: ['Failed to validate environment variables'],
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkEnvironment();
  }, []);

  return {
    envStatus,
    isChecking,
    checkEnvironment,
    isValid: envStatus?.isValid ?? false,
  };
}
