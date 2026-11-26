"use client";

import classNames from "classnames";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { stripLocale } from "@/i18n";

/**
 * 헤더 메뉴 링크 (가운데 메뉴 · 모바일 메뉴 공용).
 * 마우스를 올리면(터치 화면은 누르는 동안) 글자가 연보라(#8e84c4) + 예전 보라 그라데이션 30% 로 서서히 바뀝니다. (아래에서 차오르는 모션 없이 색만)
 * 지금 보고 있는 곳의 메뉴는 연보라로 고정됩니다. (aria-current)
 * - 페이지 링크(/research 등): 그 페이지 · 하위 페이지에 있을 때
 * - 구역 링크(/#about): 그 페이지에서 해당 구역이 화면 가운데를 지나는 동안
 * variant: bar = 헤더 가운데 메뉴(검정 · 작은 글자) / menu = 모바일 전체 화면 메뉴(연회색 · 큰 글자)
 * 움직임 줄이기 설정이면 색이 바로 바뀝니다.
 */
export function HeaderNavLink({
  href,
  variant = "bar",
  onClick,
  children,
}: {
  href: string;
  variant?: "bar" | "menu";
  onClick?: () => void;
  children: ReactNode;
}) {
  const pathname = usePathname();

  // "/en#about" → 경로 "/en" · 구역 "about". 언어 부분(/en · 내부 /ko)은 떼고 비교합니다.
  const [path = "", hash = ""] = href.split("#");
  const current = stripLocale(pathname);
  const target = stripLocale(path || "/");
  const onPage = current === target;

  const sectionInView = useSectionInView(hash && onPage ? hash : null);
  const isCurrent = hash
    ? sectionInView
    : onPage || current.startsWith(`${target}/`);

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={isCurrent ? (hash ? "location" : "page") : undefined}
      className={classNames(
        variant === "menu" ? "block" : "whitespace-nowrap",
        variant === "menu" && "py-1",
        [
          variant === "menu"
            ? "[--header-ink:var(--color-gray-300)]"
            : // 평소 검정, 헤더 뒤가 진한 색이면(HeaderTone 의 data-tone) 흰색
              //   (--header-ink 는 global.css 에서 색으로 등록해 두어 바뀔 때 서서히 넘어감)
              "[--header-ink:var(--color-black)] group-data-[tone=dark]/header:[--header-ink:var(--color-white)]",
          // 호버 · 지금 메뉴: 연보라(#8e84c4)에 예전 그라데이션(#2000D4 → #CB63FF)을 30% 섞은 글자로 서서히 바뀜 (아래에서 차오르지 않음)
          //   글자 뒤에 그라데이션을 늘 깔아 두고(bg-clip-text), 글자색이 투명해지면서 드러나게 함
          "bg-[linear-gradient(180deg,color-mix(in_srgb,#8e84c4_70%,#2000d4),color-mix(in_srgb,#8e84c4_70%,#cb63ff))] bg-clip-text",
          isCurrent
            ? "text-transparent"
            : "text-(--header-ink) hover:text-transparent active:text-transparent",
          "transition-[color,--header-ink] duration-300 ease-out motion-reduce:transition-none",
        ],
        [
          "font-neuehaas",
          variant === "menu"
            ? "text-5xl leading-tight"
            : "text-base font-medium",
        ],
      )}
    >
      {children}
    </Link>
  );
}

/** id 구역이 화면 가운데 가로선에 걸쳐 있는지. id 가 없으면(다른 페이지) 늘 false */
function useSectionInView(id: string | null) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = id ? document.getElementById(id) : null;
    if (!element) return;
    // 위 · 아래를 50% 씩 잘라 화면 가운데 한 줄만 남김 → 구역이 그 줄을 지나는 동안 true
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? false),
      { rootMargin: "-50% 0px -50% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [id]);

  // 다른 페이지로 가면 지난 값이 남아 있어도 쓰지 않음 (돌아오면 observe 직후 바로 다시 계산됨)
  return id ? inView : false;
}
