"use client";

import classNames from "classnames";
import { useRef, useState } from "react";
import type { Swiper as SwiperInstance } from "swiper";
import { A11y, Keyboard, Mousewheel } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { MediaBox } from "./MediaBox";

const twoDigits = (n: number) => String(n).padStart(2, "0");

/** 페이지 좌우 여백 (px) — 바깥 px-5 md:px-10 과 같게. 첫 장 앞 · 마지막 장 뒤에만 이만큼 띄웁니다. */
const PAGE_GUTTER = { base: 20, md: 40 };

/**
 * 이미지 캐러셀 (Swiper): 같은 높이(4:3)의 사진들이 가로로 이어지고, 넘쳐도 다음 장이 오른쪽에 보입니다. (모든 장 선명하게)
 * - 화면 끝까지 넓게(full-bleed): 첫 장 앞 · 마지막 장 뒤에만 페이지 여백만큼 띄우고,
 *   넘기는 동안에는 사진이 페이지 여백이 아니라 브라우저 끝에서 잘립니다.
 *   (바깥이 px-5 md:px-10 인 곳에 둡니다)
 * - 넘기기: 드래그 · 스와이프 · 트랙패드 가로 스크롤 · ← → 키 · 아래 이전 · 다음 버튼
 * - 커서: 왼쪽 절반은 "Swipe to prev", 오른쪽 절반은 "Swipe to next" — 누르면 그쪽으로 넘어감
 * 높이는 화면 높이(vh)가 아니라 고정값 — 넓은 화면에서 첫 화면에 제목과 사진 영역이 함께 들어오는 정도로.
 */
export function ImageCarousel({
  images,
  alt,
  label,
  prevLabel,
  nextLabel,
}: {
  images: string[];
  alt: string;
  label: string;
  prevLabel: string;
  nextLabel: string;
}) {
  const swiperRef = useRef<SwiperInstance | null>(null);
  const [current, setCurrent] = useState(0);
  const [edge, setEdge] = useState({ start: true, end: false });

  const sync = (swiper: SwiperInstance) => {
    // 여러 장이 한 화면에 보여서 마지막 몇 장은 '지금 장'이 될 수 없음 → 끝에 닿으면 마지막 번호로
    setCurrent(swiper.isEnd ? images.length - 1 : swiper.activeIndex);
    setEdge({ start: swiper.isBeginning, end: swiper.isEnd });
  };

  const navButton = (by: -1 | 1) => (
    <button
      type="button"
      aria-label={by === -1 ? prevLabel : nextLabel}
      disabled={by === -1 ? edge.start : edge.end}
      onClick={() =>
        by === -1
          ? swiperRef.current?.slidePrev()
          : swiperRef.current?.slideNext()
      }
      className={classNames(
        "group size-9",
        "flex items-center justify-center",
        "rounded-full bg-sheet/60 transition-colors duration-300 hover:bg-black hover:text-white active:bg-black active:text-white",
        "disabled:pointer-events-none disabled:opacity-30",
        "font-neuehaas",
      )}
    >
      <span
        aria-hidden
        className={classNames(
          "transition-transform duration-300",
          by === -1
            ? "group-hover:-translate-x-0.5 group-active:-translate-x-0.5"
            : "group-hover:translate-x-0.5 group-active:translate-x-0.5",
        )}
      >
        {by === -1 ? "←" : "→"}
      </span>
    </button>
  );

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className={classNames("flex flex-col gap-4")}
    >
      <Swiper
        modules={[A11y, Keyboard, Mousewheel]}
        slidesPerView="auto"
        spaceBetween={12}
        speed={600}
        slidesOffsetBefore={PAGE_GUTTER.base}
        slidesOffsetAfter={PAGE_GUTTER.base}
        breakpoints={{
          768: {
            slidesOffsetBefore: PAGE_GUTTER.md,
            slidesOffsetAfter: PAGE_GUTTER.md,
          },
        }}
        // 커서 안내 영역(사진 묶음 바깥 층)에서 시작한 드래그 · 클릭도 받도록
        touchEventsTarget="container"
        keyboard={{ enabled: true, onlyInViewport: true }}
        // 트랙패드 가로 스크롤로 넘기기 (세로 휠은 페이지 스크롤에 양보)
        mousewheel={{ forceToAxis: true }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          sync(swiper);
        }}
        onSlideChange={sync}
        onReachBeginning={sync}
        onReachEnd={sync}
        onClick={(swiper, event) => {
          // 커서 안내 영역을 누르면 그쪽으로 (드래그가 아닌 클릭일 때만 옴)
          const zone = (event.target as HTMLElement | null)
            ?.closest("[data-swipe]")
            ?.getAttribute("data-swipe");
          if (zone === "prev") swiper.slidePrev();
          if (zone === "next") swiper.slideNext();
        }}
        // 페이지 여백을 넘어 화면 끝까지
        // (Swiper 기본 CSS 가 Tailwind 보다 우선이라 ! 로 덮음)
        className={classNames(
          "-mx-5! w-[calc(100%+2.5rem)]! md:-mx-10! md:w-[calc(100%+5rem)]!",
        )}
      >
        {images.map((image, index) => (
          <SwiperSlide
            key={image}
            aria-label={`${index + 1} / ${images.length}`}
            className={classNames(
              // 높이 고정 · 너비는 4:3 비율로 따라옴
              "aspect-thumbnail h-60! w-auto! md:h-80! lg:h-96! 2xl:h-104!",
            )}
          >
            <MediaBox src={image} alt={alt} />
          </SwiperSlide>
        ))}
        {/* 커서 안내 영역: 왼쪽 절반 = 이전 · 오른쪽 절반 = 다음 (갈 수 없는 쪽은 없앰) */}
        <div
          slot="container-end"
          aria-hidden
          className={classNames(
            "pointer-events-none absolute inset-0 z-10 flex",
          )}
        >
          <span
            data-swipe="prev"
            cursor-label={edge.start ? undefined : "Swipe to prev"}
            className={classNames(
              "h-full w-1/2",
              edge.start ? "pointer-events-none" : "pointer-events-auto",
            )}
          />
          <span
            data-swipe="next"
            cursor-label={edge.end ? undefined : "Swipe to next"}
            className={classNames(
              "h-full w-1/2",
              edge.end ? "pointer-events-none" : "pointer-events-auto",
            )}
          />
        </div>
      </Swiper>

      <div className={classNames("flex items-center gap-3")}>
        {navButton(-1)}
        <p
          aria-live="polite"
          className={classNames(
            "min-w-16 text-center",
            "font-neuehaas text-sm font-medium tabular-nums",
          )}
        >
          {twoDigits(current + 1)}
          <span className={classNames("text-mute")}>
            {" "}
            / {twoDigits(images.length)}
          </span>
        </p>
        {navButton(1)}
      </div>
    </div>
  );
}
