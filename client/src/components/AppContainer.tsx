import { ReactNode } from "react";

type AppContainerProps = {
  size: "md" | "lg";
  children: ReactNode;
};

export const AppContainer = ({ size, children }: AppContainerProps) => {
  if (size === "md") return <div className="max-w-screen-md h-full mx-auto px-2 py-6">{children}</div>;
  if (size === "lg") return <div className="max-w-screen-lg h-full mx-auto px-2 py-6">{children}</div>;
  return <div>{children}</div>;
};
