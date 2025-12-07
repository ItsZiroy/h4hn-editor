import { env } from "process";
import Editor from "./editor";
import { strapi } from "@strapi/client";

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params;

  const client = strapi({
    baseURL: env.STRAPI_API_URL || "http://localhost:1337/api",
    auth: env.STRAPI_API_TOKEN,
  });

  const blogPosts = client.collection("posts");

  const post = await blogPosts.findOne(id, { status: "draft" });

  return <Editor content={post.data.content} />;
}
