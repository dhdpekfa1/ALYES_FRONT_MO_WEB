import { type TGetStudentFind, getStudentFind } from '.';
import { parseData, useGetMutation } from '@/shared/api/lib';
import type { UseMutationOptions } from '@tanstack/react-query';
import type { TApiResponse } from '@/shared/api/model';
import { z } from 'zod';

/** 사용자 인증 */
export const useGetStudentFind = () =>
  useGetAuthMutation<
    TGetStudentFind['result'],
    { name: string; phone: string }
  >('/api/student/find/name-and-phone', getStudentFind.shape.result);

export const useGetAuthMutation = <TParsed, TRequest extends object>(
  url: string,
  schema: z.ZodSchema<TParsed>,
  options?: UseMutationOptions<TApiResponse<TParsed>, Error, TRequest>,
) => {
  const { mutate, data, isPending, isError, isSuccess, ...rest } =
    useGetMutation<TParsed, TRequest>(url, {
      retry: false,
      ...options,
    });

  const parsedData = parseData<TParsed>({
    data: data?.result,
    isLoading: isPending,
    isError,
    isSuccess,
    schema,
  });

  return {
    mutate,
    ...parsedData,
    isPending,
    isError,
    isSuccess,
    ...rest,
  };
};
