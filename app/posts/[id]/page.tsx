import { env } from "process";
import Editor from "./editor";
import { strapi } from "@strapi/client";

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params;

  const client = strapi({
    baseURL: env.STRAPI_URL + "/api" || "http://localhost:1337/api",
    auth: env.STRAPI_TOKEN,
  });

  const blogPosts = client.collection("posts");

  // Fetch both draft and published versions
  const [draftPost, publishedPost] = await Promise.all([
    blogPosts.findOne(id, { status: "draft" }),
    blogPosts.findOne(id, { status: "published" }).catch(() => null),
  ]);

  // Determine initial status:
  // - If no published version exists -> draft
  // - If published version exists and draft is newer -> draft
  // - If published version exists and matches draft -> published
  let initialStatus: "draft" | "published" = "draft";
  if (publishedPost?.data) {
    const draftUpdatedAt = new Date(draftPost.data.updatedAt).getTime();
    const publishedUpdatedAt = new Date(publishedPost.data.updatedAt).getTime();
    if (publishedUpdatedAt >= draftUpdatedAt) {
      initialStatus = "published";
    }
  }

  return (
    <Editor content={draftPost.data.content} initialStatus={initialStatus} />
  );
}
