"use client";

import classNames from "classnames";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import {
  type MouseEvent,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { flushSync } from "react-dom";
import { HOVER_QUERY, useMediaQuery } from "@/hooks";
import type { Locale } from "@/i18n";
import { BlobCanvas } from "./engine/BlobCanvas";
import {
  DEFAULT_BLOB_CONFIG,
  type BlobConfig,
  type BlobState,
  type DeepPartial,
} from "./engine/config";
import type { Morph } from "./engine/renderer";
import { useMicLevel } from "./engine/useMicLevel";
import { TalkChat } from "./talk/chat";
import { useOverDark } from "./useOverDark";
import { noteOpened, notePage, watchHuman } from "./talk/human";
import { type TalkLabels, TalkPanel } from "./TalkPanel";

export type AgentBlobLabels = TalkLabels & {
  open: string;
  /** 구에 마우스를 올리면 커서 아래에 뜨는 안내 */
  hover: string;
  /** 터치 화면: 처음 한 번 구 옆에 말풍선으로 뜨는 안내 */
  tap: string;
  title: string;
  close: string;
  talk: string;
};

type CommonProps = {
  /** 구 지름 (px). 기본 40 (헤더 버튼 크기) */
  size?: number;
  /**
   * design 모드: 실제 음성 인식 반응 켜기 (기본 false = 마이크를 쓰지 않음).
   * 켜면 listening 일 때 마이크 크기에 맞춰 반응합니다. 끄면 가짜 음성 곡선으로 보여 줍니다.
   * (agent 모드는 대화 창의 마이크 버튼으로 켜고, 실제 소리를 따라갑니다)
   */
  voice?: boolean;
  /** 설정 일부 덮어쓰기 (없으면 presets/*.json) */
  config?: DeepPartial<BlobConfig>;
  /**
   * 바깥 상자 클래스. 위치를 정해 띄울 수 있습니다. (예: "fixed right-8 bottom-8 z-20")
   * 주지 않으면 그 자리(문서 흐름)에 놓입니다.
   */
  className?: string;
};

export type AgentBlobProps = CommonProps &
  (
    | {
        /** design (기본): 올림 · 누름 반응만 있는 장식 */
        mode?: "design";
        /** 보여 줄 상태 (기본 idle) */
        state?: BlobState;
        labels?: never;
      }
    | {
        /** agent: 올림 · 누름 + 누르면 대화 창(모달)으로 커짐 */
        mode: "agent";
        state?: never;
        /** 버튼 · 대화 창 문구 (dict.agent) */
        labels: AgentBlobLabels;
        /** 대화 언어 (지금 페이지 언어) */
        lang: Locale;
      }
  );

/**
 * 에이전트 구(blob).
 * - mode="design" (기본): 마우스 올림 · 누름에만 반응합니다. 누르는 동작은 없습니다.
 * - mode="agent": 올림 · 누름 + 누르면 그 자리에서 화면 가운데 대화 창으로 커집니다.
 * 상황별 모션 값은 presets/*.json — /agent-tune 페이지(app/[lang]/agent-tune)에서 조절해 내보냅니다.
 *
 * 헤더처럼 어디에 넣어도 됩니다. 단, transform · filter · backdrop-filter 가 걸린 부모 안에 두면
 * 대화 창(position: fixed)이 화면이 아닌 그 부모 기준으로 잡히니 피해 주세요.
 */
export function AgentBlob(props: AgentBlobProps) {
  if (props.mode === "agent") return <AgentModeBlob {...props} />;
  return <DesignModeBlob {...props} />;
}

function DesignModeBlob({
  size = 40,
  voice = false,
  config,
  className,
  state = "idle",
}: CommonProps & { state?: BlobState }) {
  const listening = voice && state === "listening";
  const micLevel = useMicLevel(listening);

  return (
    <div
      aria-hidden
      className={classNames("shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <BlobCanvas
        state={state}
        level={listening ? micLevel : undefined}
        config={config}
      />
    </div>
  );
}

type Box = { top: number; left: number; width: number; height: number };

/** 터치 안내 말풍선: 한 번 보여 줬으면 이 탭(세션)에서는 다시 띄우지 않음 */
const TAP_HINT_KEY = "ccid:agent-tap-hint";
/** 터치 안내 말풍선: 페이지가 뜨고 나서 나타나기까지 · 떠 있는 시간 (밀리초) */
const TAP_HINT_MS = { delay: 3500, visible: 5000 };

/**
 * 터치 화면(마우스 없음)에서 처음 한 번만 true 가 되는 값.
 * 커서 안내("클릭하여 물어보세요")를 볼 수 없으니 구가 누를 수 있는 것임을 알려 줍니다.
 */
function useTapHint() {
  // 서버 · 첫 화면은 마우스가 있다고 보고(= 말풍선 없음) 시작
  const canHover = useMediaQuery(HOVER_QUERY, true);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (canHover) return;
    try {
      if (sessionStorage.getItem(TAP_HINT_KEY)) return;
    } catch {
      return; // 저장소를 못 쓰는 브라우저면 띄우지 않음
    }
    const showTimer = window.setTimeout(() => {
      setShow(true);
      try {
        sessionStorage.setItem(TAP_HINT_KEY, "1");
      } catch {
        // 저장하지 못해도 이번에 한 번 보여 준 것으로 충분
      }
    }, TAP_HINT_MS.delay);
    const hideTimer = window.setTimeout(
      () => setShow(false),
      TAP_HINT_MS.delay + TAP_HINT_MS.visible,
    );
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [canHover]);
  return [show, () => setShow(false)] as const;
}

const boxOf = (el: Element): Box => {
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
};

/**
 * 닫혀 있을 때는 제자리(헤더 등)에 그대로 있고, 열면 같은 요소를 화면 전체(position: fixed)로 띄워
 * 구가 직접 창 모양으로 바뀝니다(모핑 — engine/renderer.ts). 닫으면 다시 구로 돌아가 제자리에 내려앉습니다.
 * 같은 요소 · 같은 캔버스라 다시 마운트되지 않습니다. 모핑 값은 presets/base.json 의 morph (/agent-tune).
 */
function AgentModeBlob({
  size = 40,
  config,
  className,
  labels,
  lang,
}: CommonProps & { labels: AgentBlobLabels; lang: Locale }) {
  // 열고 닫는 시간 (presets/base.json 의 morph.duration · 튜닝 페이지 값이 있으면 그 값)
  const morphSeconds =
    config?.morph?.duration ?? DEFAULT_BLOB_CONFIG.morph.duration;
  const [open, setOpen] = useState(false);
  /** 제자리를 떠나 떠 있는 동안 (열림 + 닫히는 중) */
  const [floating, setFloating] = useState(false);
  // 대화 흐름 (talk/chat.ts). 페이지를 옮겨도 공통 레이아웃에 있어 대화가 이어집니다.
  const [talk] = useState(() => new TalkChat(lang));
  const view = useSyncExternalStore(
    talk.subscribe,
    talk.getSnapshot,
    talk.getSnapshot,
  );
  // 구의 모습: 열려 있을 때 대화 상태를 따라갑니다. (방문자가 말하는 중 hearing 도 듣기 모습)
  const state: BlobState = !open
    ? "idle"
    : view.phase === "hearing"
      ? "listening"
      : view.phase;
  const pathname = usePathname();
  const slotRef = useRef<HTMLDivElement>(null);
  // 홈 첫 화면 · 리서치 상세 이미지 · 푸터 위에서는 보라를 빼고 밝게 빛나는 구로 (피드백 #88 · #101 · #102)
  const overDark = useOverDark(slotRef);
  // 푸터 위에서만: 구 뒤로 흐리게 번지는 빛(haze, 튜닝 페이지 "빛번짐")을 지금의 10% 로 (피드백 #117 · #118)
  const blobConfig: DeepPartial<BlobConfig> | undefined =
    overDark === "footer"
      ? {
          ...config,
          situations: Object.fromEntries(
            Object.entries(DEFAULT_BLOB_CONFIG.situations).map(
              ([name, preset]) => [name, { haze: preset.haze * 0.1 }],
            ),
          ),
        }
      : config;
  /** 열린 대화 창 자리 (보이지 않는 요소 — 크기는 아래 JSX 의 Tailwind 클래스) */
  const targetRef = useRef<HTMLDivElement>(null);
  /** 모핑: 닫힌 구 자리 · 열린 창 자리 (화면 기준). 떠 있는 동안만 있습니다. */
  const [morph, setMorph] = useState<Morph | null>(null);
  const openRef = useRef(false);
  const orbButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  /** 한 번이라도 열렸었는지 (처음 그릴 때 오브 버튼으로 포커스를 옮기지 않도록) */
  const openedRef = useRef(false);
  const [tapHint, hideTapHint] = useTapHint();

  // 사람 확인용 입력 요약은 사이트를 둘러보는 동안 조용히 모읍니다 (talk/human.ts)
  useEffect(() => watchHuman(), []);
  useEffect(() => notePage(pathname), [pathname]);
  useEffect(() => talk.setLang(lang), [talk, lang]);
  useEffect(() => () => talk.destroy(), [talk]);

  const rects = () => {
    const slot = slotRef.current;
    const target = targetRef.current;
    if (!slot || !target) return null;
    const toRect = (b: Box) => ({
      x: b.left,
      y: b.top,
      width: b.width,
      height: b.height,
    });
    return { closed: toRect(boxOf(slot)), panel: toRect(boxOf(target)) };
  };

  const openAgent = (event: MouseEvent) => {
    hideTapHint();
    noteOpened(event.isTrusted);
    talk.greet();
    const r = rects();
    if (!r) return;
    openRef.current = true;
    // 화면 전체 무대로 바꾸는 것과 모핑 시작을 한 번에 (구가 제자리에서 그대로 이어지도록)
    flushSync(() => {
      setFloating(true);
      setMorph({ open: true, ...r });
    });
    setOpen(true);
  };

  const closeAgent = () => {
    openRef.current = false;
    talk.close();
    setOpen(false);
    const r = rects();
    setMorph((m) => (m && r ? { open: false, ...r } : m));
  };

  /** 모핑이 멈췄을 때: 닫힌 구로 돌아왔으면 제자리로 내려앉습니다. */
  const onMorphSettle = (settledOpen: boolean) => {
    if (settledOpen || openRef.current) return;
    setFloating(false);
    setMorph(null);
  };

  // 열려 있는 동안: 뒤 화면 스크롤 막기 · 화면 크기가 바뀌면 창 자리 다시 맞추기
  useEffect(() => {
    if (!open) return;
    const overflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onResize = () => {
      const r = rects();
      if (r) setMorph({ open: true, ...r });
    };
    window.addEventListener("resize", onResize);
    return () => {
      document.documentElement.style.overflow = overflow;
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  // 열리면 대화 창(닫기 버튼)으로, 닫히면 오브 버튼으로 포커스를 옮깁니다.
  useEffect(() => {
    if (open) {
      openedRef.current = true;
      closeButtonRef.current?.focus();
    }
  }, [open]);

  // 닫히면 구가 제자리로 돌아와 버튼이 다시 나타난 뒤 거기로 포커스를 옮깁니다.
  useEffect(() => {
    if (!floating && openedRef.current) orbButtonRef.current?.focus();
  }, [floating]);

  // Esc 로 닫기 · Tab 포커스를 대화 창 안에 가두기
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeButtonRef.current?.click();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
      );
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    // 제자리: 떠 있는 동안에도 크기를 지켜 헤더 배치가 흔들리지 않습니다.
    <div
      ref={slotRef}
      className={classNames(
        "shrink-0",
        className,
        // 대화 창이 떠 있는 동안: 이 자리에 z-index 가 걸려 있으면(예: z-20) 모달 · 뒤 배경이 그 층에 갇혀
        // 헤더(z-40)가 위로 올라오므로, 그동안만 헤더보다 위층으로
        floating && "z-60!",
      )}
      style={{ width: size, height: size }}
    >
      {/* 뒤 배경: 흐리게 덮고, 누르면 닫힘 */}
      {/*
        열린 대화 창의 자리 · 크기. 보이지 않고, 열 때 이 상자를 재서 그 자리로 커집니다.
        위치 · 크기는 이 Tailwind 클래스로 정합니다 — 지금은 오른쪽 사이드바(top-20 right-5 bottom-5, 폭 28rem).
      */}
      <div
        ref={targetRef}
        aria-hidden
        className={classNames(
          // 오른쪽 사이드바: 헤더(h-18) 아래부터 아래 여백까지 세로로 길게, 폭은 28rem (좁은 화면은 좌우 여백만 남기고 꽉 차게)
          "top-20 right-5 bottom-5 w-[min(28rem,calc(100vw-2.5rem))]",
          "pointer-events-none invisible fixed",
        )}
      />
      <AnimatePresence>
        {open && (
          <motion.div
            key="agent-blob-backdrop"
            aria-hidden
            onClick={closeAgent}
            className={classNames(
              "fixed inset-0 z-40",
              "bg-white/50 backdrop-blur-sm",
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // 모핑과 같은 시간 · 같은 곡선(ease-in-out): 사각형이 줄어드는 동안 따로 남지 않게
            transition={{
              duration: morphSeconds,
              ease: [0.45, 0, 0.55, 1],
            }}
          />
        )}
      </AnimatePresence>

      {/* 터치 화면 안내 말풍선: 구 왼쪽에서 스르륵 나타났다 사라짐 · 눌러도 대화 창이 열림 (화면 읽기는 구 버튼 이름으로 충분) */}
      <AnimatePresence>
        {tapHint && !floating ? (
          <motion.button
            key="agent-blob-tap-hint"
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={openAgent}
            className={classNames(
              "absolute top-1/2 right-full -translate-y-1/2",
              "mr-3 px-3.5 py-2",
              "rounded-full bg-white/80 shadow-[0_4px_20px_rgb(80_40_160/0.15)] backdrop-blur",
              "font-neuehaas text-sm font-medium whitespace-nowrap text-primary",
            )}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {labels.tap}
          </motion.button>
        ) : null}
      </AnimatePresence>

      {/* 떠 있는 동안은 화면 전체가 무대 (클릭은 대화 창 내용과 뒤 배경만 받음) */}
      <div
        className={classNames(
          floating
            ? "pointer-events-none fixed inset-0 z-50"
            : "relative size-full",
          "transition-[filter] duration-700 ease-out motion-reduce:transition-none",
        )}
        style={{
          filter: floating
            ? undefined
            : overDark === "glow"
              ? // 홈 첫 화면: 보라를 빼고 더 밝게 + 둘레로 넓게 번지는 흰 역광(drop-shadow 두 겹)
                "saturate(0.2) brightness(1.65) drop-shadow(0 0 10px rgb(255 255 255 / 0.85)) drop-shadow(0 0 28px rgb(255 255 255 / 0.55))"
              : overDark === "dark" || overDark === "footer"
                ? // 어두운 배경(리서치 상세 이미지 · 푸터): 보라만 빼고 살짝 밝게 — 더 밝히면 구 둘레의 옅은 번짐(haze)까지 커져 넓게 퍼져 보임
                  "saturate(0.2) brightness(1.2)"
                : undefined,
        }}
      >
        <BlobCanvas
          state={state}
          // 마이크가 켜져 있으면 실제 소리(방문자 목소리 · 에이전트 목소리)를 따라갑니다. 아니면 가짜 곡선.
          level={view.voice ? talk.readLevel : undefined}
          expanded={open}
          morph={morph}
          onMorphSettle={onMorphSettle}
          interactive={!open}
          config={blobConfig}
        >
          {!floating ? (
            <button
              ref={orbButtonRef}
              type="button"
              aria-label={labels.open}
              cursor-label={labels.hover}
              aria-haspopup="dialog"
              aria-expanded={open}
              onClick={openAgent}
              className={classNames(
                "absolute inset-0 rounded-full",
                "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple",
              )}
            />
          ) : (
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label={labels.title}
              className={classNames(
                "absolute",
                "flex flex-col gap-3 p-4",
                open ? "pointer-events-auto" : "pointer-events-none",
              )}
              style={
                morph
                  ? {
                      left: morph.panel.x,
                      top: morph.panel.y,
                      width: morph.panel.width,
                      height: morph.panel.height,
                    }
                  : undefined
              }
              // 열 때: 창이 거의 다 퍼질 즈음 내용이 나타남 · 닫을 때: 창이 줄어들기 전에 먼저 사라짐 (열기의 거울)
              // 닫히는 동안에도 창은 그대로 두고(floating) 내용만 페이드 — 안 그러면 닫는 첫 프레임에 뚝 사라짐
              initial={{ opacity: 0, y: 8 }}
              animate={
                open
                  ? {
                      opacity: 1,
                      y: 0,
                      transition: {
                        delay: morphSeconds * 0.62,
                        duration: 0.3,
                      },
                    }
                  : { opacity: 0, y: 8, transition: { duration: 0.18 } }
              }
            >
              {/* 위: 닫기만 오른쪽에 (제목은 화면에 쓰지 않고 창 이름으로만 — aria-label) */}
              <header
                className={classNames(
                  "flex items-center justify-end",
                  "text-primary",
                )}
              >
                <button
                  ref={closeButtonRef}
                  type="button"
                  aria-label={labels.close}
                  onClick={closeAgent}
                  className={classNames(
                    "size-8",
                    "flex items-center justify-center",
                    "rounded-full bg-white/60 transition hover:bg-white/80",
                  )}
                >
                  <span aria-hidden>✕</span>
                </button>
              </header>
              <TalkPanel
                view={view}
                labels={labels}
                lang={lang}
                onAsk={(text) => talk.ask(text)}
                onChoose={(index) => talk.choose(index)}
                onConfirm={() => talk.confirm()}
                onMicStart={() => talk.startVoice()}
                onMicStop={() => talk.stopVoice()}
                onNavigate={closeAgent}
              />
            </motion.div>
          )}
        </BlobCanvas>
      </div>
    </div>
  );
}
