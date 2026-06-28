import { useState, useEffect } from "react";

export function useMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < breakpoint);
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isMobile;
}

// Shorthand responsive style helper
export function m(mobileStyle, desktopStyle) {
  // Returns a function that takes isMobile and returns the correct style
  // Usage: m({ padding: 12 }, { padding: 32 })(isMobile)
  return (mobile) => (mobile ? { ...mobileStyle } : { ...desktopStyle });
}

// Merge mobile overrides into a style object
// Usage: withMobile({ padding: 32, flexDirection: "row" }, isMobile, { padding: 12, flexDirection: "column" })
export function withMobile(base, isMobile, overrides) {
  if (!isMobile) return base;
  return { ...base, ...overrides };
}
