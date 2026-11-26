"use client";

import classNames from "classnames";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

/** 누를 수 있는 요소 (이 위에서는 원이 커집니다) */
const CLICKABLE =
  'a, button, [role="button"], summary, label, select, [cursor-label]';
/** 원 크기 (px) — 평소 · 누를 수 있는 요소 위 */
const SIZE = { base: 14, hover: 30 };
/** 따라오는 빠르기 (0–1, 클수록 마우스에 바로 붙음) */
const FOLLOW = 0.45;
/**
 * 스크롤할 때 원이 스크롤 방향으로 길어져 알약(pill)이 되는 정도. 두께는 원 지름 그대로, 위아래(좌우) 대칭.
 * pull: 스크롤 속도(px/프레임) 1 당 늘어나는 길이 · max: 최대로 늘어나는 길이 (px)
 * ease: 모양이 따라가는 빠르기 (0–1, 클수록 빠릿함 · 출렁임 없음)
 */
const PILL = { pull: 1.4, max: 18, ease: 0.25 };

/**
 * 커스텀 커서 (마우스가 있는 화면에서만).
 * - 원 하나가 마우스를 부드럽게 따라옵니다. 바탕과 반전(mix-blend-difference)되어 글이 읽힙니다.
 * - 누를 수 있는 요소(a · button · role="button" …) 위에서는 원이 커집니다.
 * - cursor-label="설명" 이 있는 요소 위에서는 원 아래에 설명이 작게 뜹니다.
 * - 스크롤하면 원이 알약(pill) 모양으로 길어집니다 (빠를수록 길게, 가운데 기준 대칭).
 *   세로 스크롤은 세로로, 좌우 스크롤(트랙패드 · 스와이퍼 등)은 가로로. 멈추면 다시 원으로 돌아옵니다.
 *   스크롤 중에는 스크롤 표현만 보여 주고(원은 기본 크기 · 설명 숨김),
 *   멈추면 그 자리의 요소를 다시 확인해 커짐 · 설명을 되살립니다.
 * 움직임 줄이기 설정이면 따라오는 지연 · 알약 모양 없이 바로 움직입니다.
 * 모달(<dialog>) · 팝오버가 열려 있는 동안에는 커서를 최상위 층(popover)에 올려 그 위에서도 보이게 합니다.
 *   (Safari 는 최상위 층에서 mix-blend 가 아래 페이지와 섞이지 않아서, 그동안은 반전 대신 검은 원으로)
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hover, setHover] = useState(false);
  const [label, setLabel] = useState("");
  const [scrolling, setScrolling] = useState(false);
  /** 모달이 열려 있어 커서를 최상위 층에 올렸는지 */
  const [layered, setLayered] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  /** 원 · 알약 모양 (모서리가 둥근 사각형 하나) */
  const shapeRef = useRef<SVGRectElement>(null);
  /** 원의 기본 지름 (평소 · 누를 수 있는 요소 위) — 그리기 루프가 읽음 */
  const sizeRef = useRef<number>(SIZE.base);
  /** 그리기 루프를 깨우는 함수 (루프는 멈춰 있을 때 쉼) */
  const wakeRef = useRef<(() => void) | null>(null);

  /** 최상위 층으로 (이미 올라가 있으면 다시 올려 새로 열린 모달보다 위로) */
  const raise = () => {
    const cursor = cursorRef.current;
    if (!cursor?.hasAttribute("popover") || !cursor.showPopover) return;
    if (cursor.matches(":popover-open")) cursor.hidePopover();
    cursor.showPopover();
  };

  // popover 가 붙은 직후 (그리기 전에) 최상위 층에 띄웁니다.
  useLayoutEffect(() => {
    if (layered) raise();
  }, [layered]);

  // 마우스가 있는 화면인지 (터치 기기에서는 쓰지 않음)
  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setEnabled(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    // 모달(<dialog>)이 열리고 닫히는 것을 지켜보고, 열려 있는 동안만 커서를 최상위 층에 올립니다.
    // 팝오버(popover — 예: People 약력 창)도 최상위 층에 뜨므로 똑같이 지켜봅니다.
    const anyLayerOpen = () =>
      Boolean(document.querySelector("dialog[open]")) ||
      [...document.querySelectorAll(":popover-open")].some(
        (element) => element !== cursorRef.current,
      );
    const dialogs = new MutationObserver((records) => {
      const opened = records.some(
        (record) =>
          record.target instanceof HTMLDialogElement && record.target.open,
      );
      setLayered(anyLayerOpen());
      // 이미 올라가 있는데 모달이 또 열리면 그 위로 다시
      if (opened) raise();
    });
    dialogs.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ["open"],
    });
    // 팝오버는 open 속성이 없어서 toggle 이벤트로 (퍼지지 않는 이벤트라 capture 로 받음)
    const onToggle = (event: Event) => {
      if (event.target === cursorRef.current) return;
      setLayered(anyLayerOpen());
      if ((event as ToggleEvent).newState === "open") raise();
    };
    document.addEventListener("toggle", onToggle, true);
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const target = { x: -100, y: -100 };
    const pos = { x: -100, y: -100 };
    /** 지금 모양: 원 지름 · 가로로 / 세로로 더 늘어난 길이 */
    const shape = { size: SIZE.base as number, x: 0, y: 0 };
    /** 스크롤 빠르기 (px/프레임, 부드럽게) */
    const scrollVel = { x: 0, y: 0 };
    /** 이번 프레임에 들어온 휠 · 트랙패드 이동량 (좌우 스크롤은 페이지가 안 움직이는 곳 — 스와이퍼 등 — 도 잡으려고) */
    const wheel = { x: 0, y: 0, used: false };
    let frameScrollY = window.scrollY;
    let frame = 0;
    /** 움직임이 멈추면(쉬면) 루프를 끄고, 마우스 · 스크롤 · 크기 변화가 생기면 다시 깨움 — 가만히 있을 때 매 프레임 돌지 않게 */
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(loop);
    };
    wakeRef.current = wake;
    const loop = () => {
      frame = 0;
      const ease = reduce ? 1 : FOLLOW;
      pos.x += (target.x - pos.x) * ease;
      pos.y += (target.y - pos.y) * ease;
      if (cursorRef.current)
        cursorRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;

      // 스크롤 빠르기 (부드럽게): 세로는 휠 이동량 (없으면 페이지가 움직인 만큼 — 키보드 · 스크롤바), 가로는 휠 이동량
      const pageY = window.scrollY;
      const dy = wheel.used ? wheel.y : pageY - frameScrollY;
      scrollVel.x += (wheel.x - scrollVel.x) * 0.25;
      scrollVel.y += (dy - scrollVel.y) * 0.25;
      frameScrollY = pageY;
      wheel.x = 0;
      wheel.y = 0;
      wheel.used = false;

      // 알약: 더 많이 움직이는 방향으로만 길어짐 (빠를수록 길게, 최대 PILL.max)
      const vertical = Math.abs(scrollVel.y) >= Math.abs(scrollVel.x);
      const speed = Math.abs(vertical ? scrollVel.y : scrollVel.x);
      const extra = Math.min(PILL.max, speed * PILL.pull);
      const goalX = vertical ? 0 : extra;
      const goalY = vertical ? extra : 0;
      const follow = reduce ? 1 : PILL.ease;
      shape.size += (sizeRef.current - shape.size) * follow;
      shape.x += (goalX - shape.x) * follow;
      shape.y += (goalY - shape.y) * follow;

      const width = shape.size + shape.x;
      const height = shape.size + shape.y;
      const rect = shapeRef.current;
      rect?.setAttribute("x", (-width / 2).toFixed(2));
      rect?.setAttribute("y", (-height / 2).toFixed(2));
      rect?.setAttribute("width", width.toFixed(2));
      rect?.setAttribute("height", height.toFixed(2));
      // 짧은 쪽의 절반 = 원일 땐 원, 길어지면 양 끝이 반원인 알약
      rect?.setAttribute("rx", (Math.min(width, height) / 2).toFixed(2));
      // 다 멈췄으면 쉼 (위치 · 모양 · 스크롤 속도 모두 목표에 닿음)
      const resting =
        Math.abs(target.x - pos.x) < 0.05 &&
        Math.abs(target.y - pos.y) < 0.05 &&
        Math.abs(shape.size - sizeRef.current) < 0.05 &&
        Math.abs(shape.x - goalX) < 0.05 &&
        Math.abs(shape.y - goalY) < 0.05 &&
        Math.abs(scrollVel.x) + Math.abs(scrollVel.y) < 0.01;
      if (!resting) frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    const onMove = (event: PointerEvent) => {
      target.x = event.clientX;
      target.y = event.clientY;
      setVisible(true);
      wake();
    };
    /** 커서 아래 요소로 커짐 · 설명 정하기 */
    const inspect = (element: Element | null) => {
      setHover(Boolean(element?.closest(CLICKABLE)));
      setLabel(
        element?.closest("[cursor-label]")?.getAttribute("cursor-label") ?? "",
      );
    };
    const onOver = (event: PointerEvent) =>
      inspect(event.target instanceof Element ? event.target : null);
    const onLeave = () => setVisible(false);

    let lastY = window.scrollY;
    let timer = 0;
    const markScrolling = () => {
      setScrolling(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        setScrolling(false);
        // 스크롤로 커서 아래 요소가 바뀌었을 수 있어서 다시 확인
        inspect(document.elementFromPoint(target.x, target.y));
      }, 160);
    };
    const onScroll = () => {
      if (reduce) return;
      const y = window.scrollY;
      if (y !== lastY) markScrolling();
      lastY = y;
      wake();
    };
    // 휠 · 트랙패드 (스와이퍼처럼 이벤트를 막는 곳도 먼저 받으려고 capture)
    const onWheel = (event: WheelEvent) => {
      if (reduce) return;
      const unit =
        event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? window.innerHeight
            : 1;
      wheel.x += event.deltaX * unit;
      wheel.y += event.deltaY * unit;
      wheel.used = true;
      wake();
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) markScrolling();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true, capture: true });
    return () => {
      root.classList.remove("has-custom-cursor");
      dialogs.disconnect();
      document.removeEventListener("toggle", onToggle, true);
      cancelAnimationFrame(frame);
      wakeRef.current = null;
      window.clearTimeout(timer);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel, { capture: true });
    };
  }, [enabled]);

  // 스크롤 중에는 스크롤 표현만 (커짐 · 설명은 멈춘 뒤에)
  const size = hover && !scrolling ? SIZE.hover : SIZE.base;
  useEffect(() => {
    sizeRef.current = size;
    // 커짐 · 작아짐을 다시 그리려면 루프를 깨워야 함
    wakeRef.current?.();
  }, [size]);

  if (!enabled) return null;
  const showLabel = Boolean(label) && !scrolling;

  return (
    <div
      ref={cursorRef}
      aria-hidden
      // 모달이 열려 있을 때만 최상위 층용 popover (브라우저 기본 popover 모양은 아래 클래스로 지움)
      popover={layered ? "manual" : undefined}
      className={classNames(
        "size-0",
        // 맨 위층: 다른 떠 있는 패널(예: 튜닝 페이지의 Leva 패널 z 1000 · 색 선택기 z 10000)보다 위에 있어야
        // 그 위에서도 커서가 보입니다. (기본 커서는 숨겨져 있으므로)
        "pointer-events-none fixed inset-auto top-0 left-0 z-[100000] overflow-visible",
        "m-0 border-0 bg-transparent p-0",
        // 평소: 바탕과 반전 · 모달 위: 검은 원 (Safari 최상위 층에서는 반전이 안 됨)
        { "mix-blend-difference": !layered },
        "transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0",
      )}
    >
      {/* 원 (스크롤하면 알약) — 크기는 그리기 루프가 정함 */}
      {/* 크기가 0 인 svg 는 그려지지 않으므로, 커서 중심(0,0)을 가운데 둔 120px 캔버스 */}
      <svg
        viewBox="-60 -60 120 120"
        className={classNames(
          "absolute top-0 left-0 size-[120px] -translate-1/2 overflow-visible",
          layered ? "text-black" : "text-white",
        )}
      >
        <rect
          ref={shapeRef}
          x={-SIZE.base / 2}
          y={-SIZE.base / 2}
          width={SIZE.base}
          height={SIZE.base}
          rx={SIZE.base / 2}
          fill="currentColor"
        />
      </svg>
      {/* 설명 (cursor-label) */}
      <span
        style={{ transform: `translate(-50%, ${size / 2 + 10}px)` }}
        className={classNames(
          "absolute top-0 left-0",
          "transition-[opacity,transform] duration-200",
          [
            "font-neuehaas text-[11px] font-medium whitespace-nowrap",
            layered ? "text-main" : "text-white",
          ],
          showLabel ? "opacity-100" : "opacity-0",
        )}
      >
        {label}
      </span>
    </div>
  );
}
