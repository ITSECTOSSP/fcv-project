import { createContext, useContext, useState } from "react";
import type { ReactNode, Dispatch, SetStateAction } from "react";

type PageTitleContextType = {
  pageTitle: string;
  setPageTitle: Dispatch<SetStateAction<string>>;
};

type PageTitleProviderProps = {
  children: ReactNode;
};

const PageTitleContext = createContext<PageTitleContextType | null>(null);

export function PageTitleProvider({ children }: PageTitleProviderProps) {
  const [pageTitle, setPageTitle] = useState<string>("Dashboard");

  return (
    <PageTitleContext.Provider value={{ pageTitle, setPageTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
}

export function usePageTitle(): PageTitleContextType {
  const context = useContext(PageTitleContext);

  if (context === null) {
    throw new Error("usePageTitle must be used within PageTitleProvider");
  }

  return context;
}
