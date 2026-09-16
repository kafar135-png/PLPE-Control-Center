PLPE GAME - LOGIN FLOW + MONASTERY RESET FIX

New start flow:
WELCOME -> PLAYER LOGIN -> PROLOGUE -> HUB

Fresh/reset game:
- Welcome button opens PLPE Game login.
- If wallet is disconnected, player chooses/connects a wallet.
- If wallet is connected but game auth is missing, player signs a one-time message.
- After successful login, Prologue opens automatically.
- After Prologue, Chapter 1 is marked started and HUB opens.
- START CHAPTER from HUB then continues the Chapter 1 story instead of replaying Prologue.

Returning game:
- Welcome still goes to login screen.
- A valid saved PLPE Game session can be restored and continued.
- If Chapter 1 was already started, login continues directly to HUB (Prologue is not replayed every launch).

Reset:
- RESET GRY / RESET GAME added to Monastery top bar.
- Confirmation PL: "Czy na pewno chcesz zresetować postęp gry i zacząć od nowa? Dotychczasowy postęp w grze zostanie utracony."
- Reset deletes local gameplay progress.
- Reset clears only the local PLPE Game auth token so the login screen is required again.
- It does NOT delete the player's Supabase account/profile/statistics.
- Welcome-screen reset button removed (it overlapped the Start button).
