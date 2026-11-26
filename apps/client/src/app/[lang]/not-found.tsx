import classNames from "classnames";
import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/constants";
import { localePath } from "@/i18n";
import { getDictionary, getLocale } from "@/i18n/server";

export const metadata: Metadata = {
  title: "404",
  robots: { index: false, follow: true },
};

export default async function NotFound() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  return (
    // 내용이 짧아 화면 가운데에 둠 (위에 붙으면 아래로 푸터가 바로 올라와 비어 보임)
    <div
      className={classNames(
        "min-h-[80svh]",
        "flex items-center",
        "px-5 pt-28 pb-24 sm:px-8",
      )}
    >
      <div className={classNames("w-full max-w-5xl", "mx-auto", "text-center")}>
        <p
          className={classNames(
            "font-neuehaas text-xs font-medium text-sub uppercase",
          )}
        >
          404
        </p>
        <h1 className={classNames("mt-3", "text-3xl font-semibold")}>
          {dict.notFound.title}
        </h1>
        <p className={classNames("mt-4", "text-sub")}>
          {dict.notFound.description}
        </p>
        <Link
          href={localePath(locale, ROUTES.home)}
          className={classNames(
            "h-10",
            "inline-flex shrink-0 items-center justify-center gap-2",
            "mt-8 px-4",
            "rounded-lg bg-black transition hover:opacity-85 active:opacity-85",
            "text-sm font-semibold whitespace-nowrap text-white",
          )}
        >
          {dict.notFound.home}
        </Link>
      </div>
    </div>
  );
}
