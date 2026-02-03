export const catchAsync = (fn: Function) => {
    return (...args: any[]) => {
        fn(...args).catch(args[args.length - 1]); // Passes error to the next() function
    };
};