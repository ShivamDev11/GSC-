import { useEffect, useRef, useState } from "react";

export function Preloader({ onDone }: { onDone: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {
      // Autoplay blocked — skip preloader
      finish();
    });
    // Safety timeout in case video never ends
    const safety = window.setTimeout(finish, 8000);
    return () => window.clearTimeout(safety);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function finish() {
    if (fadeOut) return;
    setFadeOut(true);
    window.setTimeout(onDone, 600);
  }

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center transition-opacity duration-500 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <video
        ref={videoRef}
        src="/preloader.mp4"
        muted
        playsInline
        autoPlay
        onEnded={finish}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
