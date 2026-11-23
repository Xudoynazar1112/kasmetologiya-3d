interface LotusMarkProps {
  className?: string;
}

export function LotusMark({ className = 'w-8 h-8' }: LotusMarkProps) {
  return (
    <svg
      viewBox="0 0 48 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M24 3C20.2 9.2 19.6 18.2 24 26.8C28.4 18.2 27.8 9.2 24 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 26.8C17.2 22.8 12.6 15.2 13.8 8.2C18.4 10.6 22.2 17.6 24 26.8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 26.8C30.8 22.8 35.4 15.2 34.2 8.2C29.6 10.6 25.8 17.6 24 26.8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 27.4C15.4 27.8 7.8 24.4 4.5 17.8C10.5 17.2 17.8 20.6 24 27.4Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 27.4C32.6 27.8 40.2 24.4 43.5 17.8C37.5 17.2 30.2 20.6 24 27.4Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 30.5C18 29.4 21 28.9 24 28.9C27 28.9 30 29.4 33 30.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}
