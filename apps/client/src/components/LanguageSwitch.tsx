"use client";

import classNames from "classnames";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { localeInfo, switchLocalePath, type Locale } from "@/i18n";

/** 현재 페이지를 다른 언어로 엽니다. (/people ↔ /en/people) */
export function LanguageSwitch({
  locale,
  label,
}: {
  locale: Locale;
  label: string;
}) {
  const pathname = usePathname();
  const target: Locale = locale === "ko" ? "en" : "ko";

  return (
    <Link
      href={switchLocalePath(pathname, target)}
      hrefLang={target}
      lang={target}
      aria-label={label}
      className={classNames(
        // 글자가 작아서 누르는 영역만 넓힘 (보이는 자리는 그대로)
        "-m-2.5 p-2.5",
        "transition duration-300 active:opacity-60",
        // 헤더 뒤가 진한 색이면 흰 글자 (HeaderTone 의 data-tone)
        "text-sm font-medium text-main group-data-[tone=dark]/header:text-white",
      )}
    >
      {localeInfo[target].label}
    </Link>
  );
}
