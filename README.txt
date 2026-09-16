PLPE ELEVENLABS VOICE PAUSE FIX

Fixes Chromium AbortError:
"The play() request was interrupted by a call to pause()"

The game was able to request the same dialogue key twice while audio.play()
was still pending. The second request stopped the first audio instance.
This replacement shares the pending play promise and never restarts the same
line while it is loading/playing.

It uses ONLY prerecorded MP3 dialogue files from:
/public/audio/game/dialogue/{pl,en}/
No browser/synthetic TTS fallback.
