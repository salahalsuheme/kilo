import { useEffect } from "react";

const APP_TITLE = "لوحة تحكم كيلو";

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title === "لوحة التحكم" ? APP_TITLE : `${title} — ${APP_TITLE}`;
  }, [title]);
}
