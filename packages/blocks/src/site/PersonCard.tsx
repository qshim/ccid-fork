import classNames from "classnames";
import { SiteImage } from "./shared";

/** 약력에서 알약으로 바꿀 줄: "prev." 한 단어, 또는 "prev. 회사 · 직함" ([1] 알약 글자 · [2] 뒤 글) */
const PREV_LINE = /^(prev\.?)(?:\s+(.+))?$/i;

/** People 카드에 들어가는 값 (이미 고른 언어) */
export type PersonCardData = {
  name: string;
  role: string;
  bio: string;
  profile: string;
  image: string | null;
  /** 이미지가 없을 때 회색 상자에 적을 글자 */
  imageFallback?: string;
  /** wide(디렉터) 넓은 화면 사진: 정사각 사진을 넓은 카드 안에 양옆 여백을 두고 놓음 (배경 #ccc — 사진은 배경을 지운 투명 PNG). 없으면 빈 카드 */
  wideImage?: string | null;
  /** 이름 오른쪽 LinkedIn 아이콘 링크 (없으면 아이콘 없음) */
  linkedin?: string | null;
};

/**
 * People 페이지의 구성원 카드: 사진(흑백) · 이름 · 직함 · 짧은 약력 · 약력 전체 보기.
 * - 기본: 좁은 화면(sm 미만)은 왼쪽에 작은 사진, 오른쪽에 글 / sm 이상은 사진 위 · 글 아래
 *   작은 사진은 모든 구역이 같은 크기 — 직함이 있으면 이름 위부터 약력 3번째 줄 아래까지에 딱 맞음
 * - wide (디렉터): 한 줄 전체를 씀 — 좁은 화면은 16:9 사진 위 · 글 아래, sm 이상은 사진 · 글 2단(사진 높이 = 글 높이, lg 이상은 6칸 중 사진 2 · 글 4). 직함은 입력한 줄바꿈대로
 * 약력 전체는 카드 폭에 갇히지 않도록 팝오버 창으로 엽니다 (브라우저 기본 popover — 스크립트 없이 동작).
 *   넓은 화면: 가운데 넓은 창 · 좁은 화면: 아래에서 올라오는 화면 폭 전체 창. 바깥 · Esc · 닫기로 닫힘.
 */
