const asyncHandler = (requestHandlerFn) => {
    return (req, res, next) => {
        Promise
        .resolve(requestHandlerFn(req, res, next))
        .catch((err) => next(err))
    }
};

export default asyncHandler;