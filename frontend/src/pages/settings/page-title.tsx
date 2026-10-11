
import { useEffect } from "react";
import { usePageTitle } from "@/pages/settings/page-title-context";

type PageTitleProps = {
  title: string;
};

export default function PageTitle({ title }: PageTitleProps) {
  const { setPageTitle } = usePageTitle();

  useEffect(() => {
    setPageTitle(title);
  }, [title, setPageTitle]);

  return null;
}