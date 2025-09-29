import { ReactNode } from 'react';

type SettingsPageProps = {};

const SettingsPage = () => {
  return (
    <div className='grid grid-cols-4 gap-8'>
      <aside>
        <h1 className='text-3xl font-bold text-gray-100'>Settings page</h1>
      </aside>

      {/* <div className='col-span-3'>{children}</div> */}
    </div>
  );
};

export default SettingsPage;
