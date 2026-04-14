export default function TagBadge({ name, onClick }) {
  return (
    <span
      className="tag-badge"
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick(name);
      }}
    >
      #{name}
    </span>
  );
}
