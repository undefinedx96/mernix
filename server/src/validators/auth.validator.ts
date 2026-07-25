import z from 'zod'



const nativeEmailValidator = z.email({
    pattern: z.regexes.rfc5322Email 
});


const strongPasswordSchema = z
    .string()
    .trim()
    .min(6, 'Password must be atleast 6 characters long')
    .max(12, 'Password must not exceed 12 characters')
    .regex(/[A-Z]/, 'Password must contain atleast 1 uppercase letter')
    .regex(/[a-z]/, 'Password must contain atleast 1 lowercase letter')
    .regex(/[0-9]/, 'Password must contain atleast 1 number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain atleast 1 special character');



/**
 * MULTI-FIELD UPLOAD SCHEMA (For `req.files`)
 */
const multerFileSchema = z
    .custom<Express.Multer.File>()
    .superRefine((file, ctx) => {
        const currentField = file?.fieldname || 'file';

        if (!file || typeof file !== 'object' || !('path' in file)) {
            ctx.addIssue({
                code: 'custom',
                path: [currentField],
                message: `${currentField.charAt(0).toUpperCase() + currentField.slice(1)} file upload is required`
            });
            return;
        }
    });


/**
 * 
 * SINGLE FILE UPLOAD SCHEMA (For `req.file`)
 */
const createSingleFileSchema = (fallbackFieldName: string, isOptional = false) => {
    return z.custom<Express.Multer.File | undefined>().superRefine((file, ctx) => {
        if(isOptional && !file) return;

        const currentField = file?.fieldname || fallbackFieldName;

        if (!file || typeof file !== 'object' || !('path' in file)) {
            ctx.addIssue({
                code: 'custom',
                path: [currentField],
                message: `${currentField.charAt(0).toUpperCase() + currentField.slice(1)} file upload is required`
            });
        }
    });
};


export const baseRegisterUserSchema = z.object({
    firstName: z
        .string({ error: 'First Name is required' })
        .trim()
        .min(3, 'First name must be atleast 3 characters long')
        .max(255, 'First name must not exceed 255 characters'),
    lastName: z
        .string({ error: 'Last Name is required' })
        .trim()
        .min(3, 'Last name must be atleast 3 characters long')
        .max(255, 'Last name must not exceed 255 characters'),
    email: z
        .string()
        .trim()
        .pipe(nativeEmailValidator),
    username: z
        .string({ error: 'User name is required' })
        .trim()
        .min(3, 'Username must be atleast 3 characters long')
        .max(255, 'Username must not exceed 255 characters')
        .regex(/^[a-z0-9]+$/, { error: 'Username must be in lowercase alphanumeric' }),
    password: strongPasswordSchema,
    confirmPassword: z
        .string()
        .min(6, 'Please confirm your password')
        .trim()
});

export const registerUserSchema = baseRegisterUserSchema.superRefine(
    ({ confirmPassword, password }, ctx) => {
        if (confirmPassword !== password) {
            ctx.addIssue({
                code: 'custom',
                message: 'Passwords do not match',
                path: ['confirmPassword']
            });
        }
    }
);

export type RegisterReqBody = z.infer<typeof registerUserSchema>;



export const registerFileSchema = z.object({
    avatar: z
        .array(multerFileSchema)
        .min(1, 'Avatar file is required')
        .max(1, 'You can only upload 1 avatar'),
    coverImage: z
        .array(multerFileSchema)
        .max(1, 'Cover image must contain at most 1 file')
        .optional()
});

export type RegisterFilesReqBody = z.infer<typeof registerFileSchema>;



export const loginUserSchema = z.object({
    userIdentity: z
        .string({ error: 'User identity (username or email) is required' })
        .trim()
        .toLowerCase()
        .min(3, 'Identity entry must be at least 3 characters long'),
    password: strongPasswordSchema,
}).superRefine(({ userIdentity }, ctx) => {
    if (!userIdentity || userIdentity.length < 3) return;

    if (userIdentity.includes('@')) {
        const result = nativeEmailValidator.safeParse(userIdentity);
        if (!result.success) {
            ctx.addIssue({
                code: 'custom',
                message: result.error.issues[0].message,
                path: ['userIdentity']
            });
        }
        return;
    }

    const isAlphanumeric = /^[a-z0-9]+$/.test(userIdentity);
    if (!isAlphanumeric) {
        ctx.addIssue({
            code: 'custom',
            message: 'Username must be in lowercase alphanumeric format',
            path: ['userIdentity']
        });
    }
});



export type LoginReqBody = z.infer<typeof loginUserSchema>;



export const changeCurrentPasswordSchema = z.object({
    oldPassword: z
        .string()
        .trim(),
    newPassword: strongPasswordSchema,
}).refine(({ oldPassword, newPassword }) => oldPassword !== newPassword, {
    error: 'New password cannot be the same as your old password',
    path: ['newPassword']
});

export type ChangeCurrentPasswordBody = z.infer<typeof changeCurrentPasswordSchema>;



export const updateAccountDetailsSchema = baseRegisterUserSchema.pick({
    firstName: true,
    lastName: true,
    email: true
});

export type UpdateAccountDetailsBody = z.infer<typeof updateAccountDetailsSchema>;



export const singleAvatarUpdateSchema = createSingleFileSchema('avatar', false);

export type SingleAvatarReqFile = z.infer<typeof singleAvatarUpdateSchema>;



export const singleCoverImageUpdateSchema = createSingleFileSchema('coverImage', true);

export type SingleCoverReqFile = z.infer<typeof singleCoverImageUpdateSchema>;



export const getUserChannelProfileParamsSchema = z.object({
    username: z
        .string()
        .trim()
        .toLowerCase()
        .min(3, 'Username must be at least 3 characters long')
        .max(255, 'Username must not exceed 255 characters')
});

export type UserParams = z.infer<typeof getUserChannelProfileParamsSchema>;



export const watchHistoryQuerySchema = z.object({
    page: z
        .string()
        .optional()
        .default('1')
        .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
            error: 'Page must be a positive integer'
        }),
    limit: z
        .string()
        .optional()
        .default('10')
        .refine((val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 100, {
            error: 'Limit must be between 1 and 100'
        })
});

export type WatchHistoryQuery = z.infer<typeof watchHistoryQuerySchema>;