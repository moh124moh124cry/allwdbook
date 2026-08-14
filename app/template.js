import AdminButton from "./adminbutton";

export default function Template({ children }) {
  return (
    <>
      {children}

      <div
        style={{
          position: "fixed",
          top: 82,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
        }}
      >
        <AdminButton />
      </div>
    </>
  );
}
