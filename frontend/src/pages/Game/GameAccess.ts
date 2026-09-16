const TEST_ACCESS_KEY =
  "plpe-arena-test-access-v1";

export function hasArenaTestAccess() {
  return (
    localStorage.getItem(
      TEST_ACCESS_KEY
    ) === "1"
  );
}

export function grantArenaTestAccess() {
  localStorage.setItem(
    TEST_ACCESS_KEY,
    "1"
  );
}

export function revokeArenaTestAccess() {
  localStorage.removeItem(
    TEST_ACCESS_KEY
  );
}