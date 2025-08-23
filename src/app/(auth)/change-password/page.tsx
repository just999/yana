import ChangePasswordForm from '@/app/(auth)/change-password/change-password-form';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SecuritySettingsPage() {
  return (
    <div className='container mx-auto max-w-md py-8'>
      <div className='grid gap-8'>
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your account password. Make sure it's strong and secure.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>

        {/* Two-Factor Authentication Section */}
        <Card>
          <CardHeader>
            <CardTitle>Two-Factor Authentication</CardTitle>
            <CardDescription>
              Add an extra layer of security to your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'>
              <div className='space-y-1'>
                <Label>Status</Label>
                <p className='text-muted-foreground text-sm'>
                  Two-factor authentication is currently <strong>off</strong>.
                </p>
              </div>
              <Button variant='outline'>Set up 2FA</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
