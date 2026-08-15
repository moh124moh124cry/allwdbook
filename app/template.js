import AdminButton from "./adminbutton";
import AccessBadge from "./accessbadge";
import AnonymousAuth from "./anonymousauth";
import WelcomeOverlay from "./welcomeoverlay";

export default function Template({
  children,
}) {
  return (
    <>
      <AnonymousAuth />
      <WelcomeOverlay />

      {children}

      <div
        style={{
          position: "fixed",
          top: 82,
          left: "50%",
          transform:
            "translateX(-50%)",
          zIndex: 9999,
        }}
      >
        <AdminButton />
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 18,
          left: "50%",
          transform:
            "translateX(-50%)",
          zIndex: 9998,
        }}
      >
        <AccessBadge />
      </div>
    </>
  );
}
