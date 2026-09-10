// NOTE: Demo only: simulated auth endpoints for testing purposes
// Will be swapped 1:1 for the real API/NextAuth calls later!

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export function fakeRegister(
  payload: RegisterPayload,
): Promise<{ ok: boolean; name?: string; error?: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (payload.password.length < 8) {
        resolve({
          ok: false,
          error: "Das Passwort muss mindestens 8 Zeichen lang sein.",
        });
      } else if (payload.email.toLowerCase().startsWith("taken")) {
        resolve({ ok: false, error: "Diese E-Mail ist bereits registriert." });
      } else {
        resolve({ ok: true, name: payload.name || undefined });
      }
    }, 900);
  });
}

export function fakeLogin(
  email: string,
  password: string,
): Promise<{ ok: boolean }> {
  return new Promise((resolve) => {
    setTimeout(
      () => resolve({ ok: !password.toLowerCase().includes("fehler") }),
      900,
    );
  });
}
