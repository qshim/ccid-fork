import classNames from "classnames";
import { NdaBadge } from "./shared";

/** 프로젝트 목록의 한 줄 카드에 들어가는 값 (이미 고른 언어) */
export type ProjectCardData = {
  year: string;
  title: string;
  client: string;
  description: string;
  nda: boolean;
  /** 속한 리서치 분야 번호 (주 분야 먼저). 홈 프로젝트의 호버 그라데이션(themeGlow)에 씁니다. 없으면 비움 */
  themes?: number[];
};

/** 분야 번호 → 색 (global.css 의 --color-theme-NN 과 같은 값. 변수가 없어도 보이도록 값을 함께 적음) */
const THEME_COLOR: Record<number, string> = {
  1: "var(--color-theme-01, #6720ff)",
  2: "var(--color-theme-02, #ff4ff0)",
  3: "var(--color-theme-03, #ff7835)",
  4: "var(--color-theme-04, #39caff)",
};

/**
 * 홈 프로젝트 줄에 호버 때 깔리는 분야 색 그라데이션.
 * 겹치는 층 없이 **가로 그라데이션 하나**: 왼쪽은 아주 옅게 → 오른쪽으로 갈수록 진해짐.
 * 소속 분야가 여러 개면 같은 그라데이션 안에서 색이 왼쪽부터 차례로 이어집니다.
 * 분야 수가 달라져도 값이 바로 바뀌어야 해서 inline style 로 만듭니다.
 */
export function themeGlow(themes: number[]) {
  const colors = themes.flatMap((n) =>
    THEME_COLOR[n] ? [THEME_COLOR[n]] : [],
  );
  const first = colors[0];
  if (!first) return undefined;
  const tint = (color: string, percent: number) =>
    `color-mix(in srgb, ${color} ${percent}%, transparent)`;
  const stops =
    colors.length === 1
      ? [
          `${tint(first, 4)} 0%`,
          `${tint(first, 10)} 50%`,
          `${tint(first, 22)} 100%`,
        ]
      : [
          `${tint(first, 4)} 0%`,
          ...colors.map(
            (color, i) =>
              `${tint(color, i === colors.length - 1 ? 22 : 14)} ${Math.round((100 * (i + 1)) / colors.length)}%`,
          ),
        ];
  return `linear-gradient(90deg, ${stops.join(", ")})`;
}

/**
 * 프로젝트 카드. onClick 이 있으면 누를 수 있는 버튼, 없으면 그냥 상자입니다.
 * - 한 줄 카드(기본, 리서치 상세의 Projects): 바탕 없이 글만. 왼쪽 연도 → 제목(+ 같은 줄 회사명) → 설명 / 오른쪽 위 ⋯
 * - tile: 2단 격자의 흰 카드 (Projects 페이지) — 위에 제목 · 설명, 아래 왼쪽 회사명 · 오른쪽 ⋯
 * NDA 프로젝트는 흐리게 보입니다.
 * 모션: 마우스를 올리면 ⋯ 버튼이 검정으로 바뀌며 살짝 커집니다. 터치 화면은 누르는 동안 같은 모습 + 카드가 살짝 눌림.
 * (분야 색 그라데이션은 뺌 — themeGlow 는 홈 프로젝트에서만 씀)
 */
export function ProjectCard({
  project,
  ndaLabel,
  showYear = true,
  tile = false,
  onClick,
}: {
  project: ProjectCardData;
  ndaLabel: string;
  /** 연도 표시 (연도별로 묶은 화면에서는 끔) */
  showYear?: boolean;
  /** 2단 격자용 흰 카드 */
  tile?: boolean;
  onClick?: () => void;
}) {
  const Root = onClick ? "button" : "div";
  const showDescription = !project.nda && project.description;

  /** ⋯ (더보기 모달로 자세히) — 분야 번호 칩은 뺌 */
  const chips = (
    <span className={classNames("flex items-center gap-2.5")}>
      <span
        aria-hidden
        className={classNames(
          "size-7 shrink-0",
          "flex items-center justify-center gap-[3px]",
          "rounded-full bg-white transition duration-300 group-hover:scale-110 group-hover:bg-black group-hover:text-white group-active:scale-110 group-active:bg-black group-active:text-white",
        )}
      >
        <span className={classNames("size-[3px]", "rounded-full bg-current")} />
        <span className={classNames("size-[3px]", "rounded-full bg-current")} />
        <span className={classNames("size-[3px]", "rounded-full bg-current")} />
      </span>
    </span>
  );

  return (
    <Root
      {...(onClick
        ? {
            type: "button" as const,
            "aria-haspopup": "dialog" as const,
            "cursor-label": "View",
            onClick,
          }
        : {})}
      className={classNames(
        "group w-full text-left",
        // isolate: 호버 그라데이션(-z-10)이 카드 바탕 위 · 글 아래에 깔리게
        // 사이트 바탕(--color-background)이 #fbfbfb 라서 카드는 순백(#fff)으로 따로 둠 (bg-white 도 #fbfbfb 로 덮여 있음)
        "relative isolate rounded-2xl bg-[#fff]",
        tile
          ? "flex flex-col justify-between gap-8 md:min-h-60"
          : "flex flex-col gap-4 md:min-h-45",
        tile ? "px-8 py-7 md:px-9 md:py-8" : "px-6 py-6 md:px-8 md:py-7",
        project.nda && "opacity-50",
        onClick &&
          "cursor-pointer transition-[scale] duration-300 active:scale-[0.98]",
      )}
    >
      {tile ? (
        <>
          <span className={classNames("flex min-w-0 flex-col gap-1.5")}>
            <span
              className={classNames(
                "text-xl leading-normal font-medium break-keep",
              )}
            >
              {project.title}
              {project.nda ? <NdaBadge label={ndaLabel} /> : null}
            </span>
            {showDescription ? (
              <span
                className={classNames(
                  "line-clamp-3 text-sm leading-normal text-sub",
                )}
              >
                {project.description}
              </span>
            ) : null}
          </span>
          <span
            className={classNames("flex items-center justify-between gap-4")}
          >
            <span className={classNames("text-sm font-medium text-sub")}>
              {project.client}
            </span>
            {chips}
          </span>
        </>
      ) : (
        <>
          <span
            className={classNames("flex items-start justify-between gap-6")}
          >
            <span className={classNames("flex min-w-0 flex-col gap-1")}>
              {showYear ? (
                <span
                  className={classNames(
                    "font-neuehaas text-[15px] leading-4 font-medium text-sub",
                  )}
                >
                  {project.year}
                </span>
              ) : null}
              <span
                className={classNames(
                  "flex flex-wrap items-baseline gap-x-6 gap-y-0.5",
                )}
              >
                <span
                  className={classNames(
                    "text-lg leading-normal font-medium break-keep",
                  )}
                >
                  {project.title}
                  {project.nda ? <NdaBadge label={ndaLabel} /> : null}
                </span>
                {project.client ? (
                  <span className={classNames("text-sm font-medium text-sub")}>
                    {project.client}
                  </span>
                ) : null}
              </span>
            </span>
            {chips}
          </span>
          {showDescription ? (
            <span
              className={classNames(
                "mt-3 max-w-3xl",
                "line-clamp-3 text-sm leading-6 text-sub",
              )}
            >
              {project.description}
            </span>
          ) : null}
        </>
      )}
    </Root>
  );
}
