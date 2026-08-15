export function Skeleton({
  w,
  h = 14,
  radius = 6,
  style,
}: {
  w?: number | string;
  h?: number;
  radius?: number;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className="skeleton"
      style={{ width: w ?? "100%", height: h, borderRadius: radius, ...style }}
    />
  );
}

/** A project-row skeleton used while the work queue "loads". */
export function ProjectRowSkeleton() {
  return (
    <div className="project-row project-row--skeleton" aria-hidden>
      <div className="stack" style={{ gap: 10, flex: 1 }}>
        <Skeleton w={180} h={16} />
        <Skeleton w={120} h={12} />
      </div>
      <Skeleton w={90} h={24} radius={999} />
      <Skeleton w={90} h={24} radius={999} />
      <Skeleton w={140} h={30} radius={8} />
    </div>
  );
}
