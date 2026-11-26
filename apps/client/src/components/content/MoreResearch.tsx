"use client";

import classNames from "classnames";
import Link from "next/link";
import { useState } from "react";
import { HOVER_QUERY, useMediaQuery } from "@/hooks";

/** 분야 번호 → 이미지 아래 그라데이션 색. 지금은 모든 분야가 진보라(#24202e, 이전 푸터 색) — 분야 색으로 되돌릴 땐 from-theme-NN/90 (클래스는 통째로 적어야 Tailwind 가 만들어 줍니다) */
const GRADIENT: Record<number, string> = {
  1: "from-[#24202e]/90",
  2: "from-[#24202e]/90",
  3: "from-[#24202e]/90",
  4: "from-[#24202e]/90",
};

export type MoreResearchItem = {
  number: number;
  href: string;
  title: string;
  /** 영문 제목 (이미지 위 큰 글) */
  titleEn: string;
  /** 세부 분야 (쉼표로 이은 글, 이미지 위 작은 글) */
  keywords: string;
  question: string;
  image: string | null;
  imageAlt: string;
};

/**
 * 리서치 상세 맨 아래 "More research".
 * 다른 분야가 세로 목록(flex)으로 쌓이고, 한 줄은 [이미지 | 글] 입니다. 글은 분야마다 자기 줄 안에 있고 지금 분야만 보입니다.
 * 이미지는 자기 비율 그대로. 마우스를 올린(또는 포커스한) 분야는 폭이 꽉 차고 나머지는 75% 폭이라,
 * 폭이 바뀌는 만큼 높이도 따라 바뀌어 목록 전체가 자연스럽게 다시 자리를 잡습니다.
 * (좁은 화면: 이미지 위 · 글 아래 세로 카드, 글은 항상 보임)
 * 터치 화면(마우스 없음)은 올려서 고를 수 없으므로 넓은 화면이어도 모든 분야를 선명하게 다 보여 줍니다.
 */
export function MoreResearch({
  items,
  moreLabel,
}: {
  items: MoreResearchItem[];
  moreLabel: string;
}) {
  const [active, setActive] = useState(0);
  const canHover = useMediaQuery(HOVER_QUERY, true);
  if (!items.length) return null;

  return (
    <ol className={classNames("flex flex-col gap-10 lg:gap-4")}>
      {items.map((item, index) => {
        const isActive = !canHover || index === active;
        return (
          <li
            key={item.href}
            onMouseEnter={() => setActive(index)}
            onFocus={() => setActive(index)}
            className={classNames(
              "flex flex-col gap-4",
              "lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-6",
            )}
          >
            {/* 이미지: 자기 비율 그대로, 지금 분야는 칸을 꽉 · 나머지는 75% 폭 */}
            <Link
              href={item.href}
              cursor-label="Open"
              aria-label={item.title}
              className={classNames(
                "group block",
                "relative min-h-32 overflow-hidden",
                "rounded-2xl bg-sheet",
                "[&_img]:transition-transform [&_img]:duration-700 [&_img]:ease-[cubic-bezier(.22,1,.36,1)] group-hover:[&_img]:scale-105 group-active:[&_img]:scale-105",
                "lg:transition-[width,filter] lg:duration-700 lg:ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none",
                isActive ? "lg:w-full lg:blur-0" : "lg:w-3/4 lg:blur-[2.5px]",
              )}
            >
              {item.image ? (
                <img
                  src={item.image.split("#")[0]}
                  alt={item.imageAlt}
                  loading="lazy"
                  decoding="async"
                  className={classNames("block h-auto w-full")}
                />
              ) : (
                <span className={classNames("block aspect-[520/277] w-full")} />
              )}
              <span
                className={classNames(
                  "absolute inset-x-0 bottom-0 flex flex-col",
                  "px-5 pt-24 pb-4 md:px-7",
                  "bg-linear-to-t to-transparent",
                  GRADIENT[item.number] ?? "from-black/70",
                  "font-neuehaas font-light text-white",
                  "transition-opacity duration-500",
                  // 넓은 화면: 지금 분야만 · 좁은 화면: 항상
                  isActive ? "opacity-100" : "lg:opacity-0",
                )}
              >
                {item.keywords ? (
                  <span className={classNames("text-sm md:text-lg")}>
                    {item.keywords}
                  </span>
                ) : null}
                <span className={classNames("text-xl md:text-3xl")}>
                  {item.titleEn || item.title}
                </span>
              </span>
            </Link>

            {/* 글: 이 분야 줄의 오른쪽. 넓은 화면에서는 지금 분야일 때만 보임 */}
            <Link
              href={item.href}
              cursor-label="Open"
              // 이미지 링크와 같은 곳으로 가는 중복 링크라 Tab 순서에서는 뺌
              tabIndex={-1}
              className={classNames(
                "group flex flex-col gap-6 self-start lg:gap-9 lg:px-6",
                "transition-[opacity,filter] duration-500",
                isActive
                  ? "opacity-100 blur-0"
                  : "lg:pointer-events-none lg:opacity-0 lg:blur-sm",
              )}
            >
              <span className={classNames("flex flex-col gap-1")}>
                <span
                  className={classNames(
                    "font-neuehaas text-[15px] font-medium text-gray-500",
                  )}
                >
                  {String(item.number).padStart(2, "0")}
                </span>
                <span
                  className={classNames(
                    "text-2xl leading-snug font-medium break-keep",
                  )}
                >
                  {item.title}
                </span>
                <span
                  className={classNames(
                    "text-[15px] leading-normal break-keep whitespace-pre-line text-gray-500",
                  )}
                >
                  {item.question}
                </span>
              </span>
              <span
                className={classNames(
                  "inline-flex items-center gap-1.5",
                  "text-sm text-[#7e7e7e]",
                )}
              >
                {moreLabel}
                <span
                  aria-hidden
                  className={classNames(
                    "transition-transform duration-300 group-hover:translate-x-1 group-active:translate-x-1",
                  )}
                >
                  →
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
