class ApiResponse<T> {
    public statusCode: number;
    public data: T;
    public message: string;
    public success: boolean;

    constructor(
        statusCode: number,
        data: T,
        message: string = 'Success'
    ) {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400
    }
}

export { ApiResponse };

// T is a placeholder for whatever data type we pass in (Generics)
// When we use T in controllers, we get full type safety for the response body