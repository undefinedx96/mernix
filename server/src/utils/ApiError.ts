export interface ValidationError {
    field?: string;
    message: string;
}

class ApiError extends Error {
    public statusCode: number;
    public data: null;
    public success: boolean;
    public errors: ValidationError[]

    constructor(
        statusCode: number,
        message: string = 'Something went wrong!',
        errors: ValidationError[] = [],
        stack: string = ''
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        }
        else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };