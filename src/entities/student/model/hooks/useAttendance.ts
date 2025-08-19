import { useMemo, useCallback } from 'react';
import { useToast } from '@/shared/model/hooks';
import type { AttendanceFormValues } from '@/entities/student/model';
import {
  type TPostShuttleAttendanceRequest,
  type TGetLessonTeacherResponse,
  usePostShuttleAttendance,
} from '@/entities/student/api';
import { useQueryClient } from '@tanstack/react-query';

type LessonItem = TGetLessonTeacherResponse['result'][number];

const BOARDING_ORDER_DEFAULT = 999;

const ensureIds = (lesson: LessonItem) => {
  const lessonId = lesson.lessonStudent.lessonId ?? lesson.lesson.id;
  const lessonStudentId = lesson.lessonStudent.id;
  const lessonScheduleId = lesson.lessonSchedule.id;
  const lessonStudentDetailId = lesson.lessonStudentDetail.id;
  if (
    lessonId == null ||
    lessonStudentId == null ||
    lessonScheduleId == null ||
    lessonStudentDetailId == null
  )
    return null;
  return {
    lessonId,
    lessonStudentId,
    lessonScheduleId,
    lessonStudentDetailId,
  } as const;
};

export const useAttendance = (
  studentId: number,
  date: string,
  lessons: LessonItem[],
) => {
  const { toast } = useToast();
  const { mutate, isPending, isError, isSuccess, data } =
    usePostShuttleAttendance();
  const queryClient = useQueryClient();

  const defaults = useMemo<AttendanceFormValues['items']>(() => {
    return lessons.flatMap(lesson => {
      const existed =
        (lesson.shuttleAttendance?.length ?? 0) > 0
          ? lesson.shuttleAttendance![lesson.shuttleAttendance!.length - 1]
          : undefined;
      const ids = ensureIds(lesson);
      if (!ids) return [];
      return [
        {
          id: existed?.id ?? null,
          type: lesson.lessonStudentDetail?.shuttleUsage ?? 'NONE',
          studentId,
          lessonId: ids.lessonId,
          lessonStudentId: ids.lessonStudentId,
          lessonScheduleId: ids.lessonScheduleId,
          lessonStudentDetailId: ids.lessonStudentDetailId,
          time: date,
          status: existed?.status,
          boardingOrder: BOARDING_ORDER_DEFAULT,
        },
      ];
    });
  }, [lessons, studentId, date]);

  const toRequest = useCallback(
    (
      formItems: AttendanceFormValues['items'],
    ): { payload: TPostShuttleAttendanceRequest; hasUnselected: boolean } => {
      let hasUnselected = false;
      const payload = lessons.flatMap((lesson, index) => {
        const existed =
          (lesson.shuttleAttendance?.length ?? 0) > 0
            ? lesson.shuttleAttendance![lesson.shuttleAttendance!.length - 1]
            : undefined;
        const ids = ensureIds(lesson);
        if (!ids) return [];
        const status = formItems?.[index]?.status ?? existed?.status;
        if (!status) hasUnselected = true;
        return [
          {
            id: existed?.id ?? null,
            type: lesson.lessonStudentDetail?.shuttleUsage ?? 'NONE',
            studentId,
            lessonId: ids.lessonId,
            lessonStudentId: ids.lessonStudentId,
            lessonScheduleId: ids.lessonScheduleId,
            lessonStudentDetailId: ids.lessonStudentDetailId,
            time: date,
            status: status!,
            boardingOrder: BOARDING_ORDER_DEFAULT,
          },
        ];
      }) as TPostShuttleAttendanceRequest;
      return { payload, hasUnselected };
    },
    [lessons, studentId, date],
  );

  const submit = (
    formItems: AttendanceFormValues['items'],
    options?: Parameters<typeof mutate>[1],
  ) => {
    const { payload, hasUnselected } = toRequest(formItems);
    if (hasUnselected) {
      toast({
        variant: 'destructive',
        title: '모든 수업을 선택해주세요',
        description: '각 수업의 출결 상태를 모두 선택해주세요.',
      });
      return;
    }

    mutate(payload, {
      onSuccess: (data, variables, context) => {
        toast({
          title: '전송 성공',
          description: '출결 사전 확인을 전송했습니다.',
        });
        queryClient.invalidateQueries({
          queryKey: [`/api/lesson-student/lesson-search/${studentId}`],
        });

        options?.onSuccess?.(data, variables, context);
      },
      onError: (error, variables, context) => {
        toast({
          variant: 'destructive',
          title: '출결 사전 확인 전송에 실패했습니다.',
          description: '다시 시도해주세요.',
        });
        options?.onError?.(error, variables, context);
      },
      ...options,
    });
  };

  return { defaults, toRequest, submit, isPending, isError, isSuccess, data };
};
