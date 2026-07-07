// Ensures the platform key server binary is executable right after install.
//
// On some install pipelines (e.g. certain pnpm store layouts, tarballs re-packed by CI, or
// files copied rather than extracted) the executable bit on the checked-in Mac/X11 binaries
// can be lost even though this repo tracks them as mode 100755. When that happens the server
// fails to spawn with EACCES (see GitHub issue #36) and, if left unhandled, previously required
// prompting the user for admin/sudo access at runtime just to `chmod +x` a file they already own.
// Fixing the bit here - without any privilege escalation - avoids both problems for the common case.
const fs = require("fs");
const path = require("path");

const binaries = ["MacKeyServer", "X11KeyServer"];

for (const name of binaries) {
    const binPath = path.join(__dirname, "..", "bin", name);
    try {
        if (fs.existsSync(binPath)) fs.chmodSync(binPath, 0o755);
    } catch (e) {
        // Best-effort only: the runtime EACCES fallback (with user-consented elevation)
        // still exists in MacKeyServer.ts/X11KeyServer.ts for cases this can't fix.
    }
}
