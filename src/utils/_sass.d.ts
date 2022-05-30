// REMOVES *.module.scss TypeScript import errors

declare module '*.scss' {
    const content: Record<string, string>;
    export default content;
}