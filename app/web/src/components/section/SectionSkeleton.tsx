import { Card, CardContent } from "@fitness-recoder/ui";

interface SectionSkeletonProps {
  title: string;
  useCard?: boolean
  children: {
    default: React.ReactNode;
    subtitle?: React.ReactNode
  };
}

export default function SectionSkeleton({
  title,
  useCard = true,
  children,
}: SectionSkeletonProps) {
  const { default: defaultContent, subtitle } = children;
  return (
    <section>
      <div className="flex justify-between items-end mb-3">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {subtitle}
      </div>
      {useCard ? <Card>
        <CardContent className="p-4 h-full">
          {defaultContent}
        </CardContent>
      </Card> : <div className="p-4 h-full">
        {defaultContent}
      </div>}
    </section>
  );
}