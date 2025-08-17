import { apiResponseSchema } from '@/shared/api/model';
import z from 'zod';

/** 학생 enum 타입 */
export const studentTypeEnumSchema = z.enum(['TEMP', 'REGULAR']);
export type TStudentType = z.infer<typeof studentTypeEnumSchema>;

/** 학생 관계 enum 타입 */
export const studentRelationEnumSchema = z.enum(['MOM', 'FATHER', 'ETC']);
export type TStudentRelation = z.infer<typeof studentRelationEnumSchema>;

/** 학생 상태 enum 타입 */
export const studentStatusEnumSchema = z.enum(['ACTIVE', 'QUIT', 'IDLE']);
export type TStudentStatus = z.infer<typeof studentStatusEnumSchema>;

/** 사용자 기본 타입 */
export const userSchema = z.object({
  createdDate: z.string(),
  modifiedDate: z.string(),
  id: z.number(),
  studentType: studentTypeEnumSchema,
  name: z.string(),
  birth: z.string(),
  gender: z.string(),
  profileImg: z.string(),
  memo: z.string(),
  studentRelation: studentRelationEnumSchema,
  phone: z.string(),
  organizationId: z.number(),
  status: studentStatusEnumSchema,
});
export type TUser = z.infer<typeof userSchema>;

/** 사용자 확인 응답 스키마/타입  */
export const getStudentFind = apiResponseSchema.extend({
  result: z.array(userSchema),
});
export type TGetStudentFind = z.infer<typeof getStudentFind>;
