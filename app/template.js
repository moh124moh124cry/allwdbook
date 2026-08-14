import AdminButton from "./adminbutton";

export default function Template({ children }) {
  return (
    <>
      {children}

      <div
        style={{
          position: "fixed",
          top: 12,
          right: 12,
          zIndex: 9999,
        }}
      >
        <AdminButton />
      </div>
    </>
  );
}
