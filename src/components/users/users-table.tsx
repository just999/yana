import { getAllUsers } from '@/actions/user-actions';

import { DataTable } from '../data-table';
import { columns } from './users-table-columns';

type UsersTableProps = unknown;

const UsersTable = async () => {
  const users = (await getAllUsers()).data;
  return (
    <div className='container mx-auto py-10'>
      <DataTable columns={columns} data={users || []} />
    </div>
  );
};

export default UsersTable;
