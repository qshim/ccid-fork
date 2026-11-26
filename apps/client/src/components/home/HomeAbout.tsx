"use client";

import classNames from "classnames";
import { type CSSProperties, useRef, useState } from "react";
import { useMediaQuery } from "@/hooks";
import type { Dictionary } from "@/i18n";
import { StrategySteps } from "./StrategySteps";
import { scrollToStep, useScrollStep } from "./useScrollStep";

/**
 * 홈 About: 큰 한 줄 소개 · 짧은 본문 두 단 · 역량 목록.
 * 역량은 흐린 큰 글자 목록이고, 고른 것만 진해지며 옆에 설명이 나옵니다.
 * - 넓은 화면(1024+): 스크롤하는 만큼 메뉴가 하나씩 넘어가고 오른쪽에 설명이 나옵니다.
 *   (구역을 메뉴 수만큼 길게 + 안쪽 화면 고정) 메뉴를 누르면 그 메뉴 자리로 스크롤합니다.
 * - 1024 미만(폰 · 태블릿): 누르면 메뉴 아래로 설명이 펼쳐지고, 다시 누르면 접히는 아코디언
 *   (처음엔 모두 접힘 · 한 번에 하나). 큰 글자가 한 칸 전체 폭을 써서 줄이 깨지지 않고, 호버가 필요 없습니다.
 */
