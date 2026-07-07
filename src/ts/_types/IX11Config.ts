/** Key server configuration that's X11 specific */
export type IX11Config = {
    /** A callback that's triggered with additional information from the keyhandler */
    onInfo?: {(data: string): void};
    /** A callback that's triggered with additional information from the keyhandler */
    onError?: {(errorCode: number | null): void};
    /** Path to server executable */
    serverPath?: string
    /** The name/title shown in the OS permission prompt when elevated access is required to make the server executable. Defaults to "Global key listener" */
    promptTitle?: string
};
