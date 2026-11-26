import classNames from "classnames";
import { NdaBadge, PlainLink, type SiteLink } from "./shared";

/** 프로젝트 모달 내용에 들어가는 값 (이미 고른 언어) */
export type ProjectDetailData = {
  year: string;
  title: string;
  client: string;
  description: string;
  tags: string[];
  nda: boolean;
  research: {
    title: string;
    summary: string;
    href: string;
    /** 분야 번호 (그라데이션 색). 1~4 밖이면 검정 */
    number?: number;
    /** 대표 이미지 주소 (없으면 회색 면) */
    image?: string | null;
    /** 이미지 위 큰 글 (영문 제목) */
    subtitle?: string;
    /** 이미지 위 작은 글 (세부 분야, 쉼표로 이은 것) */
    label?: string;
  }[];
};

/** 분야 번호 → 이미지 아래 그라데이션 색. 지금은 모든 분야가 진보라(#24202e, 이전 푸터 색) — 분야 색으로 되돌릴 땐 from-theme-NN/90 (클래스는 통째로 적어야 Tailwind 가 만들어 줍니다) */
const GRADIENT: Record<number, string> = {
  1: "from-[#24202e]/90",
  2: "from-[#24202e]/90",
  3: "from-[#24202e]/90",
  4: "from-[#24202e]/90",
};

export type ProjectDetailLabels = {
  nda: string;
  ndaNote: string;
  research: string;
  more: string;
  close: string;
};

/**
 * 프로젝트 모달 안쪽: 왼쪽 연도 · 회사 · 제목 · 설명 · 태그(맨 아래) / 오른쪽 이 프로젝트가 속한 리서치 이미지 카드.
 * 리서치 카드: 위에 제목(labels.research, 두 언어 모두 영문 "Related research") · 카드 오른쪽 아래 알약 버튼(labels.more, "리서치 자세히 보기 →")
 *   — 카드가 왜 있는지, 누르면 그 리서치로 간다는 것이 바로 읽히도록. 호버 · 누름: 이미지 확대 + 버튼이 흰색으로 채워지고 화살표가 밀림.
 * onClose 가 있으면 닫기 버튼을 그립니다. onNavigate 는 관련 리서치로 이동할 때 (모달 닫기용) 부릅니다.
 */
