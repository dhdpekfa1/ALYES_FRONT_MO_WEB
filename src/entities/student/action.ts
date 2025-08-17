import { getApi } from '@/shared/api/lib';
import type { TApiResponse } from '@/shared/api/model';
import type { TGetStudentFind } from './';

export const getStudentFind = ({
  name,
  phone,
}: {
  name: string;
  phone: string;
}) => {
  return getApi<TApiResponse<TGetStudentFind>>(
    `/api/student/find/name-and-phone`,
    { params: { name, phone } },
  );
};
