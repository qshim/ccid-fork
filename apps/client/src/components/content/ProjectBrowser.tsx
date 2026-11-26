"use client";

import classNames from "classnames";
import { useEffect, useState } from "react";
import { localized, type Dictionary, type Locale } from "@/i18n";
import type { ProjectWithThemes } from "@/libs/content";
import type { Theme } from "@/types";
import { ProjectList } from "./ProjectList";

type ThemeOption = Pick<Theme, "number" | "slug" | "title_ko" | "title_en">;

/** 주소에서 고른 분야를 적는 이름: /projects?research=<분야 주소> */
const PARAM = "research";

/**
 * Projects 페이지: 리서치 분야로 거르기(컬러칩 버튼) + 연도별 묶음.
 * 고른 분야는 주소(?research=…)와 함께 움직여서 링크로 공유하고 뒤로 가기로 돌아갈 수 있습니다.
 */
export function ProjectBrowser({
  projects,
  themes,
  locale,
  dict,
}: {
  projects: ProjectWithThemes[];
  themes: ThemeOption[];
  locale: Locale;
  dict: Dictionary;
}) {
  const [slug, setSlug] = useState<string | null>(null);

  // 주소 → 고른 분야 (처음 열 때 · 뒤로/앞으로 가기)
  useEffect(() => {
    const read = () => {
      const value = new URLSearchParams(window.location.search).get(PARAM);
      setSlug(themes.some((theme) => theme.slug === value) ? value : null);
    };
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, [themes]);

  /** 분야 고르기 → 주소에도 적기 (열려 있던 프로젝트 #slug 는 지움) */
  const select = (next: string | null) => {
    setSlug(next);
    const url = new URL(window.location.href);
    if (next) url.searchParams.set(PARAM, next);
    else url.searchParams.delete(PARAM);
    window.history.pushState(null, "", url.pathname + url.search);
  };
  const shown = slug
    ? projects.filter((p) => p.themes.some((t) => t.slug === slug))
    : projects;

  return (
    <div className={classNames("flex flex-col gap-8")}>
      {/* 좁은 화면: 이 줄이 헤더 바로 아래에 붙어 따라옴 (부모가 목록 전체라 끝까지 붙어 있음) */}
      <div
        className={classNames(
          "grid gap-y-6 lg:grid-cols-10 lg:gap-x-10",
          "sticky top-18 z-20 -mx-5 lg:static lg:mx-0",
          "bg-background/90 backdrop-blur lg:bg-transparent lg:backdrop-blur-none",
        )}
      >
        {/*
          분야 필터. 좁은 화면: 한 줄 가로 스와이프 + 헤더 바로 아래에 붙어 있어 언제든 바꿀 수 있음.
          넓은 화면: 여러 줄로 놓임.
        */}
        <div
          role="group"
          aria-label={dict.projects.filterLabel}
          className={classNames(
            "flex snap-x scroll-px-5 gap-2 overflow-x-auto px-5 py-3 lg:flex-wrap lg:overflow-visible lg:p-0",
            "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            "lg:col-span-8 lg:col-start-3",
          )}
        >
          <button
            type="button"
            aria-pressed={slug === null}
            onClick={() => select(null)}
            className={classNames(
              "h-9 shrink-0 snap-start",
              "inline-flex items-center gap-2",
              "px-4",
              "rounded-full transition-colors duration-300",
              slug === null
                ? "bg-black text-white"
                : "bg-sheet/60 text-main hover:bg-sheet active:bg-sheet",
              "text-sm font-medium whitespace-nowrap",
            )}
          >
            {dict.projects.all}
          </button>
          {themes.map((theme) => (
            <button
              key={theme.slug}
              type="button"
              aria-pressed={slug === theme.slug}
              onClick={() => select(slug === theme.slug ? null : theme.slug)}
              className={classNames(
                "h-9 shrink-0 snap-start",
                "inline-flex items-center gap-2",
                "px-4",
                "rounded-full transition-colors duration-300",
                slug === theme.slug
                  ? "bg-black text-white"
                  : "bg-sheet/60 text-main hover:bg-sheet active:bg-sheet",
                "text-sm font-medium whitespace-nowrap",
              )}
            >
              {localized(theme, "title", locale)}
            </button>
          ))}
        </div>
      </div>

      {/* 필터를 바꾸면 목록이 새로 그려지며 살짝 페이드 */}
      <div
        key={slug ?? "all"}
        className={classNames(
          "transition-[opacity,translate] duration-500 ease-[cubic-bezier(.22,1,.36,1)]",
          "starting:translate-y-2 starting:opacity-0 motion-reduce:transition-none",
        )}
      >
        <ProjectList projects={shown} locale={locale} dict={dict} groupByYear />
      </div>
    </div>
  );
}
