export type User = {
    id: number;
    name: string;
    email?: string;
    avatar?: string;
    banner?: string;
    banner_position?: number;
    bio?: string;
    is_admin?: boolean;
    copy_count?: number;
    wishlist_count?: number;
    total_value?: number;
    platform_count?: number;
    followers_count?: number;
    following_count?: number;
    is_following?: boolean;
    rank?: string;
};

export type UserListItem = {
    id: number;
    name: string;
    avatar?: string;
    copy_count: number;
    rank?: string;
};

export type PlatformStat = { name: string; count: number; value: number };
export type GenreStat    = { name: string; count: number };
export type DecadeStat   = { decade: string; count: number };
