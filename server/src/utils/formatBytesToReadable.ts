/**
 * @function `formatBytesToReadable` - Formats the bytes into MB or KB
 * @param `bytes`
 * @returns `string`
 */

const formatBytesToReadable = (bytes: number): string => {
    if (bytes >= 1024 * 1024) {
        return `${bytes / (1024 * 1024)}MB`;
    }

    return `${bytes / 1024}KB`
};

export { formatBytesToReadable };