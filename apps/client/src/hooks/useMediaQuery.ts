"use client";

import { useSyncExternalStore } from "react";

/**
 * 미디어 쿼리가 맞는지 (화면 폭 · 마우스 유무 등).
 * 서버 렌더와 첫 화면에는 `serverValue` 를 쓰고, 그다음 실제 값으로 바뀝니다. (hydration 오류 없음)
 *
 * 예: `useMediaQuery("(hover: hover) and (pointer: fine)")` → 마우스가 있는 기기
 */
export function useMediaQuery(query: string, serverValue = false) {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

/** 마우스처럼 올려 둘 수 있는 기기 (터치 화면이면 false) */
export const HOVER_QUERY = "(hover: hover) and (pointer: fine)";
