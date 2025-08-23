import { getAllUsers } from '@/actions/user-actions';
import { DataTable } from '@/components/data-table';
import { columns } from '@/components/users/users-table-columns';

type UsersPageProps = unknown;

const UsersPage = async () => {
  const users = (await getAllUsers()).data;
  return (
    <div className='container mx-auto py-10'>
      <DataTable columns={columns} data={users || []} />
    </div>
  );
};

export default UsersPage;
