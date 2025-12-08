"use server";
import { strapi } from "@strapi/client";

export async function updatePost(formData: FormData) {
  "use server";
  const content = formData.get("content");
  const documentId = formData.get("documentId") as string;

  const client = strapi({
    baseURL: process.env.STRAPI_URL + "/api" || "http://localhost:1337/api",
    auth: process.env.STRAPI_TOKEN,
  });

  const blogPosts = client.collection("posts");

  await blogPosts.update(documentId, { content: content }, { status: "draft" });
}

export async function uploadImage(formData: FormData) {
  "use server";
  const file = formData.get("file") as File;

  if (!file) {
    throw new Error("No file provided");
  }

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File size exceeds maximum allowed (${MAX_FILE_SIZE / (1024 * 1024)}MB)`
    );
  }

  const client = strapi({
    baseURL: process.env.STRAPI_URL + "/api" || "http://localhost:1337/api",
    auth: process.env.STRAPI_TOKEN,
  });

  const uploadedFile = await client.files.upload(file);

  if (!uploadedFile) {
    throw new Error("Upload failed: No file returned from server");
  }

  return {
    url: process.env.STRAPI_URL + uploadedFile[0].url,
    id: uploadedFile[0].id,
  };
}

export async function deleteImage(fileId: number) {
  "use server";

  if (!fileId) {
    throw new Error("No file ID provided");
  }

  const client = strapi({
    baseURL: process.env.STRAPI_URL + "/api" || "http://localhost:1337/api",
    auth: process.env.STRAPI_TOKEN,
  });

  await client.files.delete(fileId);
}

export async function publishPost(formData: FormData) {
  "use server";
  const content = formData.get("content");
  const documentId = formData.get("documentId") as string;

  if (!documentId) {
    throw new Error("No document ID provided");
  }

  const client = strapi({
    baseURL: process.env.STRAPI_URL + "/api" || "http://localhost:1337/api",
    auth: process.env.STRAPI_TOKEN,
  });

  const blogPosts = client.collection("posts");

  await blogPosts.update(
    documentId,
    { content: content },
    { status: "published" }
  );

  return { success: true };
}
