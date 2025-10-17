export function sanitizeUserName(name: string) {
    return name.replace(/([\\_*~`|>])/g, '\\$1')
}