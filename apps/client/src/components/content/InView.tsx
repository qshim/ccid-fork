"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const TAGS = {
  div: motion.div,
  li: motion.li,
  span: motion.span,
} as const;

/**
 * 화면에 들어오면 한 번, 아래에서 부드럽게 떠오르며 페이드 인 (motion/react).
 * delay(초)로 순서를 줄 수 있습니다. 움직임 줄이기 설정이면 바로 보입니다.
 * 다 나타난 뒤에는 transform 을 남기지 않습니다.
 */
export function InView({
  as = "div",
  delay = 0,
  y = 24,
  className,
  children,
}: {
  /** 감쌀 태그 */
  as?: keyof typeof TAGS;
  /** 나타나기 전 기다리는 시간 (초) */
  delay?: number;
  /** 얼마나 아래에서 떠오를지 (px) */
  y?: number;
  className?: string;
  children?: ReactNode;
}) {
  const reduce = useReducedMotion();
  const Tag = TAGS[as];
  return (
    <Tag
      className={className}
      // initial 은 서버 · 브라우저가 같아야 해서(hydration) 그대로 두고, 움직임 줄이기면 바로 보이게
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={
        reduce
          ? { duration: 0 }
          : { duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }
      }
    >
      {children}
    </Tag>
  );
}
