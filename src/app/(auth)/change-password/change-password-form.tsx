// 'use client';

// import { useState } from 'react';

// import { Icons } from '@/components/icons';
// import { Button, Input, Label } from '@/components/ui';
// import { usePasswordValidation } from '@/hooks/use-password-validation';

// type ChangePasswordFormProps = unknown;

// const ChangePasswordForm = () => {
//   const [currentPassword, setCurrentPassword] = useState('');
//   const {
//     password: newPassword,
//     setPassword: setNewPassword,
//     confirmPassword,
//     setConfirmPassword,
//     errors,
//     validate,
//   } = usePasswordValidation();

//   const [isLoading, setIsLoading] = useState(false);
//   const [success, setSuccess] = useState(false);

//   // const handleSubmit = async (e: React.FormEvent) => {
//   //   e.preventDefault();
//   //   setIsLoading(true);

//   //   // Validate all fields
//   //   const isCurrentValid = currentPassword.length > 0;
//   //   const isNewValid = validate(newPassword);
//   //   const isConfirmValid = validate(confirmPassword, true);

//   //   if (isCurrentValid && isNewValid && isConfirmValid) {
//   //     // Simulate API call
//   //     await new Promise((resolve) => setTimeout(resolve, 1000));
//   //     setSuccess(true);
//   //   }

//   //   setIsLoading(false);
//   // };

//   const getPasswordStrength = (password: string) => {
//     if (!password) return { text: 'None', width: '0%', color: 'bg-gray-200' };

//     let score = 0;
//     score += Math.min(password.length * 3, 40);
//     if (/[A-Z]/.test(password)) score += 10;
//     if (/[a-z]/.test(password)) score += 10;
//     if (/[0-9]/.test(password)) score += 10;
//     if (/[^A-Za-z0-9]/.test(password)) score += 10;
//     if (password.length < 8) score -= 10;
//     if (/^[a-zA-Z]+$/.test(password)) score -= 5;
//     if (/^[0-9]+$/.test(password)) score -= 5;
//     score = Math.max(0, Math.min(score, 100));

//     if (score < 30) {
//       return { text: 'Weak', width: `${score}%`, color: 'bg-red-500' };
//     } else if (score < 70) {
//       return { text: 'Medium', width: `${score}%`, color: 'bg-yellow-500' };
//     } else if (score < 90) {
//       return { text: 'Strong', width: `${score}%`, color: 'bg-blue-500' };
//     } else {
//       return { text: 'Very Strong', width: `${score}%`, color: 'bg-green-500' };
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     await new Promise((resolve) => setTimeout(resolve, 1000));
//     setSuccess(true);
//     setIsLoading(false);
//   };

//   // const strength = getPasswordStrength();

//   return (
//     <form className='space-y-4' onSubmit={handleSubmit}>
//       {/* Current Password */}
//       <div className='space-y-2'>
//         <Label htmlFor='currentPassword'>Current Password</Label>
//         <div className='relative'>
//           <Input
//             id='currentPassword'
//             name='currentPassword'
//             type='password'
//             value={currentPassword}
//             onChange={(e) => setCurrentPassword(e.target.value)}
//             placeholder='Enter your current password'
//             required
//           />
//         </div>
//       </div>

//       {/* New Password */}
//       <div className='space-y-2'>
//         <Label htmlFor='newPassword'>New Password</Label>
//         <div className='relative'>
//           <Input
//             id='newPassword'
//             name='newPassword'
//             type='password'
//             value={newPassword}
//             onChange={(e) => setNewPassword(e.target.value)}
//             onBlur={() => validate(newPassword)}
//             placeholder='Enter your new password'
//             required
//           />
//         </div>
//         {errors.length > 0 && newPassword && (
//           <ul className='text-muted-foreground space-y-1 text-xs'>
//             {errors.map((error, i) => (
//               <li key={i} className='text-red-500'>
//                 {error}
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>

//       {/* Confirm New Password */}
//       <div className='space-y-2'>
//         <Label htmlFor='confirmPassword'>Confirm New Password</Label>
//         <div className='relative'>
//           <Input
//             id='confirmPassword'
//             name='confirmPassword'
//             type='password'
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//             onBlur={() => validate(confirmPassword, true)}
//             placeholder='Confirm your new password'
//             required
//           />
//         </div>
//       </div>

//       {/* Password Strength Meter */}
//       <div className='space-y-2'>
//         <div className='flex items-center justify-between'>
//           <Label>Password Strength</Label>
//           <span className='text-xs font-medium'>
//             {getPasswordStrength(newPassword).text}
//           </span>
//         </div>
//         <div className='h-1.5 w-full rounded-full bg-gray-200'>
//           <div
//             className={`h-1.5 rounded-full ${getPasswordStrength(newPassword).color}`}
//             style={{ width: getPasswordStrength(newPassword).width }}
//           ></div>
//         </div>
//         <div className='text-muted-foreground text-xs'>
//           {newPassword.length > 0 && (
//             <>
//               {newPassword.length < 8 ? (
//                 <span className='text-red-500'>
//                   Too short (min 8 characters)
//                 </span>
//               ) : (
//                 <>
//                   {!/[A-Z]/.test(newPassword) && (
//                     <span className='block text-red-500'>
//                       Add uppercase letters
//                     </span>
//                   )}
//                   {!/[0-9]/.test(newPassword) && (
//                     <span className='block text-red-500'>Add numbers</span>
//                   )}
//                   {!/[^A-Za-z0-9]/.test(newPassword) && (
//                     <span className='block text-red-500'>
//                       Add special characters
//                     </span>
//                   )}
//                 </>
//               )}
//             </>
//           )}
//         </div>
//       </div>

