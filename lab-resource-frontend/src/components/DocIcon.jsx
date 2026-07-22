export function DocIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" {...props}>
      <path
        d="M6 2.5h5l3.5 3.5V16a1 1 0 01-1 1H6a1 1 0 01-1-1V3.5a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M11 2.5V6h3.5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M7 10h6M7 12.5h6M7 7.5h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
