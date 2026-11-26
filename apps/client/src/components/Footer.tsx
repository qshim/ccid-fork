import classNames from "classnames";
import Link from "next/link";
import { APP_INFO } from "@/config";
import { FOOTER_PEOPLE_GROUPS, ROUTES } from "@/constants";
import { localePath } from "@/i18n";
import { getDictionary, getLocale } from "@/i18n/server";
import { getThemes } from "@/libs/content";
import Logo from "@/public/img/logo.svg";

/**
 * 공개 사이트 푸터 (헤더에서 #contact 로 이동)
 * 왼쪽 위: 글자 크기 로고(cciD) → 정식 명칭 / 왼쪽 아래: 저작권 (오른쪽 영문 주소와 같은 줄 높이 · 아래끝이라 베이스라인이 맞음)
 * 오른쪽 위: People · Research 링크(+ 아래에 People 그룹 · Research 분야) / 오른쪽 아래: 주소
 * 좁은 화면은 한 줄로 쌓고 저작권이 맨 아래
 * 배경: 보라 기운이 도는 진회색 단색 (예전 셰이더 배경 FooterBackground · /footer-tune 은 지금 쓰지 않음)
 */
export async function Footer() {
  const locale = await getLocale();
  const [dict, themes] = await Promise.all([
    getDictionary(locale),
    getThemes(),
  ]);
  const groups = [
    {
      href: ROUTES.people,
      label: dict.footer.people,
      links: FOOTER_PEOPLE_GROUPS.map((group) => ({
        href: `${ROUTES.people}#${group}`,
        label: dict.footer.peopleLinks[group],
      })),
    },
    {
      href: ROUTES.research,
      label: dict.footer.research,
      links: themes.map((theme) => ({
        href: `/research/${theme.slug}`,
        label: theme.title_en || theme.title_ko,
      })),
    },
  ];

  return (
    <footer
      id="contact"
      className={classNames(
        // 최소 높이 없이 내용만큼: 링크 · 연락처와 주소 사이가 gap-12(48px) 로 정해짐
        "grid gap-12 md:grid-cols-[47fr_53fr] md:gap-x-0",
        "px-5 pt-14 pb-10 md:px-10 md:pt-10 md:pb-8",
        "bg-[#24202e]",
        "font-neuehaas text-white",
      )}
    >
      {/* 로고는 글자 크기(대문자 높이)에 맞춤: text-base ≈ 12px · md:text-lg ≈ 13px */}
      <div
        className={classNames(
          "md:col-start-1 md:row-start-1",
          "flex flex-col gap-2.5",
        )}
      >
        <Link
          href={localePath(locale, ROUTES.home)}
          aria-label={APP_INFO.name}
          className={classNames("self-start")}
        >
          <Logo aria-hidden className={classNames("h-3 w-auto md:h-[13px]")} />
        </Link>
        <p className={classNames("text-base md:text-lg")}>
          {APP_INFO.fullName}
        </p>
      </div>

      <div
        className={classNames(
          "md:col-start-2 md:row-span-2 md:row-start-1",
          "flex flex-col justify-between gap-12",
        )}
      >
        {/* 링크: People · Research 와 아래 묶음 */}
        <nav className={classNames("flex gap-12")}>
          {groups.map((group) => (
            <div key={group.href} className={classNames("flex flex-col gap-2")}>
              <Link
                href={localePath(locale, group.href)}
                className={classNames(
                  "self-start",
                  "transition",
                  "text-sm font-medium hover:text-white/60 active:text-white/60",
                )}
              >
                {group.label}
              </Link>
              <ul className={classNames("text-sm leading-6 text-white/55")}>
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={localePath(locale, link.href)}
                      className={classNames(
                        "transition",
                        "hover:text-white active:text-white",
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* 아래: 주소 */}
        <address
          className={classNames("flex flex-col gap-2", "text-xs not-italic")}
        >
          <p className={classNames("font-pretendard text-[13px]")}>
            {APP_INFO.address.ko}
          </p>
          <p className={classNames("leading-[18px] text-white/55")}>
            {APP_INFO.address.en}
          </p>
        </address>
      </div>

      {/* 저작권: 영문 주소와 같은 글자 크기 · 줄 높이(text-xs · 18px)로 칸 아래끝에 붙여 베이스라인을 맞춤 */}
      <p
        className={classNames(
          "md:col-start-1 md:row-start-2 md:self-end",
          "text-xs leading-[18px] text-white/55",
        )}
      >
        {new Date().getFullYear()} © {APP_INFO.name}. All rights reserved.
      </p>
    </footer>
  );
}
