import { env } from "process";
import { strapi } from "@strapi/client";

export default async function Page(props: { params: { id: string } }) {
  const client = strapi({
    baseURL: env.STRAPI_API_URL || "http://localhost:1337/api",
    auth: env.STRAPI_API_TOKEN,
  });

  const blogPosts = client.collection("posts");

  const posts = await blogPosts.find();

  console.log(posts);

  return (
    <ul>
      {posts.data.map((p: any) => (
        <li key={p.id} className="text-white">
          <a href={`/posts/${p.documentId}`}>{p.documentId}</a>
        </li>
      ))}
    </ul>
  );
}
