interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={className ?? "-mt-1 text-start"}>
      <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-2 text-sm text-muted-foreground md:text-base">{description}</p>
      ) : null}
    </div>
  );
}