//       {/* Confirm Password */}
//       <div className='space-y-2'>
//         <Label htmlFor='confirmPassword'>Confirm New Password</Label>
//         <Input
//           id='confirmPassword'
//           type='password'
//           value={confirmPassword}
//           onChange={(e) => setConfirmPassword(e.target.value)}
//           placeholder='Confirm new password'
//           required
//         />
//         {confirmPassword && newPassword !== confirmPassword && (
//           <span className='text-xs text-red-500'>Passwords don't match</span>
//         )}
//       </div>

//       {/* Submit Button */}
//       <div className='flex justify-end pt-2'>
//         {success ? (
//           <div className='flex items-center text-sm text-green-600'>
//             <Icons.check className='mr-2 h-4 w-4' />
//             Password updated successfully!
//           </div>
//         ) : (
//           <Button type='submit' disabled={isLoading}>
//             {isLoading ? (
//               <Icons.loader className='mr-2 h-4 w-4 animate-spin' />
//             ) : (
//               <Icons.save className='mr-2 h-4 w-4' />
//             )}
//             Update Password
//           </Button>
//         )}
//       </div>
//     </form>
//   );
// };

// export default ChangePasswordForm;

'use client';

import { useState } from 'react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const getPasswordStrength = (password: string) => {
    if (!password) return { text: 'None', width: '0%', color: 'bg-gray-200' };

    let score = 0;
    score += Math.min(password.length * 3, 60);
    if (/[A-Z]/.test(password)) score += 10;
    if (/[a-z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 10;
    if (/[^A-Za-z0-9]/.test(password)) score += 10;
    if (password.length < 8) score -= 10;
    if (/^[a-zA-Z]+$/.test(password)) score -= 5;
    if (/^[0-9]+$/.test(password)) score -= 5;
    score = Math.max(0, Math.min(score, 100));

    if (score < 30) {
      return { text: 'Weak', width: `${score}%`, color: 'bg-red-500' };
    } else if (score < 70) {
      return { text: 'Medium', width: `${score}%`, color: 'bg-yellow-500' };
    } else if (score < 90) {
      return { text: 'Strong', width: `${score}%`, color: 'bg-blue-500' };
    } else {
      return {
        text: 'Very Strong',
        width: `${score}%`,
        color: 'bg-emerald-500',
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSuccess(true);
    setIsLoading(false);
  };

  return (
    <form className='space-y-4' onSubmit={handleSubmit}>
      {/* Current Password */}
      <div className='space-y-2'>
        <Label htmlFor='currentPassword'>Current Password</Label>
        <Input
          id='currentPassword'
          type='password'
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder='Enter current password'
          required
        />
      </div>

      {/* New Password */}
      <div className='space-y-2'>
        <Label htmlFor='newPassword'>New Password</Label>
        <Input
          id='newPassword'
          type='password'
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder='Enter new password'
          required
        />

        {/* Password Strength Meter */}
        <div className='space-y-2 pt-2'>
          <div className='flex items-center justify-between'>
            <Label>Password Strength</Label>
            <span className='text-xs font-medium'>
              {getPasswordStrength(newPassword).text}
            </span>
          </div>
          <div className='h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-800'>
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                getPasswordStrength(newPassword).color
              }`}
              style={{ width: getPasswordStrength(newPassword).width }}
            ></div>
          </div>
          <div className='text-muted-foreground text-xs'>
            {newPassword.length > 0 && (
              <>
                {newPassword.length < 8 ? (
                  <span className='text-red-500'>
                    Too short (min 8 characters)
                  </span>
                ) : (
                  <>
                    {!/[A-Z]/.test(newPassword) && (
                      <span className='block text-red-500'>
                        Add uppercase letters
                      </span>
                    )}
                    {!/[0-9]/.test(newPassword) && (
                      <span className='block text-red-500'>Add numbers</span>
                    )}
                    {!/[^A-Za-z0-9]/.test(newPassword) && (
                      <span className='block text-red-500'>
                        Add special characters
                      </span>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Password */}
      <div className='space-y-2'>
        <Label htmlFor='confirmPassword'>Confirm New Password</Label>
        <Input
          id='confirmPassword'
          type='password'
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder='Confirm new password'
          required
        />
        {confirmPassword && newPassword !== confirmPassword && (
          <span className='text-xs text-red-500'>Passwords don't match</span>
        )}
      </div>

      {/* Submit Button */}
      <Button type='submit' disabled={isLoading} className='w-full'>
        {isLoading ? (
          <Icons.loader className='mr-2 h-4 w-4 animate-spin' />
        ) : (
          <Icons.save className='mr-2 h-4 w-4' />
        )}
        Change Password
      </Button>
    </form>
  );
}
