import { z } from "zod";
import {
  CreateOrgUserBodySchema,
  OrgUserBodyObjectSchema,
  USER_FIELD_ERRORS,
} from "@workspace/users-domain";

export const createUserFormSchema = CreateOrgUserBodySchema;

export const editUserFormSchema = OrgUserBodyObjectSchema.extend({
  password: z.string(),
}).superRefine((data, ctx) => {
  const password = data.password.trim();
  if (password.length > 0 && password.length < 6) {
    ctx.addIssue({
      code: "custom",
      message: USER_FIELD_ERRORS.passwordMin,
      path: ["password"],
    });
  }
});

export type CreateUserFormValues = z.infer<typeof createUserFormSchema>;
export type EditUserFormValues = z.infer<typeof editUserFormSchema>;

export { USER_ROLE_LABELS } from "@workspace/users-domain";
