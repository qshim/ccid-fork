"use client";

import classNames from "classnames";
import { motion, useReducedMotion } from "motion/react";

/**
 * 첫 화면 로고 모션 값.
 * startS: 화면이 뜬 뒤 시작까지 · staggerS: 글자 사이 간격 · durationS: 한 글자가 자리 잡는 시간 (모두 초)
 * 옆 타이핑은 HomeHero 의 TYPING.startMs 로 이 모션이 거의 끝날 때 시작하게 맞춥니다. (값을 바꾸면 거기도 같이)
 */
export const LOGO_MOTION = {
  startS: 0.2,
  staggerS: 0.08,
  durationS: 1.2,
};

/**
 * 홈 첫 화면의 큰 "cciD": 글자마다 차례로 아래에서 떠오르며 흐림 → 선명.
 * 화면 읽기 프로그램에는 한 단어로 읽힙니다. 움직임 줄이기 설정이면 바로 보입니다.
 */
export function HeroLogo({
  text,
  className,
  letterClassName,
  shadowClassName,
}: {
  text: string;
  className?: string;
  /**
   * 글자 하나하나에 거는 클래스 (예: 그라디언트 글자 bg-clip-text).
   * 글자마다 따로 움직이는 상자라 부모에 건 bg-clip-text 는 잘 안 잡히므로 여기에 겁니다.
   */
  letterClassName?: string;
  /**
   * 글자마다 뒤에 깔 그림자 글자 클래스 (예: 사선으로 비껴 앉은 흐린 그라디언트 글자). 주면 같은 글자를 하나 더 뒤에 그립니다.
   */
  shadowClassName?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <h1 className={className}>
      <span className={classNames("sr-only")}>{text}</span>
      <span aria-hidden>
        {[...text].map((letter, index) => (
          <motion.span
            // 글자는 바뀌지 않으므로 순서를 키로 씀
            key={index}
            className={classNames(
              "inline-block",
              shadowClassName && "relative isolate",
              letterClassName,
            )}
            // initial 은 서버 · 브라우저가 같아야 해서(hydration) 그대로 두고, 움직임 줄이기면 바로 보이게
            initial={{ opacity: 0, y: "35%", filter: "blur(16px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={
              reduce
                ? { duration: 0 }
                : {
                    duration: LOGO_MOTION.durationS,
                    delay: LOGO_MOTION.startS + index * LOGO_MOTION.staggerS,
                    ease: [0.16, 1, 0.3, 1],
                  }
            }
          >
            {letter}
            {shadowClassName ? (
              <span
                aria-hidden
                className={classNames(
                  "absolute inset-0 -z-10",
                  "pointer-events-none select-none",
                  shadowClassName,
                )}
              >
                {letter}
              </span>
            ) : null}
          </motion.span>
        ))}
      </span>
    </h1>
  );
}
