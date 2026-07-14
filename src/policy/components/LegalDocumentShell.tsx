import type { ReactNode } from "react";

type LegalDocumentShellProps = {
  title: string;
  lastUpdated: string;
  children: ReactNode;
};

const LegalDocumentShell = ({ title, lastUpdated, children }: LegalDocumentShellProps) => {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 md:py-14">
      <header className="mb-8 border-b border-border pb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last Updated: {lastUpdated}</p>
      </header>
      <article className="prose prose-sm max-w-none prose-headings:scroll-mt-20 prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline md:prose-base">
        {children}
      </article>
    </div>
  );
};

export default LegalDocumentShell;
