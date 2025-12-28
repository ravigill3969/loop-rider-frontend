import { useEffect } from "react";

export default function CloseTab() {
  useEffect(() => {
    // optional: notify parent window
    if (window.opener) {
      window.opener.postMessage("CLOSE_STRIPE_TAB", "*");
    }

    // close this tab
    window.close();
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: 40 }}>
      <p>Closing…</p>
    </div>
  );
}
