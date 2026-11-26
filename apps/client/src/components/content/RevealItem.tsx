"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * 화면에 들어오면 아래에서 살짝 떠오르며 스르륵 나타나는 목록 항목 (<li>).
 * 그리드에서 줄 단위가 아니라 제각각 뜨도록, 순서(index)마다 0–0.6초 사이로 흩어진 지연을 줍니다.
 * (황금비 수열이라 매번 같지만 이웃끼리 겹치지 않고 고르게 섞임)
 */
export function RevealItem({
  index,
  className,
  children,
}: {
  /** 목록 안 순서 (지연을 섞는 데 씀) */
  index: number;
  className?: string;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  const delay = ((index * 0.618034) % 1) * 0.6;

  return (
    <motion.li
      className={className}
      // initial 은 서버 · 브라우저가 같아야 해서(hydration) 그대로 두고, 움직임 줄이기면 바로 보이게
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={
        reduce
          ? { duration: 0 }
          : { duration: 1.5, delay, ease: [0.22, 1, 0.36, 1] }
      }
    >
      {children}
    </motion.li>
  );
}