export function PersonCard({
  person,
  profileLabel,
  closeLabel = "Close",
  wide = false,
}: {
  person: PersonCardData;
  profileLabel: string;
  /** 약력 창 닫기 버튼 이름 */
  closeLabel?: string;
  /** 좁은 화면에서도 사진 위 · 글 아래 (디렉터) */
  wide?: boolean;
}) {
  const profileId = `profile-${encodeURIComponent(person.name)}`;
  const bioBlocks = person.bio
    .split(/\r?\n[ \t]*\r?\n/)
    .map((block) => block.trim())
    .filter(Boolean);
  return (
    <div
      className={classNames(
        wide
          ? // 디렉터: 좁은 화면은 사진 위 · 글 아래 / sm 이상은 사진 · 글 2단 (가운데 간격이 아래 4칸 격자 선과 맞음)
            //   lg 이상은 6칸으로 나눠 사진 2칸 · 글 4칸 (아래 6칸 격자 선과 맞음)
            "flex flex-col gap-1.5 sm:grid sm:grid-cols-2 sm:gap-x-4 lg:grid-cols-6"
          : [
              // 좁은 화면 사진: 모든 구역 같은 크기 81 × 108px (3:4)
              //   높이 108 = 이름 20 + 간격 2 + 직함 20 + 간격 6 + 약력 3줄 60 (직함이 없는 학생은 글보다 조금 김)
              "grid grid-cols-[81px_minmax(0,1fr)] items-start gap-x-4 sm:flex sm:flex-col sm:items-stretch sm:gap-1.5",
            ],
      )}
    >
      {wide ? (
        person.wideImage ? (
          // 디렉터 가로 카드 (모든 화면): 좁은 화면은 화면 폭 16:9, sm 이상은 비율 대신 오른쪽 글 단 높이에 맞춤 (칸을 채우고 줄 높이는 글이 정함)
          // 정사각 사진을 카드 높이의 88% 로 아래에 붙이고, 사진 가운데가 카드 가운데에 오게 놓음. 사진은 배경 없는 투명 PNG 라 카드 바탕(아래 인물 사진들과 같은 회색 #ccc)이 그대로 보임
          <div
            className={classNames(
              "aspect-video sm:aspect-auto lg:col-span-2",
              "relative",
            )}
          >
            <div
              className={classNames(
                "absolute inset-0",
                "overflow-hidden",
                "rounded-2xl bg-[#ccc]",
              )}
            >
              <img
                src={person.wideImage}
                alt={person.name}
                decoding="async"
                className={classNames(
                  "aspect-square h-[88%]",
                  "absolute bottom-0 left-1/2 -translate-x-1/2",
                  "object-cover grayscale",
                )}
              />
            </div>
          </div>
        ) : (
          <>
            {/* 가로 사진이 없을 때 좁은 화면: 높이 288px 기준의 3:4 사진 (폭 216px · 크롭 그대로라 늘어나지 않음) */}
            <div className={classNames("w-54 sm:hidden")}>
              <SiteImage
                src={person.image}
                alt={person.name}
                ratio="profile"
                fallback={person.imageFallback}
                imageClassName={classNames("grayscale")}
              />
            </div>
            {/* 가로 사진이 없을 때 sm 이상: 빈 회색 자리 */}
            <div
              className={classNames(
                "lg:col-span-2",
                "hidden sm:relative sm:block",
              )}
            >
              <SiteImage
                src={null}
                alt=""
                ratio="banner"
                fallback=""
                // SiteImage 기본(relative · 16:9 비율)보다 확실히 이기도록 ! — 없으면 16:9 로 남아 글 단보다 짧아짐
                className={classNames("absolute! inset-0 aspect-auto!")}
              />
            </div>
          </>
        )
      ) : (
        <div>
          {/*
            넓은 화면: 사진을 아래 가운데 기준으로 살짝 줄여(85%) 배경 비중을 늘림
            - 상자는 4:5 로 낮추고, 3:4 사진 면(크롭 기준)은 아래에 붙여 남는 위쪽만 잘라냄 (사람 크기는 그대로)
            - 늘어난 위 · 옆 자리는 사진 배경과 같은 회색(#ccc)이라 이어져 보임 (좁은 화면은 그대로 3:4)
          */}
          <SiteImage
            src={person.image}
            alt={person.name}
            ratio="profile"
            fallback={person.imageFallback}
            imageClassName={classNames("grayscale")}
            className={classNames("sm:aspect-4/5 sm:bg-[#ccc]")}
            contentClassName={classNames(
              "sm:top-auto sm:aspect-3/4 sm:origin-bottom sm:scale-85",
            )}
          />
        </div>
      )}
      <div
        className={classNames(
          "min-w-0",
          "flex flex-col gap-1.5",
          wide ? "mt-2 sm:mt-0 lg:col-span-4" : "sm:mt-2",
        )}
      >
        {/* 좁은 화면: 이름 줄 높이 20px · 아래 간격 2px 로 줄여 직함 · 약력에 붙임 (sm 이상은 24px · 6px) */}
        {/* linkedin 이 있으면 이름 오른쪽에 아이콘 링크 (새 창) */}
        <p
          className={classNames(
            "flex items-center gap-2",
            "-mb-1 sm:mb-0",
            "leading-5 font-semibold sm:leading-6",
          )}
        >
          {person.name}
          {person.linkedin ? (
            <a
              href={person.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${person.name} LinkedIn`}
              className={classNames("transition", "text-sub hover:text-main")}
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className={classNames("size-4", "fill-current")}
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          ) : null}
        </p>
        {person.role ? (
          // 좁은 화면은 줄바꿈 없이 한 줄로 이어 씀 (sm 이상은 입력한 줄바꿈대로)
          // 디렉터는 늘 입력한 줄바꿈대로 — 직함은 한 줄로 입력하고, 다음 줄에 FRSA 등을 둠
          <p
            className={classNames(
              "text-sm leading-5",
              wide
                ? "whitespace-pre-line"
                : "whitespace-normal sm:whitespace-pre-line",
            )}
          >
            {person.role}
          </p>
        ) : null}
        {bioBlocks.length ? (
          // 약력은 빈 줄로 묶음을 나눠 위아래로 쌓음 (빈 줄 한 줄만큼 띄움)
          // "prev." 로 시작하는 줄은 그 말을 작은 알약으로 바꿔 보여 줌
          //   - 자문: "prev. 회사" → 알약 + 회사 (한 줄)
          //   - 디렉터: "prev." 한 단어 줄 → 알약만 두고 아래 줄들이 이전 경력
          <div className={classNames("flex flex-col gap-5")}>
            {bioBlocks.map((block) => (
              <div
                key={block}
                className={classNames(
                  "flex flex-col items-start",
                  "text-[13px] leading-5 text-sub",
                )}
              >
                {block.split(/\r?\n/).map((line, index) => {
                  const prev = line.trim().match(PREV_LINE);
                  if (!prev) return <p key={`${index}-${line}`}>{line}</p>;
                  return (
                    <p
                      key={`${index}-${line}`}
                      className={classNames(
                        "flex items-start gap-1.5",
                        // 알약 위 · 아래로 살짝 띄움 (혼자 있는 알약은 아래 2px 만)
                        prev[2] ? "my-0.5" : "mb-0.5",
                      )}
                    >
                      {/* 알약 높이 = 글 줄 높이(20px) 라 첫 줄과 나란함 */}
                      <span
                        className={classNames(
                          "h-5 shrink-0",
                          "inline-flex items-center",
                          "px-2",
                          "rounded-full bg-sheet",
                          "text-[11px] font-medium text-main",
                        )}
                      >
                        {prev[1]}
                      </span>
                      {prev[2] ? <span>{prev[2]}</span> : null}
                    </p>
                  );
                })}
              </div>
            ))}
          </div>
        ) : null}
        {/* 약력 전체 보기: 디렉터(wide)는 약력이 카드에 다 보여서 두지 않음 */}
        {person.profile && !wide ? (
          <>
            <button
              type="button"
              popoverTarget={profileId}
              className={classNames(
                "group self-start",
                "mt-1 inline-flex items-center gap-1",
                "text-sm underline-offset-4 hover:underline active:underline",
              )}
            >
              {profileLabel}
              <span
                aria-hidden
                className={classNames(
                  "transition-transform duration-300 group-hover:translate-x-0.5 group-active:translate-x-0.5",
                )}
              >
                →
              </span>
            </button>
            <div
              id={profileId}
              popover="auto"
              // 열려 있는 동안 뒤 페이지 스크롤을 막는 표시 (client 레이아웃의 <html> has-[…] 클래스)
              data-scroll-lock
              aria-label={person.name}
              className={classNames(
                // 좁은 화면: 아래에서 올라오는 화면 폭 전체 창
                "inset-x-0 top-auto bottom-0 m-0 w-full max-w-none",
                "max-h-[85dvh] overflow-y-auto overscroll-contain",
                // 넓은 화면: 가운데 넓은 창
                "md:inset-0 md:m-auto md:h-fit md:w-[min(42rem,calc(100%-5rem))]",
                "p-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] md:p-10",
                "rounded-t-3xl bg-background text-main shadow-2xl md:rounded-3xl",
                "backdrop:bg-black/30 backdrop:backdrop-blur-sm",
                // 열릴 때 아래에서 떠오르기
                "transition-[opacity,translate] duration-300 ease-out",
                "starting:open:translate-y-8 starting:open:opacity-0",
              )}
            >
              <div className={classNames("flex items-start gap-4")}>
                <div className={classNames("w-16 shrink-0")}>
                  <SiteImage
                    src={person.image}
                    alt=""
                    ratio="profile"
                    fallback=""
                    imageClassName={classNames("grayscale")}
                  />
                </div>
                <div className={classNames("min-w-0 flex-1")}>
                  <p className={classNames("text-lg font-semibold")}>
                    {person.name}
                  </p>
                  {person.role ? (
                    <p
                      className={classNames(
                        "text-sm leading-6 whitespace-pre-line text-sub",
                      )}
                    >
                      {person.role}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  popoverTarget={profileId}
                  popoverTargetAction="hide"
                  className={classNames(
                    "h-9 shrink-0 px-4",
                    "rounded-full bg-sheet/60 transition hover:bg-sheet active:bg-sheet",
                    "font-neuehaas text-sm font-medium",
                  )}
                >
                  {closeLabel}
                </button>
              </div>
              <p
                className={classNames(
                  "mt-8",
                  "text-base leading-7 whitespace-pre-line break-keep",
                )}
              >
                {person.profile}
              </p>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
