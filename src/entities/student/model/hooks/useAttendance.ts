import { useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/model/hooks';
import type { AttendanceFormValues } from '@/entities/student/model';
import {
  type TPostShuttleAttendanceRequest,
  type TGetLessonTeacherResponse,
  usePostShuttleAttendance,
} from '@/entities/student/api';
import type {
  TShuttleAttendanceStatusEnum,
  TShuttleAttendances,
} from '@/shared/api/model';

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

const getLastShuttle = (lesson: LessonItem) =>
  (lesson.shuttleAttendance?.length ?? 0) > 0
    ? lesson.shuttleAttendance![lesson.shuttleAttendance!.length - 1]
    : undefined;

type ShuttleAttendanceUpsert = Omit<
  TShuttleAttendances,
  'createdDate' | 'modifiedDate' | 'status'
> & {
  id?: number;
  status?: TShuttleAttendanceStatusEnum;
};

const buildItem = (
  lesson: LessonItem,
  ids: ReturnType<typeof ensureIds>,
  date: string,
  studentId: number,
  status: TShuttleAttendanceStatusEnum | undefined,
  existedId?: number,
) => {
  if (!ids) {
    throw new Error('수업 정보가 올바르지 않습니다.');
  }

  const base: Omit<ShuttleAttendanceUpsert, 'id'> = {
    type: lesson.lessonStudentDetail?.shuttleUsage ?? 'NONE',
    studentId,
    lessonId: ids.lessonId,
    lessonStudentId: ids.lessonStudentId,
    lessonScheduleId: ids.lessonScheduleId,
    lessonStudentDetailId: ids.lessonStudentDetailId,
    time: date,
    boardingOrder: BOARDING_ORDER_DEFAULT,
    ...(status ? { status } : {}),
  };

  return existedId != null ? { id: existedId, ...base } : { ...base };
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
      const existed = getLastShuttle(lesson);
      const ids = ensureIds(lesson);
      if (!ids) return [];
      return [
        buildItem(lesson, ids, date, studentId, existed?.status, existed?.id),
      ];
    });
  }, [lessons, studentId, date]);

  const toRequest = useCallback(
    (
      formItems: AttendanceFormValues['items'],
    ): {
      payload: TPostShuttleAttendanceRequest;
      hasUnselected: boolean;
      hasChanged: boolean;
    } => {
      let hasUnselected = false;
      let hasChanged = true;
      const payload = lessons.flatMap((lesson, index) => {
        const existed = getLastShuttle(lesson);
        const ids = ensureIds(lesson);
        if (!ids) return [];
        const chosen = formItems?.[index]?.status;
        const effective: TShuttleAttendanceStatusEnum | undefined =
          chosen ?? existed?.status;
        if (!effective) hasUnselected = true;
        if (hasChanged && chosen && chosen !== existed?.status)
          hasChanged = false;
        return [
          buildItem(
            lesson,
            ids,
            date,
            studentId,
            effective!,
            existed?.id ?? undefined,
          ),
        ];
      }) as TPostShuttleAttendanceRequest;
      return { payload, hasUnselected, hasChanged };
    },
    [lessons, studentId, date],
  );

  const submit = (
    formItems: AttendanceFormValues['items'],
    options?: Parameters<typeof mutate>[1],
  ) => {
    const { payload, hasUnselected, hasChanged } = toRequest(formItems);
    if (hasUnselected) {
      toast({
        variant: 'destructive',
        title: '모든 수업을 선택해주세요',
        description: '각 수업의 출결 상태를 모두 선택해주세요.',
      });
      return;
    }
    if (hasChanged) {
      toast({
        title: '변경 사항이 없습니다.',
        description: '이미 등록된 출결 상태입니다.',
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
