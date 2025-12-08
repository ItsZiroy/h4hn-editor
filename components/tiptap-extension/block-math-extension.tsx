"use client";

import { Node, mergeAttributes, InputRule } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { Node as PMNode } from "@tiptap/pm/model";
import katex from "katex";
import { useEffect, useRef, useState } from "react";

import "katex/dist/katex.min.css";

interface BlockMathNodeViewProps {
  node: PMNode;
  updateAttributes: (attrs: Record<string, unknown>) => void;
  selected: boolean;
}

function BlockMathNodeView({
  node,
  updateAttributes,
  selected,
}: BlockMathNodeViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(node.attrs.latex || "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mathRef = useRef<HTMLDivElement>(null);
  const latexValue = node.attrs.latex || "";

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  // Render KaTeX - either preview while editing or final when not editing
  useEffect(() => {
    if (mathRef.current) {
      const latex = isEditing ? editValue : latexValue;
      try {
        katex.render(latex || "\\text{...}", mathRef.current, {
          throwOnError: false,
          displayMode: true,
        });
      } catch {
        if (mathRef.current) {
          mathRef.current.textContent = latex || "...";
        }
      }
    }
  }, [latexValue, editValue, isEditing]);

  const handleClick = () => {
    if (!isEditing) {
      setEditValue(latexValue);
      setIsEditing(true);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsEditing(false);
    updateAttributes({ latex: e.target.value });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setIsEditing(false);
      updateAttributes({ latex: e.currentTarget.value });
    }
    // Allow Shift+Enter for new lines, Enter alone to save
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      setIsEditing(false);
      updateAttributes({ latex: e.currentTarget.value });
    }
  };

  return (
    <NodeViewWrapper
      className={`block-math-node ${selected ? "selected" : ""} ${
        isEditing ? "editing" : ""
      }`}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          padding: isEditing ? "12px" : "0",
          border: isEditing ? "1px solid var(--tt-border-color)" : "none",
          borderRadius: "var(--tt-radius-md)",
          backgroundColor: isEditing
            ? "var(--tt-card-bg-color)"
            : "transparent",
        }}
      >
        {/* Preview always shown first */}
        <div
          ref={mathRef}
          onClick={handleClick}
          className={isEditing ? "block-math-preview" : "block-math-render"}
          style={{
            cursor: isEditing ? "default" : "pointer",
            padding: isEditing ? "12px" : "16px",
            borderRadius: "var(--tt-radius-xs)",
            backgroundColor: isEditing
              ? "var(--tt-sidebar-bg-color)"
              : selected
              ? "var(--tt-selection-color)"
              : "transparent",
            textAlign: "center",
            minHeight: isEditing ? "40px" : "auto",
          }}
        />
        {/* Textarea below preview when editing */}
        {isEditing && (
          <textarea
            ref={textareaRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="block-math-input"
            rows={3}
            style={{
              width: "100%",
              fontFamily: "monospace",
              fontSize: "inherit",
              padding: "8px 12px",
              border: "1px solid var(--tt-border-color)",
              borderRadius: "var(--tt-radius-xs)",
              backgroundColor: "var(--tt-bg-color)",
              color: "inherit",
              resize: "vertical",
              outline: "none",
            }}
          />
        )}
      </div>
    </NodeViewWrapper>
  );
}

export const BlockMathExtension = Node.create({
  name: "blockMath",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      latex: {
        default: "",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="block-math"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "block-math" }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(BlockMathNodeView);
  },

  addInputRules() {
    return [
      new InputRule({
        // Match $$...$$ pattern at the start of a line
        find: /^\$\$([^$]+)\$\$$/,
        handler: ({ state, range, match }) => {
          const latex = match[1];
          const { tr } = state;

          if (latex) {
            tr.replaceWith(range.from, range.to, this.type.create({ latex }));
          }
        },
      }),
    ];
  },
});
