import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

export default function ProfilePage() {
  return (
    <div className='container mx-auto py-8'>
      <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
        {/* Profile Card */}
        <div className='md:col-span-1'>
          <Card>
            <CardHeader className='items-center'>
              <Avatar className='bg-accent/50 h-16 w-16 border-2 border-amber-800/5 text-center'>
                <AvatarImage
                  src='/avatars/beauty.svg'
                  className='svg h-14 w-14'
                />
                <AvatarFallback>JP</AvatarFallback>
              </Avatar>
              <CardTitle className='mt-4'>Jane Doe</CardTitle>
              <CardDescription>Frontend Developer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div>
                  <Label>Email</Label>
                  <p className='text-muted-foreground text-sm'>
                    john.doe@example.com
                  </p>
                </div>
                <div>
                  <Label>Location</Label>
                  <p className='text-muted-foreground text-sm'>
                    San Francisco, CA
                  </p>
                </div>
                <div>
                  <Label>Joined</Label>
                  <p className='text-muted-foreground text-sm'>January 2023</p>
                </div>
                <Button variant='outline' className='w-full'>
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className='space-y-6 md:col-span-2'>
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <div>
                    <Label htmlFor='firstName'>First Name</Label>
                    <Input id='firstName' defaultValue='John' />
                  </div>
                  <div>
                    <Label htmlFor='lastName'>Last Name</Label>
                    <Input id='lastName' defaultValue='Doe' />
                  </div>
                </div>
                <div>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    id='email'
                    type='email'
                    defaultValue='john.doe@example.com'
                  />
                </div>
                <div>
                  <Label htmlFor='bio'>Bio</Label>
                  <Textarea
                    id='bio'
                    defaultValue='Frontend developer passionate about building beautiful, accessible user interfaces.'
                    className='min-h-[100px]'
                  />
                </div>
                <div className='flex justify-end'>
                  <Button type='submit'>Save Changes</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Configure your account preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className='space-y-4'>
                <div>
                  <Label htmlFor='language'>Language</Label>
                  <Select defaultValue='english'>
                    <SelectTrigger id='language'>
                      <SelectValue placeholder='Select language' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='english'>English</SelectItem>
                      <SelectItem value='spanish'>Spanish</SelectItem>
                      <SelectItem value='french'>French</SelectItem>
                      <SelectItem value='german'>German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor='timezone'>Timezone</Label>
                  <Select defaultValue='pst'>
                    <SelectTrigger id='timezone'>
                      <SelectValue placeholder='Select timezone' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='pst'>
                        PST (Pacific Standard Time)
                      </SelectItem>
                      <SelectItem value='est'>
                        EST (Eastern Standard Time)
                      </SelectItem>
                      <SelectItem value='cst'>
                        CST (Central Standard Time)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='flex justify-end'>
                  <Button type='submit'>Update Preferences</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex items-center gap-4'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-blue-100'>
                    <svg
                      className='h-5 w-5 text-blue-600'
                      fill='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path d='M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z' />
                    </svg>
                  </div>
                  <Input
                    placeholder='Twitter username'
                    defaultValue='@johndoe'
                  />
                </div>
                <div className='flex items-center gap-4'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-100'>
                    <svg
                      className='h-5 w-5 text-gray-800'
                      fill='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' />
                    </svg>
                  </div>
                  <Input placeholder='GitHub username' defaultValue='johndoe' />
                </div>
                <div className='flex justify-end'>
                  <Button>Save Social Links</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
