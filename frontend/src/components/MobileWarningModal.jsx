import { useState, useEffect } from "react";
import { MonitorIcon } from "lucide-react";

const MOBILE_BREAKPOINT = 768; // matches Tailwind's `md` breakpoint

const MobileWarningModal = () => {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    const dismissed = sessionStorage.getItem("mobile-warning-dismissed");

    if (isMobile && !dismissed) {
      setShowWarning(true);
    }
  }, []);

  const handleDismiss = () => {
    setShowWarning(false);
    sessionStorage.setItem("mobile-warning-dismissed", "true");
  };

  if (!showWarning) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <div className="flex flex-col items-center text-center gap-4">
          <MonitorIcon className="size-12 text-primary" />
          <h3 className="font-bold text-lg">Best on Desktop</h3>
          <p className="text-sm text-base-content/70">
            Intera's code editor and collaboration tools work best on a laptop
            or desktop. For the smoothest experience, switch to a larger screen.
          </p>
          <button className="btn btn-primary btn-sm" onClick={handleDismiss}>
            Continue Anyway
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileWarningModal;
