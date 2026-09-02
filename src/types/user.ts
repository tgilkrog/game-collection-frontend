export type User = {
    id: number;
    name: string;
    email?: string;
    avatar?: string;
    banner?: string;
    banner_position?: number;
    bio?: string;
    is_admin?: boolean;
    is_banned?: boolean;
    created_at?: string;
    copy_count?: number;
    wishlist_count?: number;
    total_value?: number;
    platform_count?: number;
    followers_count?: number;
    following_count?: number;
    is_following?: boolean;
    rank?: string;
    avg_rating?: number | null;
};

export type UserListItem = {
    id: number;
    name: string;
    avatar?: string;
    copy_count: number;
    rank?: string;
};

export type AdminUserListItem = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    is_admin: boolean;
    is_banned: boolean;
    copy_count: number;
    rank?: string;
    created_at?: string;
};

export type PlatformStat = { name: string; count: number; value: number };
export type GenreStat    = { name: string; count: number };
export type DecadeStat   = { decade: string; count: number };
export type GenreRatingStat = { name: string; avg_rating: number; count: number };
