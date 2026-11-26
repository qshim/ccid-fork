import classNames from "classnames";
import Link from "next/link";
import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

/**
 * 레이아웃 기준: 화면 너비 전체를 10칸으로 나누고 (바깥 여백 px-5 md:px-10 · 그리드 grid lg:grid-cols-10 lg:gap-x-10),
 * 왼쪽 2칸 = 제목, 오른쪽 8칸 = 내용. (홈 첫 화면만 자유 배치)
 * 내용 안에서도 칸에 맞추려면 lg:grid-cols-8 lg:gap-x-10 으로 다시 8칸을 나누세요. (바깥과 간격이 같아 칸 선이 맞음)
 */

/**
 * 구역: 왼쪽 2칸에 제목, 오른쪽 8칸에 내용 (+ 맨 아래 전체 보기). 구역끼리는 선 없이 넉넉한 위아래 여백으로 나눕니다.
 * 넓은 화면에서는 제목이 스크롤을 따라옵니다.
 * 모션: 화면에 들어오면 제목이 떠오르고 → 내용이 조금 늦게 따라옵니다.
 * hold: 넓은 화면에서 구역이 화면에 꽉 찬 채 한 번 멈췄다가 내려갑니다. (내용이 한 화면에 들어가는 구역에만)
 * closeBelow: 아래 여백만 줄임 (Research → Projects 처럼 바로 아래 구역이 가깝게 이어질 때)
 * tight: 아래 여백(+ 좁은 화면은 위 여백도)을 줄여 앞뒤 구역과 가깝게 (People 페이지처럼 같은 형식의 구역이 이어질 때)
 */
