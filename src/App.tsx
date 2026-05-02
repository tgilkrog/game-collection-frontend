import { useEffect, useState } from "react";
import { getPosts } from "./api/client";


type Post = {
  id: number;
  title: string;
};

function App() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    async function loadPosts() {
      const data = await getPosts();
      console.log(data);
      setPosts(data);
    }

    loadPosts();
  }, []);

  return (
    <div>
      <h1>Posts</h1>

      {posts.map((post) => (
        <div key={post.id}>
          {post.title}
          </div>
      ))}
    </div>
  );
}

export default App
