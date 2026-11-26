import classNames from "classnames";
import Link from "next/link";
import { APP_INFO } from "@/config";
import { NAV_EXTRA_ITEM, NAV_ITEMS, ROUTES } from "@/constants";
import { localePath } from "@/i18n";
import { getDictionary, getLocale } from "@/i18n/server";
import Logo from "@/public/img/logo.svg";
import { HeaderNavLink } from "./HeaderNavLink";
import { HeaderTone } from "./HeaderTone";
import { LanguageSwitch } from "./LanguageSwitch";
import { MobileMenu } from "./MobileMenu";

/**
 * 공개 사이트 헤더: 로고 · 가운데 메뉴(+ 구분선 뒤 Lab) · 언어 전환
 * 768px 미만에서는 가운데 메뉴 대신 햄버거 버튼(MobileMenu)이 화면 전체 메뉴를 엽니다.
 */
export async function Header() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  return (
    <header
      className={classNames(
        "group/header",
        "w-full h-18",
        "fixed top-0 z-40 grid grid-cols-[1fr_auto] items-center gap-4 md:grid-cols-[1fr_auto_1fr]",
        "px-5 md:px-10",
      )}
    >
      {/*
        반투명 흐린 배경은 헤더 뒤에 깔린 별도 층에 둡니다.
        헤더 자체에 backdrop-blur 를 걸면 안쪽 position: fixed 요소(모바일 메뉴 패널 등)가
        화면이 아니라 헤더 기준으로 잡혀서 패널이 헤더 높이로 줄어듭니다.
      */}
      {/*
        흰색 → 아래로 갈수록 투명: 헤더보다 40px 아래까지 내려와 자연스럽게 사라집니다.
        (헤더 밖으로 나온 부분이 아래 내용 클릭을 막지 않도록 pointer-events-none)
      */}
      {/* 진한 배경 위(data-tone=dark, HeaderTone)에서는 흰 흐림을 끄고 배경이 그대로 보이게 */}
      <div
        aria-hidden
        className={classNames(
          "pointer-events-none absolute inset-x-0 top-0 -bottom-10 -z-10",
          "bg-linear-to-b from-background/95 via-background/50 to-transparent",
          "transition-opacity duration-300 group-data-[tone=dark]/header:opacity-0",
        )}
      />
      {/*
        흐림: 진한 배경(홈 About 보라 등) 위에서는 흰 그라데이션만으로는 스크롤된 글이 메뉴 글자와 겹쳐 보여서,
        헤더 뒤를 흐리게 하고 아래로 갈수록 흐림이 사라지게(mask) 합니다. (헤더 자체에 걸지 않는 이유는 위 설명)
      */}
      <div
        aria-hidden
        className={classNames(
          "pointer-events-none absolute inset-x-0 top-0 -bottom-6 -z-10",
          "[mask-image:linear-gradient(to_bottom,black_55%,transparent)] backdrop-blur-md",
        )}
      />
      {/* 헤더 뒤가 진한 색인지 살펴 data-tone 을 붙임 (홈 첫 화면 보라 배경) */}
      <HeaderTone />
      {/*
        모바일 메뉴가 열려 있으면 헤더도 메뉴 패널과 같은 바탕색으로 꽉 채움 (뒤 그라디언트가 비치지 않게)
        열림 여부는 햄버거 버튼(MobileMenu)의 aria-expanded 로 알아냄 · 패널과 같은 0.3초로 나타남
      */}
      <div
        aria-hidden
        className={classNames(
          "pointer-events-none absolute inset-0 -z-10",
          "bg-background",
          "opacity-0 transition-opacity duration-300 group-has-[[aria-expanded=true]]/header:opacity-100",
        )}
      />
      <Link
        href={localePath(locale, ROUTES.home)}
        aria-label={APP_INFO.name}
        className={classNames(
          "justify-self-start",
          "transition-colors duration-300 group-data-[tone=dark]/header:text-white",
        )}
      >
        <Logo aria-hidden className={classNames("h-[26px] w-auto")} />
      </Link>

      <nav className={classNames("hidden md:block", "min-w-0")}>
        <div className={classNames("flex items-center gap-6")}>
          <ul className={classNames("flex items-center gap-9")}>
            {NAV_ITEMS.map((item) => (
              <li key={item.key}>
                <HeaderNavLink href={localePath(locale, item.href)}>
                  {dict.nav[item.key]}
                </HeaderNavLink>
              </li>
            ))}
          </ul>
          {NAV_EXTRA_ITEM.isVisible && (
            <>
              <span
                aria-hidden
                className={classNames("h-5 w-px", "bg-[#CDDEFF] opacity-50")}
              />
              <HeaderNavLink href={localePath(locale, NAV_EXTRA_ITEM.href)}>
                {dict.nav[NAV_EXTRA_ITEM.key]}
              </HeaderNavLink>
            </>
          )}
        </div>
      </nav>

      <div className={classNames("flex items-center justify-self-end gap-5")}>
        <LanguageSwitch locale={locale} label={dict.language.switchLabel} />
        <MobileMenu
          links={[...NAV_ITEMS, NAV_EXTRA_ITEM]
            .filter((item) => item.isVisible !== false)
            .map((item) => ({
              label: dict.nav[item.key],
              href: localePath(locale, item.href),
            }))}
          contact={{ email: APP_INFO.email, phone: APP_INFO.phone }}
          labels={{ open: dict.common.openMenu, close: dict.common.closeMenu }}
        />
        {/* 에이전트 구(AgentBlob)는 공통 레이아웃(Layout.tsx)에서 화면에 띄웁니다. */}
      </div>
    </header>
  );
}