export function ProjectDetail({
  project,
  labels,
  titleId,
  onClose,
  onNavigate,
  Link = PlainLink,
}: {
  project: ProjectDetailData;
  labels: ProjectDetailLabels;
  titleId?: string;
  onClose?: () => void;
  /** 관련 리서치 링크를 눌러 다른 페이지로 갈 때 */
  onNavigate?: () => void;
  Link?: SiteLink;
}) {
  const closeButton = (className: string) =>
    onClose ? (
      <button
        type="button"
        onClick={onClose}
        className={classNames(
          "h-9",
          className,
          "px-4",
          "rounded-full bg-sheet/60 transition hover:bg-sheet active:bg-sheet",
          "font-neuehaas text-sm font-medium",
        )}
      >
        {labels.close}
      </button>
    ) : null;

  return (
    <div
      className={classNames(
        "grid gap-10 md:grid-cols-[minmax(0,449fr)_minmax(0,377fr)] md:gap-x-12 lg:gap-x-30",
        "p-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] md:p-10",
      )}
    >
      <div className={classNames("flex flex-col gap-6 md:justify-between")}>
        <div className={classNames("flex flex-col gap-6")}>
          <div className={classNames("flex flex-col gap-3")}>
            <div className={classNames("flex items-center justify-between")}>
              <p
                className={classNames(
                  "flex gap-x-9 text-lg leading-4 font-medium text-gray-500",
                )}
              >
                <span className={classNames("font-neuehaas")}>
                  {project.year}
                </span>
                {project.client ? <span>{project.client}</span> : null}
              </p>
              {closeButton("md:hidden")}
            </div>
            <h2
              id={titleId}
              className={classNames(
                "text-2xl leading-snug break-keep md:text-3xl md:leading-[1.4]",
              )}
            >
              {project.title}
              {project.nda ? <NdaBadge label={labels.nda} /> : null}
            </h2>
          </div>
          {project.nda ? (
            <p className={classNames("text-sm text-sub")}>{labels.ndaNote}</p>
          ) : project.description ? (
            <p
              className={classNames(
                "leading-normal whitespace-pre-line break-keep text-gray-800",
              )}
            >
              {project.description}
            </p>
          ) : null}
        </div>
        {/* 태그: 보라 → 파랑 → 보라 → 연분홍 그라데이션 테두리 알약 (메인 버튼과 같은 색) */}
        {!project.nda && project.tags.length ? (
          <ul className={classNames("flex flex-wrap gap-2")}>
            {project.tags.map((tag) => (
              <li
                key={tag}
                className={classNames(
                  "inline-flex px-3 py-1",
                  // 상자 하나 + 1px border: 안쪽은 바탕색, 테두리에만 그라데이션 (두께가 일정)
                  "rounded-full border border-transparent [background:linear-gradient(#fff,#fff)_padding-box,linear-gradient(to_right,#9e70ff_0%,#4fa7ff_35%,#9f72fd_68%,#f0a6ff_100%)_border-box]",
                  "text-xs",
                )}
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {/* 이 프로젝트가 속한 리서치: 제목 + 이미지 카드 (자기 비율) 가 세로로 쌓임 */}
      {project.research.length ? (
        <section
          aria-labelledby={titleId ? `${titleId}-research` : undefined}
          className={classNames("flex flex-col gap-3")}
        >
          <h3
            id={titleId ? `${titleId}-research` : undefined}
            className={classNames("font-neuehaas text-sm text-sub")}
          >
            {labels.research}
          </h3>
          <ul className={classNames("flex flex-col gap-4")}>
            {project.research.map((theme) => (
              <li key={theme.href}>
                <Link
                  href={theme.href}
                  onClick={onNavigate}
                  cursorLabel="Open"
                  className={classNames(
                    "group block",
                    "relative overflow-hidden",
                    "rounded-2xl bg-sheet",
                    "[&_img]:transition-transform [&_img]:duration-700 [&_img]:ease-[cubic-bezier(.22,1,.36,1)] group-hover:[&_img]:scale-105 group-active:[&_img]:scale-105",
                  )}
                >
                  {theme.image ? (
                    <img
                      src={theme.image.split("#")[0]}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className={classNames(
                        "block aspect-[377/201] w-full object-cover",
                      )}
                    />
                  ) : (
                    <span
                      className={classNames("block aspect-[377/201] w-full")}
                    />
                  )}
                  <span
                    className={classNames(
                      "absolute inset-x-0 bottom-0",
                      "flex items-end justify-between gap-3",
                      "px-5 pt-20 pb-4",
                      "bg-linear-to-t to-transparent",
                      GRADIENT[theme.number ?? 0] ?? "from-black/70",
                      "text-white",
                    )}
                  >
                    <span className={classNames("flex flex-col gap-0.5")}>
                      {theme.label ? (
                        <span
                          // 좁은 화면은 카드가 작아 버튼 옆에서 줄이 깨지므로 세부 분야는 숨김 (영문 제목만)
                          className={classNames(
                            "hidden sm:block",
                            "font-neuehaas text-xs font-light",
                          )}
                        >
                          {theme.label}
                        </span>
                      ) : null}
                      <span
                        className={classNames(
                          "font-neuehaas text-xl leading-tight font-light",
                        )}
                      >
                        {theme.subtitle || theme.title}
                      </span>
                    </span>
                    {/* 누를 수 있다는 표시: 유리 알약 버튼 (호버 · 누름에 흰색으로 채워짐) */}
                    <span
                      className={classNames(
                        "h-8 shrink-0",
                        "inline-flex items-center gap-1 px-3",
                        "rounded-full bg-white/15 backdrop-blur transition-colors duration-300 group-hover:bg-white group-hover:text-black group-active:bg-white group-active:text-black",
                        "text-xs font-medium whitespace-nowrap",
                      )}
                    >
                      {labels.more}
                      <span
                        aria-hidden
                        className={classNames(
                          "transition-transform duration-300 group-hover:translate-x-0.5 group-active:translate-x-0.5",
                        )}
                      >
                        →
                      </span>
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
