"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { HOVER_QUERY } from "@/hooks";

/**
 * 터치 화면용 "스포트라이트": 마우스가 없으면 호버 그라데이션을 볼 수 없으므로,
 * 스크롤하다 화면 가운데 띠에 들어온 줄에 `data-spotlight` 를 붙입니다. (한 번에 한 줄)
 * 줄 안에서는 `group-data-spotlight:` 로 호버와 같은 모습을 보여 줍니다.
 * 마우스가 있는 기기에서는 아무것도 하지 않습니다. (호버 그대로)
 *
 * 줄(링크)에 `data-spotlight-row` 를 달아 둡니다.
 */
export function ProjectsSpotlight({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = ref.current;
    if (!list) return;
    const hover = window.matchMedia(HOVER_QUERY);
    let observer: IntersectionObserver | null = null;

    const start = () => {
      observer?.disconnect();
      list
        .querySelectorAll("[data-spotlight]")
        .forEach((row) => row.removeAttribute("data-spotlight"));
      if (hover.matches) return;
      const rows = [...list.querySelectorAll("[data-spotlight-row]")];
      const inBand = new Set<Element>();
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) inBand.add(entry.target);
            else inBand.delete(entry.target);
          }
          // 띠에 두 줄이 걸치면 위쪽 줄 하나만
          const current = rows.find((row) => inBand.has(row));
          for (const row of rows) {
            if (row === current) row.setAttribute("data-spotlight", "");
            else row.removeAttribute("data-spotlight");
          }
        },
        // 화면 가운데 10% 높이의 띠
        { rootMargin: "-45% 0px -45% 0px" },
      );
      rows.forEach((row) => observer?.observe(row));
    };

    start();
    hover.addEventListener("change", start);
    return () => {
      hover.removeEventListener("change", start);
      observer?.disconnect();
    };
  }, []);

  return (
    <ul ref={ref} className={className}>
      {children}
    </ul>
  );
}
