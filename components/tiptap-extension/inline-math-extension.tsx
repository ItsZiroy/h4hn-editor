"use client";

import { Node, mergeAttributes, InputRule } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { Node as PMNode } from "@tiptap/pm/model";
import katex from "katex";
import { useEffect, useRef, useState } from "react";

import "katex/dist/katex.min.css";

interface InlineMathNodeViewProps {
  node: PMNode;
  updateAttributes: (attrs: Record<string, unknown>) => void;
  selected: boolean;
}

function InlineMathNodeView({
  node,
  updateAttributes,
  selected,
}: InlineMathNodeViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(node.attrs.latex || "");
  const inputRef = useRef<HTMLInputElement>(null);
  const mathRef = useRef<HTMLSpanElement>(null);
  const latexValue = node.attrs.latex || "";

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Render KaTeX - either preview while editing or final when not editing
  useEffect(() => {
    if (mathRef.current) {
      const latex = isEditing ? editValue : latexValue;
      try {
        katex.render(latex || "\\text{...}", mathRef.current, {
          throwOnError: false,
          displayMode: false,
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

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsEditing(false);
    updateAttributes({ latex: e.target.value });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Escape") {
      e.preventDefault();
      setIsEditing(false);
      updateAttributes({ latex: e.currentTarget.value });
    }
  };

  return (
    <NodeViewWrapper
      as="span"
      className={`inline-math-node ${selected ? "selected" : ""} ${
        isEditing ? "editing" : ""
      }`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: isEditing ? "2px 6px" : "0",
        borderRadius: "var(--tt-radius-xs)",
        backgroundColor: isEditing ? "var(--tt-card-bg-color)" : "transparent",
        border: isEditing ? "1px solid var(--tt-border-color)" : "none",
      }}
    >
      {/* Preview always shown first */}
      <span
        ref={mathRef}
        onClick={handleClick}
        className={isEditing ? "inline-math-preview" : "inline-math-render"}
        style={{
          cursor: isEditing ? "default" : "pointer",
          padding: "0 2px",
          borderRadius: "var(--tt-radius-xxs)",
          backgroundColor:
            !isEditing && selected
              ? "var(--tt-selection-color)"
              : isEditing
              ? "var(--tt-sidebar-bg-color)"
              : "transparent",
          ...(isEditing && {
            padding: "2px 6px",
          }),
        }}
      />
      {/* Input below preview when editing */}
      {isEditing && (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="inline-math-input"
          style={{
            fontFamily: "monospace",
            fontSize: "inherit",
            padding: "2px 6px",
            border: "1px solid var(--tt-border-color)",
            borderRadius: "var(--tt-radius-xxs)",
            backgroundColor: "var(--tt-bg-color)",
            color: "inherit",
            minWidth: "60px",
            outline: "none",
          }}
        />
      )}
    </NodeViewWrapper>
  );
}

export const InlineMathExtension = Node.create({
  name: "inlineMath",
  group: "inline",
  inline: true,
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
        tag: 'span[data-type="inline-math"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, { "data-type": "inline-math" }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(InlineMathNodeView);
  },

  addInputRules() {
    return [
      new InputRule({
        // Match $...$ pattern (but not $$)
        find: /(?<!\$)\$([^$]+)\$(?!\$)$/,
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
