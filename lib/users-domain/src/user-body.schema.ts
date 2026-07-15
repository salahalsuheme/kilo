import { z } from "zod";
import { USER_FIELD_ERRORS } from "./user-field-errors.js";
import { USER_ROLES } from "./types.js";

const trimmedRequired = (message: string) => z.string().trim().min(1, message);

const emailSchema = trimmedRequired(USER_FIELD_ERRORS.email).email(USER_FIELD_ERRORS.emailInvalid);

const passwordSchema = z
  .string()
  .min(1, USER_FIELD_ERRORS.password)
  .min(6, USER_FIELD_ERRORS.passwordMin);

const roleSchema = z.enum(USER_ROLES, { message: USER_FIELD_ERRORS.role });

/** Base object matching OpenAPI CreateOrgUserBody field shapes. */
export const OrgUserBodyObjectSchema = z.object({
  name: trimmedRequired(USER_FIELD_ERRORS.name),
  email: emailSchema,
  role: roleSchema,
});

export const CreateOrgUserBodySchema = OrgUserBodyObjectSchema.extend({
  password: passwordSchema,
});

export const UpdateOrgUserBodySchema = OrgUserBodyObjectSchema.extend({
  password: z.string().optional(),
}).superRefine((data, ctx) => {
  const password = data.password?.trim();
  if (password && password.length < 6) {
    ctx.addIssue({
      code: "custom",
      message: USER_FIELD_ERRORS.passwordMin,
      path: ["password"],
    });
  }
});

export type CreateOrgUserBodyInput = z.infer<typeof CreateOrgUserBodySchema>;
export type UpdateOrgUserBodyInput = z.infer<typeof UpdateOrgUserBodySchema>;
