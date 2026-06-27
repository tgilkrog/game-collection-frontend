import api from './axios';

export const addToWishlist = (gameBaseId: number) =>
  api.post('/wishlist', { game_base_id: gameBaseId });

export const removeFromWishlist = (gameBaseId: number) =>
  api.delete(`/wishlist/${gameBaseId}`);
