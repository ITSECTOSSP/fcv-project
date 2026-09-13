// This hook sets the page title based on the provided page name and the application name from the configuration. If no page name is provided, it defaults to just the application name.
import { useEffect } from "react";

import appConfig from "@/config/app";

export function usePageTitle(pageName?: string) {
  useEffect(() => {
    document.title = pageName
      ? `${appConfig.name} - ${pageName}`
      : appConfig.name;
  }, [pageName]);
}