"use server";
import { strapi } from "@strapi/client";

export async function updatePost(formData: FormData) {
  "use server";
  const content = formData.get("content");
  const documentId = formData.get("documentId") as string;

  const client = strapi({
    baseURL: process.env.STRAPI_API_URL || "http://localhost:1337/api",
    auth: process.env.STRAPI_TOKEN,
  });

  const blogPosts = client.collection("posts");

  await blogPosts.update(documentId, { content: content }, { status: "draft" });
}
