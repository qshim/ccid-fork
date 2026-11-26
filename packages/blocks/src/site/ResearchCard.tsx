import classNames from "classnames";
import { Pills, PlainLink, SiteImage, type SiteLink } from "./shared";

/** Research 목록의 분야 한 줄에 들어가는 값 (이미 고른 언어) */
export type ResearchCardData = {
  title: string;
  /** 한국어 화면에서 보조로 보이는 영문 제목 (없으면 비움) */
  subtitle: string;
  question: string;
  summary: string;
  keywords: string[];
  image: string | null;
  imageAlt: string;
  href: string;
};

/**
 * Research 목록의 분야 한 장 (박스 없이, 왼쪽 글 · 오른쪽 대표 이미지). 칸 배치는 쓰는 쪽이 className 으로 정합니다.
 * 크기는 홈과 맞추고(가장 큰 글 = 홈 About 소개 문장 크기), 위계는 크기 · 간격 · 자리로 나눕니다:
 *   ① 분야 이름(+ 영문 부제) — 작은 머리말, 바로 아래 ② 질문 — 가장 크게 (①②는 붙여 한 덩어리)
 *   ③ 요약 — 작은 회색 본문 (조금 띄움)
 *   ④ 키워드 · 자세히 보기 — 가장 작게, 이미지 아래 끝에 맞춰 맨 아래
 * 질문이 없으면 분야 이름이 큰 글 자리로 올라갑니다.
 * 모션: 마우스를 올리면 이미지가 살짝 확대되고, 화살표가 밀립니다.
 */
export function ResearchCard({
  theme,
  moreLabel,
  className,
  Link = PlainLink,
}: {
  theme: ResearchCardData;
  moreLabel: string;
  className?: string;
  Link?: SiteLink;
}) {
  return (
    <Link
      href={theme.href}
      cursorLabel="Open"
      className={classNames(
        className,
        "group grid gap-10 md:grid-cols-2 md:gap-12",
      )}
    >
      {/* 요약 ↔ 키워드 간격: 좁은 화면은 24px 로 줄여 붙임 (md 이상 40px) */}
      <span className={classNames("flex flex-col gap-6 md:gap-10")}>
        {/* ① 분야 이름 + ② 질문 (한 덩어리) → ③ 요약 */}
        <span className={classNames("flex flex-col gap-6")}>
          <span className={classNames("flex flex-col gap-3")}>
            {theme.question ? (
              <span
                className={classNames(
                  "flex flex-wrap items-baseline gap-x-2 gap-y-0.5",
                )}
              >
                <span
                  className={classNames("text-base font-medium break-keep")}
                >
                  {theme.title}
                </span>
                {theme.subtitle ? (
                  <span
                    className={classNames("font-neuehaas text-sm text-sub")}
                  >
                    {theme.subtitle}
                  </span>
                ) : null}
              </span>
            ) : null}
            <span
              className={classNames(
                "text-2xl leading-snug whitespace-pre-line break-keep md:text-3xl 2xl:text-4xl",
              )}
            >
              {theme.question || theme.title}
            </span>
          </span>
          {theme.summary ? (
            <span
              className={classNames(
                "max-w-md",
                "text-sm leading-6 break-keep text-sub",
              )}
            >
              {theme.summary}
            </span>
          ) : null}
        </span>
        {/* ④ 키워드 · 자세히 보기 (가장 작게, 맨 아래) */}
        <span className={classNames("mt-auto flex flex-col gap-5")}>
          {theme.keywords.length ? <Pills items={theme.keywords} /> : null}
          <span
            className={classNames(
              "inline-flex items-center gap-1.5",
              "font-neuehaas text-sm font-medium",
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
        </span>
      </span>
      {theme.image ? (
        <span
          className={classNames(
            "block self-start overflow-hidden rounded-3xl",
            "[&_img]:transition-transform [&_img]:duration-700 [&_img]:ease-[cubic-bezier(.22,1,.36,1)] group-hover:[&_img]:scale-105 group-active:[&_img]:scale-105",
          )}
        >
          <SiteImage src={theme.image} alt={theme.imageAlt} />
        </span>
      ) : null}
    </Link>
  );
}
