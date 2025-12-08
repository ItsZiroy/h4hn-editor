"use client";

import { useCallback, useEffect, useState } from "react";
import type { Editor } from "@tiptap/react";

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";

// --- Icons ---
import { SumIcon } from "@/components/tiptap-icons/sum-icon";

// --- UI Utils ---
import { isNodeInSchema, isNodeTypeSelected } from "@/lib/tiptap-utils";

export const MATH_SHORTCUT_KEY = "mod+shift+m";

/**
 * Configuration for the math functionality
 */
export interface UseMathConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null;
  /**
   * Whether the button should hide when math is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean;
  /**
   * Callback function called after a successful toggle.
   */
  onToggled?: () => void;
}

/**
 * Checks if blockMath can be toggled in the current editor state
 */
export function canToggleMath(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  if (
    !isNodeInSchema("blockMath", editor) ||
    isNodeTypeSelected(editor, ["image"])
  )
    return false;

  // Can toggle if already active, or can insert new
  return (
    editor.isActive("blockMath") ||
    editor.can().insertContent({ type: "blockMath", attrs: { latex: "" } })
  );
}

/**
 * Checks if blockMath is currently active
 */
export function isMathActive(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  return editor.isActive("blockMath");
}

/**
 * Toggles blockMath in the editor
 */
export function toggleMath(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!canToggleMath(editor)) return false;

  try {
    const isActive = editor.isActive("blockMath");

    if (isActive) {
      return editor.chain().focus().setNode("paragraph").run();
    } else {
      return editor
        .chain()
        .focus()
        .insertContent({ type: "blockMath", attrs: { latex: "" } })
        .run();
    }
  } catch {
    return false;
  }
}

/**
 * Determines if the math button should be shown
 */
export function shouldShowButton(props: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
}): boolean {
  const { editor, hideWhenUnavailable } = props;

  if (!editor || !editor.isEditable) return false;
  if (!isNodeInSchema("blockMath", editor)) return false;

  if (hideWhenUnavailable) {
    return canToggleMath(editor);
  }

  return true;
}

/**
 * Custom hook that provides math functionality for Tiptap editor
 */
export function useMath(config?: UseMathConfig) {
  const {
    editor: providedEditor,
    hideWhenUnavailable = false,
    onToggled,
  } = config || {};

  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const canToggle = canToggleMath(editor);
  const isActive = isMathActive(editor);

  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowButton({ editor, hideWhenUnavailable }));
    };

    handleSelectionUpdate();

    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  const handleToggle = useCallback(() => {
    if (!editor) return false;

    const success = toggleMath(editor);
    if (success) {
      onToggled?.();
    }
    return success;
  }, [editor, onToggled]);

  return {
    isVisible,
    isActive,
    handleToggle,
    canToggle,
    label: "Math",
    shortcutKeys: MATH_SHORTCUT_KEY,
    Icon: SumIcon,
  };
}
