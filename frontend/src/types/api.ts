// API Response types

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    timestamp?: string;
}

export interface PageResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
}

export interface UserResponse {
    id: string;
    email: string;
    fullName: string;
    role: string;
    createdAt: string;
}
