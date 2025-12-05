export interface GenericResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface SearchFilters {
    [key: string]: string | number | boolean | undefined | string[];
}

export interface UserProfile {
    id: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    role?: 'user' | 'admin' | 'dealer';
    [key: string]: unknown;
}

export type AnyFunction = (...args: unknown[]) => unknown;

export interface Dictionary<T = unknown> {
    [key: string]: T;
}
