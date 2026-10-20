"use client";

import { useEffect, useRef, type RefObject } from "react";

type DragScrollState = {
  active: boolean;
  startY: number;
  startScroll: number;
  pointerId: number;
};

export function useDragScroll(
  p_ref: RefObject<HTMLElement | null>,
): void {
  const stateRef: RefObject<DragScrollState> = useRef<DragScrollState>({
    active: false,
    startY: 0,
    startScroll: 0,
    pointerId: -1,
  });

  useEffect(() => {
    const node: HTMLElement | null = p_ref.current;
    if (node === null) {
      return;
    }

    const onPointerDown = (p_event: PointerEvent): void => {
      if (p_event.pointerType !== "mouse" || p_event.button !== 0) {
        return;
      }
      const target: EventTarget | null = p_event.target;
      if (target instanceof HTMLElement) {
        const tag: string = target.tagName;
        if (
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          tag === "SELECT" ||
          tag === "BUTTON" ||
          tag === "A" ||
          target.isContentEditable
        ) {
          return;
        }
      }
      stateRef.current = {
        active: true,
        startY: p_event.clientY,
        startScroll: node.scrollTop,
        pointerId: p_event.pointerId,
      };
      node.setPointerCapture(p_event.pointerId);
      node.dataset.dragScroll = "true";
    };

    const onPointerMove = (p_event: PointerEvent): void => {
      const state: DragScrollState = stateRef.current;
      if (!state.active || p_event.pointerId !== state.pointerId) {
        return;
      }
      const delta: number = p_event.clientY - state.startY;
      node.scrollTop = state.startScroll - delta;
      p_event.preventDefault();
    };

    const endDrag = (p_event: PointerEvent): void => {
      const state: DragScrollState = stateRef.current;
      if (!state.active || p_event.pointerId !== state.pointerId) {
        return;
      }
      stateRef.current = {
        active: false,
        startY: 0,
        startScroll: 0,
        pointerId: -1,
      };
      if (node.hasPointerCapture(p_event.pointerId)) {
        node.releasePointerCapture(p_event.pointerId);
      }
      delete node.dataset.dragScroll;
    };

    node.addEventListener("pointerdown", onPointerDown);
    node.addEventListener("pointermove", onPointerMove);
    node.addEventListener("pointerup", endDrag);
    node.addEventListener("pointercancel", endDrag);
    return (): void => {
      node.removeEventListener("pointerdown", onPointerDown);
      node.removeEventListener("pointermove", onPointerMove);
      node.removeEventListener("pointerup", endDrag);
      node.removeEventListener("pointercancel", endDrag);
    };
  }, [p_ref]);
}
