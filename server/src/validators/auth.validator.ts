import z from 'zod'



const nativeEmailValidator = z.email({
    pattern: z.regexes.rfc5322Email 
});


export const registerUserSchema = z.object({
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
        .toLowerCase()
        .pipe(nativeEmailValidator),
    username: z
        .string({ error: 'User name is required' })
        .trim()
        .regex(/^[a-z0-9]+$/, { error: 'Username must be in lowercase alphanumeric' })
        .min(3, 'Username must be atleast 3 characters long')
        .max(255, 'Username must not exceed 255 characters'),
    password: z
        .string()
        .min(6, 'Password must be atleast 6 characters long')
        .max(12, 'Password must not exceed 12 characters')
        .trim()
        .regex(/[A-Z]/, 'Password must contain atleast 1 uppercase letter')
        .regex(/[a-z]/, 'Password must contain atleast 1 lowercase letter')
        .regex(/[0-9]/, 'Password must contain atleast 1 number')
        .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain atleast 1 special character'),
    confirmPassword: z
        .string()
        .min(6, 'Please confirm your password')
        .trim()
}).superRefine(
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
        .custom<Express.Multer.File[]>()
        .refine((files) => Array.isArray(files) && files.length === 1, {
            error: 'Avatar file is required'
        }),
    coverImage: z
        .custom<Express.Multer.File[]>()
        .refine((files) => {
            if (!files) return true;
            return Array.isArray(files) && files.length === 1;
        }, {
            error: 'Cover image must contain at most 1 file'
        })
        .optional()
});

export type RegisterFilesReqBody = z.infer<typeof registerFileSchema>;



export const loginUserSchema = z.object({
    userIdentity: z
        .string({ error: 'User identity (username or email) is required' })
        .trim()
        .toLowerCase()
        .min(3, 'Identity entry must be at least 3 characters long'),
    password: z
        .string()
        .min(6, 'Password must be atleast 6 characters long')
        .max(12, 'Password must not exceed 12 characters')
        .trim()
        .regex(/[A-Z]/, 'Password must contain atleast 1 uppercase letter')
        .regex(/[a-z]/, 'Password must contain atleast 1 lowercase letter')
        .regex(/[0-9]/, 'Password must contain atleast 1 number')
        .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain atleast 1 special character')
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
    newPassword: z
        .string()
        .min(6, 'Password must be atleast 6 characters long')
        .max(12, 'Password must not exceed 12 characters')
        .trim()
        .regex(/[A-Z]/, 'Password must contain atleast 1 uppercase letter')
        .regex(/[a-z]/, 'Password must contain atleast 1 lowercase letter')
        .regex(/[0-9]/, 'Password must contain atleast 1 number')
        .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain atleast 1 special character'),
}).refine(({ oldPassword, newPassword }) => oldPassword !== newPassword, {
    error: 'New password cannot be the same as your old password',
    path: ['newPassword']
});

export type ChangeCurrentPasswordBody = z.infer<typeof changeCurrentPasswordSchema>;