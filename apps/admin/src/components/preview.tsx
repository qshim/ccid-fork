"use client";

import classNames from "classnames";
import { useState, type ReactNode } from "react";
import type { SiteLink } from "@repo/blocks";
import { Button } from "@repo/common";

/** 미리보기 언어 */
export type PreviewLang = "ko" | "en";
/** 폼에 지금 들어 있는 값 (이름 → 값들). 저장 전 내용입니다. */
export type FormValues = Record<string, string[]>;

/** 폼의 지금 값을 읽습니다. (체크박스는 켜졌을 때만, 같은 이름은 여러 개) */
export function readForm(form: HTMLFormElement): FormValues {
  const values: FormValues = {};
  new FormData(form).forEach((value, key) => {
    if (typeof value !== "string") return;
    (values[key] ??= []).push(value);
  });
  return values;
}

/** 첫 번째 값 */
export const first = (values: FormValues, name: string) =>
  values[name]?.[0]?.trim() ?? "";

/** 한/영 칸에서 고른 언어 값 (비어 있으면 다른 언어 — 사이트와 같은 규칙) */
export function pickText(values: FormValues, name: string, lang: PreviewLang) {
  const other: PreviewLang = lang === "ko" ? "en" : "ko";
  return first(values, `${name}_${lang}`) || first(values, `${name}_${other}`);
}

/** 쉼표 · 줄바꿈 목록 (한/영 중 고른 언어, 비면 다른 언어) */
export function pickList(values: FormValues, name: string, lang: PreviewLang) {
  return pickText(values, name, lang)
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * 사이트 고정 문구 (client 의 i18n/dictionaries 와 같은 값).
 * 사이트 문구를 바꾸면 여기도 맞춰 주세요.
 */
export const SITE_TEXT = {
  ko: {
    nda: "NDA",
    ndaNote: "NDA 프로젝트라 기본 정보만 공개합니다.",
    research: "Related research",
    more: "자세히 보기",
    /** 프로젝트 모달의 리서치 카드 버튼 */
    researchMore: "리서치 자세히 보기",
    close: "닫기",
    profile: "약력 전체 보기",
  },
  en: {
    nda: "NDA",
    ndaNote: "This project is under NDA, so only basic details are shown.",
    research: "Related research",
    more: "Learn more",
    researchMore: "Explore research",
    close: "Close",
    profile: "Read full bio",
  },
} as const;

/** 미리보기 안의 링크: 누르지 않는 상자 (모양만 같게) */
export const PreviewLink: SiteLink = ({ className, children }) => (
  <div className={className}>{children}</div>
);

/** 미리보기 안의 한 장면 (작은 제목 + 사이트 모양) */
export function PreviewScene({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <section className={classNames("flex flex-col gap-4")}>
      <h3 className={classNames("font-neuehaas text-xs font-medium text-sub")}>
        {label}
      </h3>
      {children}
    </section>
  );
}

/**
 * 사이트 미리보기 창 (도구 막대 아래 오른쪽). 왼쪽 폼을 고치면 바로 바뀌고, 한/영을 바꿔 볼 수 있습니다.
 * 도구 막대(저장 · 미리보기 닫기)는 가리지 않습니다.
 * 사이트와 같은 공용 컴포넌트(@repo/blocks)로 그립니다.
 */
export function PreviewPanel({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: (lang: PreviewLang) => ReactNode;
}) {
  const [lang, setLang] = useState<PreviewLang>("ko");
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="사이트 미리보기"
      className={classNames(
        "w-[min(calc(100%-1.5rem),max(640px,56vw))]",
        "fixed top-24 right-3 bottom-3 z-30 flex flex-col overflow-hidden md:top-28",
        "rounded-3xl bg-background shadow-2xl ring-1 ring-black/5",
      )}
    >
      <div
        className={classNames(
          "flex items-center gap-3",
          "py-3 pr-3 pl-6",
          "bg-sheet/60",
        )}
      >
        <div className={classNames("min-w-0 flex-1")}>
          <p className={classNames("text-sm font-semibold")}>사이트 미리보기</p>
          <p className={classNames("truncate", "text-xs text-sub")}>
            저장 전 내용이 그대로 보입니다. 비공개여도 보여 줍니다.
          </p>
        </div>
        <div
          role="group"
          aria-label="언어"
          className={classNames("flex", "p-1", "rounded-xl bg-white")}
        >
          {(["ko", "en"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={lang === value}
              onClick={() => setLang(value)}
              className={classNames(
                "h-7",
                "px-3",
                ["rounded-lg transition", lang === value ? "bg-sheet" : ""],
                [
                  "font-neuehaas text-xs font-medium uppercase",
                  lang === value ? "text-main" : "text-sub",
                ],
              )}
            >
              {value}
            </button>
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          닫기
        </Button>
      </div>
      <div
        lang={lang}
        className={classNames(
          "min-h-0 flex-1 overflow-y-auto",
          "flex flex-col gap-12",
          "p-6 md:p-10",
        )}
      >
        {children(lang)}
      </div>
    </div>
  );
}
