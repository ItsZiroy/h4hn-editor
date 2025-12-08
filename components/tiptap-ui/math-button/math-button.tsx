"use client";

import { forwardRef, useCallback } from "react";

// --- Tiptap UI ---
import type { UseMathConfig } from "@/components/tiptap-ui/math-button";
import { MATH_SHORTCUT_KEY, useMath } from "@/components/tiptap-ui/math-button";

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";

// --- Lib ---
import { parseShortcutKeys } from "@/lib/tiptap-utils";

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button";
import { Button } from "@/components/tiptap-ui-primitive/button";
import { Badge } from "@/components/tiptap-ui-primitive/badge";

export interface MathButtonProps
  extends Omit<ButtonProps, "type">,
    UseMathConfig {
  /**
   * Optional text to display alongside the icon.
   */
  text?: string;
  /**
   * Optional show shortcut keys in the button.
   * @default false
   */
  showShortcut?: boolean;
}

export function MathShortcutBadge({
  shortcutKeys = MATH_SHORTCUT_KEY,
}: {
  shortcutKeys?: string;
}) {
  return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>;
}

/**
 * Button component for toggling math in a Tiptap editor.
 *
 * For custom button implementations, use the `useMath` hook instead.
 */
export const MathButton = forwardRef<HTMLButtonElement, MathButtonProps>(
  (
    {
      editor: providedEditor,
      text,
      hideWhenUnavailable = false,
      onToggled,
      showShortcut = false,
      onClick,
      children,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const {
      isVisible,
      canToggle,
      isActive,
      handleToggle,
      label,
      shortcutKeys,
      Icon,
    } = useMath({
      editor,
      hideWhenUnavailable,
      onToggled,
    });

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        handleToggle();
      },
      [handleToggle, onClick]
    );

    if (!isVisible) {
      return null;
    }

    return (
      <Button
        type="button"
        data-style="ghost"
        data-active-state={isActive ? "on" : "off"}
        role="button"
        disabled={!canToggle}
        data-disabled={!canToggle}
        tabIndex={-1}
        aria-label={label}
        aria-pressed={isActive}
        tooltip={label}
        onClick={handleClick}
        {...buttonProps}
        ref={ref}
      >
        {children ?? (
          <>
            <Icon className="tiptap-button-icon" />
            {text && <span className="tiptap-button-text">{text}</span>}
            {showShortcut && <MathShortcutBadge shortcutKeys={shortcutKeys} />}
          </>
        )}
      </Button>
    );
  }
);

MathButton.displayName = "MathButton";
