export default function GoogleMapsIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <path
        d="M12 2C7.58 2 4 5.58 4 10c0 5.25 6.5 11 7.09 11.51a1.4 1.4 0 0 0 1.82 0C13.5 21 20 15.25 20 10c0-4.42-3.58-8-8-8Z"
        fill="#EA4335"
      />
      <path d="M12 2C9.5 2 7.29 3.19 5.88 5.03L12 10.5l6.12-5.47A7.96 7.96 0 0 0 12 2Z" fill="#FBBC04" />
      <path d="M4 10c0 1.6.46 3.08 1.25 4.35L12 10.5 5.88 5.03A7.96 7.96 0 0 0 4 10Z" fill="#4285F4" />
      <path
        d="M12 10.5 5.25 14.35C6.6 16.55 8.9 18.9 12 21.51c3.1-2.61 5.4-4.96 6.75-7.16L12 10.5Z"
        fill="#34A853"
      />
      <circle cx="12" cy="10" r="3.2" fill="white" />
    </svg>
  )
}
