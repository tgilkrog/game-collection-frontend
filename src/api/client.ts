const API_URL = "http://127.0.0.1:8000/api";

export async function getPosts() {
  const res = await fetch(`${API_URL}/posts`);
  return res.json();
}