export function HomeAbout({ dict }: { dict: Dictionary }) {
  const { lead, body, capabilitiesTitle, capabilities } = dict.about;
  const [active, setActive] = useState(0);
  const current = capabilities[active];
  const trackRef = useRef<HTMLDivElement>(null);
  useScrollStep(trackRef, capabilities.length, setActive);
  /** 1024 미만 아코디언: 펼친 메뉴 (없으면 null) */
  const [open, setOpen] = useState<number | null>(null);
  const narrow = useMediaQuery("(max-width: 1023.98px)");
  /**
   * 아코디언 토글: 페이지 스크롤은 그대로 두고 그 자리에서 펼치고 접습니다.
   * 브라우저는 내용 높이가 바뀌면 화면 속 글자 자리를 지키려고 페이지를 몰래 스크롤하는데(scroll anchoring),
   * 그러면 펼칠 때마다 페이지가 움직여 보여서 펼침 · 접힘이 움직이는 동안(0.5초)만 끕니다.
   */
  const anchorTimer = useRef(0);
  const toggle = (index: number) => {
    const root = document.documentElement.style;
    root.setProperty("overflow-anchor", "none");
    window.clearTimeout(anchorTimer.current);
    anchorTimer.current = window.setTimeout(() => {
      root.removeProperty("overflow-anchor");
    }, 700);
    setOpen((current) => (current === index ? null : index));
  };

  return (
    <div className={classNames("flex flex-col gap-16 md:gap-24")}>
      {/* 넓은 화면: 내용 8칸 중 글 5칸 · 모션 3칸 (사이트 그리드 칸에 맞춤). 중간 화면은 1.5 : 1 */}
      <div
        className={classNames(
          "grid gap-8",
          "md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] md:items-start md:gap-10",
          "lg:grid-cols-8 lg:gap-x-10",
        )}
      >
        <div
          className={classNames(
            "min-w-0 lg:col-span-5",
            "flex flex-col gap-10",
          )}
        >
          <p
            className={classNames(
              "text-lg leading-snug break-keep md:text-2xl 2xl:text-3xl",
            )}
          >
            {lead}
          </p>
          <p
            className={classNames(
              "text-sm md:text-base leading-relaxed break-keep text-sub",
            )}
          >
            {body}
          </p>
        </div>
        {/* Design Strategy: 단계가 계단처럼 이어지는 모션 */}
        <div
          className={classNames(
            "aspect-[4/3] w-full lg:col-span-3",
            "rounded-3xl bg-gray-100",
            "p-4 md:p-5",
          )}
        >
          <StrategySteps />
        </div>
      </div>

      {/*
        넓은 화면: 메뉴 수 × 화면 40% 만큼 길게 + 안쪽을 화면에 고정 → 스크롤하는 만큼 메뉴가 넘어감.
        (--steps = 메뉴 수. 높이 계산에만 씁니다)
      */}
      <div
        ref={trackRef}
        style={{ "--steps": capabilities.length } as CSSProperties}
        className={classNames("lg:h-[calc(var(--steps)*40svh+100svh)]")}
      >
        <div
          className={classNames(
            "lg:sticky lg:top-0 lg:flex lg:h-svh lg:items-center",
          )}
        >
          {/* 넓은 화면: 역량 목록 4칸 · 설명 4칸 */}
          <div className={classNames("grid w-full lg:grid-cols-8 lg:gap-x-10")}>
            <div className={classNames("lg:col-span-4")}>
              <h3
                className={classNames("mb-3", "font-neuehaas text-sm text-sub")}
              >
                {capabilitiesTitle}
              </h3>
              <ul className={classNames("flex flex-col")}>
                {capabilities.map((capability, index) => (
                  <li key={capability.name}>
                    <button
                      type="button"
                      // 1024 미만 = 아코디언(펼침 여부) · 넓은 화면 = 고른 메뉴(눌림 여부)
                      aria-expanded={narrow ? open === index : undefined}
                      aria-controls={
                        narrow ? `capability-panel-${index}` : undefined
                      }
                      aria-pressed={narrow ? undefined : index === active}
                      // 키보드 이동용 (넓은 화면). 좁은 화면은 누르면 포커스도 같이 와서 토글과 엇갈리므로 제외
                      onFocus={() => {
                        if (!narrow) setActive(index);
                      }}
                      onClick={() => {
                        if (narrow) toggle(index);
                        // 넓은 화면은 스크롤이 고르므로, 누르면 그 메뉴 자리로 스크롤
                        else
                          scrollToStep(
                            trackRef.current,
                            capabilities.length,
                            index,
                          );
                      }}
                      className={classNames(
                        "w-full py-1 lg:py-0.5",
                        "flex items-center justify-between gap-4",
                        "cursor-pointer",
                        "transition-[color,translate] duration-500 ease-[cubic-bezier(.22,1,.36,1)]",
                        "text-left font-neuehaas text-3xl leading-tight md:text-5xl min-[1920px]:text-6xl",
                        // 1024 미만: 펼친 것 = 진한 색 · 누르는 동안 한 톤 진해짐
                        open === index
                          ? "max-lg:text-main"
                          : "max-lg:text-gray-400 max-lg:active:text-gray-500",
                        // 넓은 화면: 고른 것 = 진한 색 / 마우스만 올린 것 = 살짝 오른쪽으로 밀리고 한 톤만 진해짐
                        index === active
                          ? "lg:text-main"
                          : "lg:text-gray-400 lg:hover:translate-x-3 lg:hover:text-gray-500",
                      )}
                    >
                      {capability.name}
                      {/* 1024 미만: 펼침 표시 (+ → ×) */}
                      <span
                        aria-hidden
                        className={classNames(
                          "shrink-0 lg:hidden",
                          "text-2xl font-light transition-transform duration-500 motion-reduce:transition-none md:text-4xl",
                          open === index && "rotate-45",
                        )}
                      >
                        +
                      </span>
                    </button>
                    {/* 1024 미만: 메뉴 바로 아래로 설명이 펼쳐짐 (아코디언) */}
                    <div
                      id={`capability-panel-${index}`}
                      // 접힌 설명은 화면 읽기 · 탭 이동에서 빠지게
                      inert={open !== index}
                      className={classNames(
                        "grid lg:hidden",
                        "transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none",
                        open === index
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0",
                      )}
                    >
                      <div className={classNames("overflow-hidden")}>
                        <p
                          className={classNames(
                            "max-w-xl pt-2 pb-6",
                            "text-base leading-7 break-keep text-main",
                          )}
                        >
                          {capability.description}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            {current ? (
              <div
                key={active}
                aria-live="polite"
                className={classNames(
                  "max-w-md self-start lg:col-span-4",
                  // 1024 미만은 메뉴 아래 아코디언으로 보여 주므로 숨김
                  "hidden lg:flex lg:flex-col lg:gap-2",
                  // 바뀔 때마다 살짝 떠오르며 나타남
                  "transition-[opacity,translate] duration-500 ease-[cubic-bezier(.22,1,.36,1)]",
                  "starting:translate-y-2 starting:opacity-0 motion-reduce:transition-none",
                )}
              >
                <p className={classNames("text-xl font-medium")}>
                  {current.name}
                </p>
                <p
                  className={classNames(
                    "text-base leading-7 break-keep text-sub",
                  )}
                >
                  {current.description}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
