"use client";

import classNames from "classnames";
import { useEffect, useId, useState } from "react";
import { HeaderNavLink } from "./HeaderNavLink";

export type MenuLink = { label: string; href: string };

/**
 * 모바일 메뉴 (768px 미만): 햄버거 버튼 → 헤더 아래 화면 전체 메뉴.
 * 큰 글자 메뉴 · 아래쪽 연락처. 메뉴를 누르거나 Esc 를 누르면 닫힙니다.
 */
export function MobileMenu({
  links,
  contact,
  labels,
}: {
  links: MenuLink[];
  contact: { email: string; phone: { label: string; tel: string } };
  labels: { open: string; close: string };
}) {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  // 열려 있는 동안: 뒤 화면 스크롤 막기 · Esc 로 닫기
  // 열린 채로 화면이 넓어지면(태블릿 돌림 등) 메뉴는 숨지만 스크롤 막힘이 남으므로 닫음
  useEffect(() => {
    if (!open) return;
    const overflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const wide = window.matchMedia("(min-width: 768px)");
    const onWide = () => {
      if (wide.matches) setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    wide.addEventListener("change", onWide);
    return () => {
      document.documentElement.style.overflow = overflow;
      window.removeEventListener("keydown", onKeyDown);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  return (
    <div className={classNames("md:hidden")}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? labels.close : labels.open}
        onClick={() => setOpen(!open)}
        className={classNames(
          "size-10",
          "relative -mr-2 flex items-center justify-center",
        )}
      >
        {/* 두 줄 → X */}
        <span
          aria-hidden
          className={classNames(
            "h-[1.5px] w-5",
            "absolute",
            // 헤더 뒤가 진한 색이면 흰 줄 (HeaderTone 의 data-tone — 메뉴가 열리면 떼어짐)
            "bg-black transition duration-300 group-data-[tone=dark]/header:bg-white",
            open ? "rotate-45" : "-translate-y-[4px]",
          )}
        />
        <span
          aria-hidden
          className={classNames(
            "h-[1.5px] w-5",
            "absolute",
            "bg-black transition duration-300 group-data-[tone=dark]/header:bg-white",
            open ? "-rotate-45" : "translate-y-[4px]",
          )}
        />
      </button>

      <div
        id={menuId}
        inert={!open}
        className={classNames(
          "fixed inset-x-0 top-18 bottom-0 z-30",
          "flex flex-col justify-between",
          "px-5 pt-8 pb-[calc(env(safe-area-inset-bottom)+2rem)]",
          [
            "bg-background transition duration-300",
            open
              ? "visible translate-y-0 opacity-100"
              : "invisible -translate-y-2 opacity-0",
          ],
        )}
      >
        <nav>
          <ul className={classNames("flex flex-col gap-1")}>
            {links.map((link) => (
              <li key={link.href}>
                {/* 헤더 가운데 메뉴와 같은 그라디언트 호버 · 현재 위치 표시 (HeaderNavLink) */}
                <HeaderNavLink
                  href={link.href}
                  variant="menu"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </HeaderNavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div
          className={classNames(
            "flex flex-col gap-1",
            "font-neuehaas text-base text-sub",
          )}
        >
          {/* 누르기 쉽게 위아래로 넓힌 영역 (보이는 간격은 그대로) */}
          <a
            href={`mailto:${contact.email}`}
            className={classNames("-my-1.5 w-fit py-1.5 active:text-main")}
          >
            {contact.email}
          </a>
          <a
            href={`tel:${contact.phone.tel}`}
            className={classNames("-my-1.5 w-fit py-1.5 active:text-main")}
          >
            {contact.phone.label}
          </a>
        </div>
      </div>
    </div>
  );
}
