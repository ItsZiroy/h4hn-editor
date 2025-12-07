"use client";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { useParams } from "next/navigation";
import { updatePost } from "./actions";
import { useEffect, useRef } from "react";

export default function Editor({ content }: { content?: string }) {
  const params = useParams<{ id: string }>();
  const contentRef = useRef<string>(content || "");
  const syncTimeoutRef = useRef<NodeJS.Timeout>(null);

  const syncContent = async () => {
    const formData = new FormData();
    formData.append("content", contentRef.current);
    formData.append("documentId", params.id as string);
    await updatePost(formData);
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
        content={content}
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
