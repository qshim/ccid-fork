import classNames from "classnames";
import Link from "next/link";
import { Reveal } from "@/components/content";
import { ROUTES } from "@/constants";
import { localePath, localized, type Locale } from "@/i18n";
import type { ProjectWithThemes } from "@/libs/content";
import { ProjectsSpotlight } from "./ProjectsSpotlight";

/** 프로젝트를 여는 링크 (Projects 페이지 + 모달) */
export const projectHref = (locale: Locale, project: ProjectWithThemes) =>
  `${localePath(locale, ROUTES.projects)}#${project.slug || project.id}`;

/**
 * 홈 Projects: 큰 글자 목록. 누르면 Projects 페이지로 가서 그 프로젝트 모달이 열립니다.
 * 넓은 화면에서는 내용 8칸에 맞춥니다: 연도 1 · 제목(+ 아래 회사명) 6 · 화살표 1.
 * 모션: 화면에 들어올 때 위에서부터 차례로 떠오르고, 한 줄에 마우스를 올리면 그 줄에 푸터색(#24202e)을 밝게 한 단색이 서서히 나타납니다. (다른 줄은 그대로)
 * 터치 화면(마우스 없음): 스크롤하다 화면 가운데에 온 줄에 같은 색이 켜지고(ProjectsSpotlight), 누르면 살짝 눌립니다.
 */
export function HomeProjects({
  projects,
  locale,
}: {
  projects: ProjectWithThemes[];
  locale: Locale;
}) {
  return (
    <ProjectsSpotlight className={classNames("-mx-4 flex flex-col md:-mx-5")}>
      {projects.map((project, index) => {
        return (
          <li key={project.id}>
            <Reveal delay={index * 60}>
              <Link
                href={projectHref(locale, project)}
                cursor-label="View"
                data-spotlight-row
                className={classNames(
                  "group grid gap-x-8 gap-y-1 md:grid-cols-[56px_minmax(0,1fr)_64px] md:items-baseline",
                  "lg:grid-cols-8 lg:gap-x-10",
                  "px-4 py-4 md:px-5",
                  // isolate: 호버 그라데이션(-z-10)이 글 아래에 깔리게
                  "relative isolate overflow-hidden rounded-2xl",
                  "transition-[scale] duration-300 active:scale-[0.98]",
                )}
              >
                {/* 호버 · 스포트라이트: 분야마다 다른 색 대신, 푸터색(#24202e)을 흰색에 10% 섞은 밝은 단색 하나 */}
                <span
                  aria-hidden
                  className={classNames(
                    "pointer-events-none absolute inset-0 -z-10 rounded-[inherit]",
                    "bg-[color-mix(in_srgb,#24202e_10%,white)]",
                    "opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-data-spotlight:opacity-100",
                  )}
                />
                <span
                  className={classNames(
                    "font-neuehaas text-sm font-medium text-sub",
                  )}
                >
                  {project.year_start}
                </span>
                {/* 제목 + 바로 아래 회사명 (한 덩어리로 읽히도록) */}
                <span
                  className={classNames("flex flex-col gap-1 lg:col-span-6")}
                >
                  <span
                    className={classNames(
                      "text-lg leading-snug break-keep md:text-xl",
                    )}
                  >
                    {localized(project, "title", locale)}
                  </span>
                  <span className={classNames("truncate text-sm text-sub")}>
                    {localized(project, "client", locale)}
                  </span>
                </span>
                {/* 좁은 화면은 줄 전체가 눌리는 걸로 충분해 화살표를 숨김 */}
                <span
                  aria-hidden
                  className={classNames(
                    "hidden md:block",
                    "transition group-hover:translate-x-1",
                    "text-right font-neuehaas text-sub group-hover:text-main",
                  )}
                >
                  →
                </span>
              </Link>
            </Reveal>
          </li>
        );
      })}
    </ProjectsSpotlight>
  );
}
