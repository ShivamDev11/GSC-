import { useEffect, useState } from "react";
import { Preloader } from "./Preloader";

const KEY = "gsc_preloaded_v3";

export function PreloaderMount() {
  const [show, setShow] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    try {
      if (!sessionStorage.getItem(KEY)) {
        setShow(true);
        sessionStorage.setItem(KEY, "1");
      }
    } catch {
      setShow(true);
    }
  }, []);

  if (!ready || !show) return null;
  return <Preloader onDone={() => setShow(false)} />;
}