export function Section({
  id,
  title,
  action,
  hold = false,
  tight = false,
  closeBelow = false,
  children,
  className,
}: {
  id?: string;
  title: string;
  /** 내용 맨 아래 링크 (예: 전체 보기 → /projects). 목록을 다 본 뒤 더 볼지 정하는 흐름에 맞춰 아래에 둡니다. */
  action?: { href: string; label: string };
  /** 넓은 화면에서 한 번 멈췄다 내려가기 (구역을 화면 1.6배로 길게 + 안쪽을 화면에 고정) */
  hold?: boolean;
  /** 아래 여백(+ 좁은 화면은 위 여백) 줄이기 */
  tight?: boolean;
  /** 아래 여백만 줄이기 (바로 아래 구역이 가깝게 이어질 때. 위 여백은 그대로) */
  closeBelow?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={classNames(
        "scroll-mt-20",
        "px-5 md:px-10",
        hold && "lg:h-[160svh]",
        // 안쪽이 화면 가운데에 고정되는 구역(Research)은 끝날 때 아래에 "가운데 정렬 여유"가 남으므로 그만큼 다음 구역을 당겨 올림
        closeBelow && "lg:-mb-[14svh]",
        className,
      )}
    >
      <div
        className={classNames(
          "grid gap-y-8 lg:grid-cols-10 lg:gap-x-10",
          tight
            ? "pt-16 pb-8 md:pt-40 md:pb-12"
            : closeBelow
              ? "pt-24 pb-12 md:pt-40 md:pb-16"
              : "py-24 md:py-40",
          hold
            ? // 멈춰 있는 동안 제목은 다른 구역의 sticky 제목과 같은 높이(위에서 96px = top-24)에 두고, 내용 칸은 화면 세로 가운데에 놓음 (행이 화면 높이만큼 늘어나고 내용 칸이 그 가운데)
              "lg:sticky lg:top-0 lg:min-h-svh lg:content-stretch lg:py-24"
            : closeBelow
              ? // 아래 여백 = 당겨 올리는 만큼(14svh) + 16px: 위쪽 제목이 끝까지 붙어 있어서 이 여백이 모자라면 아래 구역 제목과 겹침. 화면 높이와 상관없이 제목 사이가 약 112px 로 일정
                "lg:pt-48 lg:pb-[calc(14svh+16px)]"
              : tight
                ? "lg:pt-48 lg:pb-16"
                : "lg:py-48",
        )}
      >
        <header
          className={classNames(
            "lg:col-span-2 lg:sticky lg:top-24 lg:self-start",
          )}
        >
          <Reveal>
            <h2 className={classNames("font-neuehaas text-2xl leading-tight")}>
              {title}
            </h2>
          </Reveal>
        </header>
        <Reveal
          delay={120}
          className={classNames("min-w-0 lg:col-span-8", {
            "lg:self-center": hold,
          })}
        >
          {children}
          {action ? (
            <div className={classNames("mt-12 md:mt-16")}>
              {/* 텍스트 버튼: 마우스를 올리거나 누르면 밑줄 · 화살표가 밀림 */}
              <Link
                href={action.href}
                className={classNames(
                  "group inline-flex items-center gap-1.5",
                  "font-neuehaas text-sm font-medium",
                  "underline-offset-4 hover:underline active:underline",
                )}
              >
                {action.label}
                <span
                  aria-hidden
                  className={classNames(
                    "transition-transform duration-300 group-hover:translate-x-1 group-active:translate-x-1",
                  )}
                >
                  →
                </span>
              </Link>
            </div>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}

/**
 * 알약 모양 링크 (면 기반).
 * 마우스를 올리거나 누르면 검정으로 채워지고 화살표가 그 방향으로 밀립니다.
 */
export function PillLink({
  href,
  arrow,
  children,
}: {
  href: string;
  /** 화살표 (오른쪽 = 더 보기 · 왼쪽 = 돌아가기) */
  arrow?: "left" | "right";
  children: ReactNode;
}) {
  const icon = arrow ? (
    <span
      aria-hidden
      className={classNames(
        "transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)]",
        arrow === "right"
          ? "group-hover:translate-x-1 group-active:translate-x-1"
          : "group-hover:-translate-x-1 group-active:-translate-x-1",
      )}
    >
      {arrow === "right" ? "→" : "←"}
    </span>
  ) : null;
  return (
    <Link
      href={href}
      className={classNames(
        "group h-9 shrink-0",
        "inline-flex items-center gap-1.5",
        "px-4",
        "rounded-full bg-sheet/60",
        "transition-colors duration-300 hover:bg-black hover:text-white active:bg-black active:text-white",
        "font-neuehaas text-sm font-medium whitespace-nowrap",
      )}
    >
      {arrow === "left" ? icon : null}
      {children}
      {arrow === "right" ? icon : null}
    </Link>
  );
}

/**
 * 페이지 머리 (구역과 같은 왼쪽 2칸 · 오른쪽 8칸 틀).
 * - 목록 페이지: 왼쪽에 큰 제목, 오른쪽에 설명 (titleSide="left", 기본)
 * - 상세 페이지: 왼쪽에 top(뒤로 가기 · 번호), 오른쪽에 큰 제목 · 설명 (titleSide="right")
 * - descriptionDesktopOnly: 좁은 화면(md 미만)에서는 설명을 숨김 (Research 목록)
 */
export function PageHeader({
  title,
  description,
  descriptionDesktopOnly = false,
  top,
  titleSide = "left",
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  /** 좁은 화면에서 설명 숨기기 */
  descriptionDesktopOnly?: boolean;
  top?: ReactNode;
  titleSide?: "left" | "right";
  children?: ReactNode;
}) {
  // 오른쪽 칸에 설명만 있으면 설명을 숨길 때 칸도 같이 숨겨, 빈 칸 몫의 간격이 생기지 않게 함
  const hideRight = descriptionDesktopOnly && titleSide === "left" && !children;
  const heading = (
    <h1
      className={classNames(
        "font-neuehaas text-3xl leading-[1.02] break-keep md:text-5xl",
      )}
    >
      {title}
    </h1>
  );
  return (
    <div className={classNames("px-5 md:px-10", "pt-32 pb-4 md:pt-40")}>
      <div
        className={classNames("grid gap-y-6 lg:grid-cols-10 lg:gap-x-10", {
          "lg:items-end": titleSide === "left",
        })}
      >
        <div className={classNames("flex flex-col gap-6 lg:col-span-2")}>
          {top}
          {titleSide === "left" ? heading : null}
        </div>
        <div
          className={classNames("min-w-0 lg:col-span-8", [
            "flex flex-col gap-4",
            { "max-md:hidden": hideRight },
          ])}
        >
          {titleSide === "right" ? heading : null}
          {description ? (
            <div
              className={classNames(
                "max-w-2xl",
                { "max-md:hidden": descriptionDesktopOnly },
                "text-base leading-7 text-sub",
              )}
            >
              {description}
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </div>
  );
}

/** 작은 알약 목록 (키워드 · 해시태그) — admin 미리보기와 같은 공용 컴포넌트 */
export { Pills } from "@repo/blocks";
