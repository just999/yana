import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

interface SocialLoginButtonProps {
  providers?: ('google' | 'github')[];
  className?: string;
  bgClass?: string;
  buttonClassName?: string;
  onClick: (provider: 'google' | 'github') => void;
  loadingProvider?: 'google' | 'github' | null;
}

const SocialLoginButton = ({
  providers = ['google', 'github'],
  className,
  bgClass,
  buttonClassName,
  loadingProvider = null,
  onClick,
}: SocialLoginButtonProps) => {
  const providerConfig = {
    google: {
      icon: <FcGoogle className='h-4 w-4' />,
      label: 'Sign in with Google',
      bgClass:
        'bg-white border border-gray-300 hover:bg-gray-100 focus:ring-blue-500 focus:ring-2 focus:ring-offset-2',
    },
    github: {
      icon: <FaGithub className='h-4 w-4' />,
      label: 'Sign in with GitHub',
      bgClass:
        'bg-white border border-gray-300 hover:bg-gray-100 focus:ring-blue-500 focus:ring-2 focus:ring-offset-2',
    },
  };

  return (
    <div className={cn('mx-auto space-y-2', className)}>
      {providers.map((provider) => {
        const isCurrentProviderLoading = loadingProvider === provider;
        const isAnyProviderLoading = loadingProvider !== null;
        return (
          <Button
            type='button'
            key={provider}
            variant='outline'
            size='lg'
            className={cn(
              'flex w-full items-center justify-center gap-2',
              providerConfig[provider].bgClass,
              isAnyProviderLoading && 'cursor-not-allowed opacity-50',
              buttonClassName
            )}
            onClick={() => onClick(provider)}
            aria-label={providerConfig[provider].label}
            disabled={isAnyProviderLoading}
          >
            {isCurrentProviderLoading ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <div className='flex items-center justify-center gap-2'>
                <span>{providerConfig[provider].icon}</span>
                <span className={cn('text-sm font-medium', bgClass)}>
                  {providerConfig[provider].label}
                </span>
              </div>
            )}
          </Button>
        );
      })}
    </div>
  );
};

export default SocialLoginButton;
