export function DocsLogoutButton() {
  return (
    <form action="/api/docs-auth/logout" method="POST">
      <button
        type="submit"
        style={{
          background: "none",
          border: "1px solid currentColor",
          borderRadius: 6,
          padding: "4px 12px",
          fontSize: "0.8rem",
          cursor: "pointer",
          color: "currentColor",
        }}
      >
        Logout
      </button>
    </form>
  );
}
