import { env } from "process";
import { strapi } from "@strapi/client";

export default async function Page(props: { params: { id: string } }) {
  const client = strapi({
    baseURL: env.STRAPI_URL + "/api" || "http://localhost:1337/api",
    auth: env.STRAPI_TOKEN,
  });

  const blogPosts = client.collection("posts");

  const posts = await blogPosts.find();

  return (
    <div className="p-6 md:p-20">
      <div className="mb-6">
        <a
          href={
            env.NEXT_PUBLIC_STRAPI_ADMIN_URL +
              "/content-manager/collection-types/api::post.post" ||
            "http://localhost:1337/admin"
          }
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        >
          Edit in Strapi
        </a>
      </div>
      <div className="space-y-4">
        {posts.data.map((p: any) => (
          <a
            key={p.id}
            href={`/posts/${p.documentId}`}
            className="border border-gray-700 rounded-lg p-4 hover:bg-gray-900 transition cursor-pointer block"
          >
            <h2 className="text-blue-400 hover:text-blue-300 text-lg font-semibold">
              {p.title}
            </h2>
            <p className="text-gray-400 text-sm mt-2">
              {new Date(p.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
