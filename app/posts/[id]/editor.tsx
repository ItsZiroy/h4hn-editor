"use client";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { useParams, useRouter } from "next/navigation";
import { updatePost, publishPost } from "./actions";
import { useEffect, useRef, useState } from "react";

export default function Editor({
  content,
  initialStatus,
}: {
  content?: string;
  initialStatus?: "draft" | "published";
}) {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const contentRef = useRef<string>(content || "");
  const syncTimeoutRef = useRef<NodeJS.Timeout>(null);
  const [status, setStatus] = useState<"draft" | "published" | "publishing">(
    initialStatus || "draft"
  );

  const syncContent = async () => {
    const formData = new FormData();
    formData.append("content", contentRef.current);
    formData.append("documentId", params.id as string);
    await updatePost(formData);
    // After saving content, status becomes draft if it was published
    if (status === "published") {
      setStatus("draft");
    }
  };

  const handlePublish = async () => {
    setStatus("publishing");
    try {
      // First save any pending content
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      await syncContent();

      // Then publish
      const formData = new FormData();
      formData.append("documentId", params.id as string);
      formData.append("content", contentRef.current);
      await publishPost(formData);
      setStatus("published");
    } catch (error) {
      console.error("Failed to publish:", error);
      setStatus("draft");
    }
  };

  const handleBack = () => {
    router.push("/");
  };

  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <SimpleEditor
        documentId={params.id}
        strapiAdminUrl={process.env.NEXT_PUBLIC_STRAPI_ADMIN_URL}
        content={content}
        onBack={handleBack}
        onPublish={handlePublish}
        status={status}
        onUpdate={(e) => {
          const jsonContent = e.editor.getJSON();
          contentRef.current = JSON.stringify(jsonContent);

          if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current);
          }

          syncTimeoutRef.current = setTimeout(() => {
            syncContent();
          }, 500);
        }}
      />
    </>
  );
}
