# node-global-key-listener

## Description

A simple, cross-platform NodeJS package which can be used to listen to and capture keyboard events.

Compatibility table:

| Platform | Compatible?     | Tested        |
| -------- | --------------- | ------------- |
| Windows  | True            | Win10         |
| Mac      | True            | Mac OS Mojave |
| Linux    | X11 only        | Arch Linux    |

This keyboard listener was originally made for the productivity application, [LaunchMenu](http://launchmenu.github.io/).

## Usage

```ts
import {GlobalKeyboardListener} from "node-global-key-listener";
const v = new GlobalKeyboardListener();

//Log every key that's pressed.
v.addListener(function (e, down) {
    console.log(
        `${e.name} ${e.state == "DOWN" ? "DOWN" : "UP  "} [${e.rawKey._nameRaw}]`
    );
});

//Capture Windows + Space on Windows and Command + Space on Mac
v.addListener(function (e, down) {
    if (
        e.state == "DOWN" &&
        e.name == "SPACE" &&
        (down["LEFT META"] || down["RIGHT META"])
    ) {
        //call your function
        return true;
    }
});

//Capture ALT + F
v.addListener(function (e, down) {
    if (e.state == "DOWN" && e.name == "F" && (down["LEFT ALT"] || down["RIGHT ALT"])) {
        //call your function
        return true;
    }
});

//Call one listener only once (demonstrating removeListener())
calledOnce = function (e) {
    console.log("only called once");
    v.removeListener(calledOnce);
};
v.addListener(calledOnce);

/* 
 To add logging of errors please use. This is hopefully not needed in most cases, but may still be useful in production.
    new GlobalKeyboardListener({
        windows: {
            onError: (errorCode) => console.error("ERROR: " + errorCode),
            onInfo: (info) => console.info("INFO: " + info)
        },
        mac: {
            onError: (errorCode) => console.error("ERROR: " + errorCode),
            // Title shown in the macOS permission prompt if the server binary needs its
            // executable bit restored. Must be alphanumeric + spaces only. Defaults to
            // "Global key listener".
            promptTitle: "My App"
        }
    })
*/
```

## Installation

To install this npm package call:

```
npm install @nekosuneprojects/node-global-key-listener
```

## Is this the right package for you?

NodeJS has various packages for listening to keyboard events raised in the operating system. We may not have created the best package for you, please use the below descriptions to aid you in making your decision:

### Electron::globalShortcut

#### Advantages:

-   Native to electron apps
-   No compiling issues with Node-gyp
-   All execution occurs in-process

#### Disadvantages:

-   On Windows: Cannot override windows specific shortcuts. E.G. Ctrl+Alt+Delete or Windows+Space etc.
-   On Mac: Will not prevent other applications from listening for events
-   Cannot easily be used to listen for arbitrary keys
-   Requires electron in order to function.

### [IOHook](https://www.npmjs.com/package/iohook)

#### Advantages:

-   All execution occurs in-process
-   On Windows: Allows capture of windows specific shortcuts. E.G. Ctrl+Alt+Delete or Windows+Space etc.
-   On Mac: Prevents other applications from listening for captured events.

#### Disadvantages:

-   Cannot easily be used to listen for arbitrary keys
-   Requires compilation with node-gyp. Sometimes the package is released with binaries, however these binaries need to be compiled seperately for each version of node. Furthermore, when compile errors occur the code given is a black box which you will need to fix, which may be complex if you're not used to the languages they are written in.

### [@nekosuneprojects/node-global-key-listener](https://www.npmjs.com/package/@nekosuneprojects/node-global-key-listener)

#### Advantages:

-   Easy to setup as an arbitrary key listener/logger.
-   Does not require node-gyp. Our package comes with pre-compiled binaries which are compatible with your OS and not dependent on node version.
-   On Windows: Allows capture of windows specific shortcuts. E.G. Ctrl+Alt+Delete or Windows+Space etc.
-   On Mac: Prevents other applications from listening for captured events.

#### Disadvantages:

-   Most execution occurs out-of-process. Our package executes and runs a seperate key server which NodeJS interfaces with over stdio. This means that this application might require permission to run depending on your anti-virus system.
-   Some workarounds used may rarely lead to unexpected functionality, see windows specific implementation of windows key listeners
-   If installed into an application on Mac explicit permission will be required from the user via Accessibility.

## Antivirus / Windows Defender false positives

Some antivirus products flag `WinKeyServer.exe` (and sometimes the Mac/X11 binaries) as a
possible keylogger or generic trojan. This is a heuristic false positive, not a sign the binaries
have been tampered with - but it's an expected one, for a real reason:

-   The Windows binary works by installing a global `WH_KEYBOARD_LL`/`WH_MOUSE_LL` hook and
    streaming every key/mouse event to stdout for the calling process to decide on. That is
    structurally identical to how a real keylogger behaves, so generic heuristics key on it
    regardless of intent.
-   None of the prebuilt binaries in `bin/` are digitally signed (there's no code-signing
    certificate associated with this project), and unsigned binaries with no reputation history
    are scored more suspiciously by both antivirus engines and Windows SmartScreen.

What this repo does to reduce false positives, without changing what the tool actually does:

-   `WinKeyServer.exe` is now built with an embedded version-info resource (company/product/file
    description) and an application manifest that explicitly requests `asInvoker` (i.e. it never
    asks for elevated/admin rights). Unsigned binaries with no identifying metadata at all are
    disproportionately likely to be flagged versus ones that identify themselves - see
    `src/bin/WinKeyServer/version.rc` and `app.manifest`.
-   The Mac/X11 binaries are `chmod +x`'d during `npm install` itself (see
    `scripts/postinstall.js`), rather than only as a runtime fallback that silently pops a
    sudo/admin prompt - a package that invokes privilege escalation unprompted is itself a pattern
    some security scanners flag.

What actually resolves it long-term, if you're shipping this as part of a distributed application:

-   **Code-sign `WinKeyServer.exe`** (and notarize the Mac binary) with your own certificate as
    part of your build/release pipeline. This is the only thing that meaningfully affects
    SmartScreen/AV reputation for a binary that legitimately needs to hook global input.
-   If you can't sign it, submit the specific flagged binary to your antivirus vendor (e.g.
    Microsoft's [submission portal](https://www.microsoft.com/en-us/wdsi/filesubmission)) as a
    false positive, or build the binaries yourself from source (`npm run compile-win` /
    `compile-mac` / `compile-x11`) so the artifact isn't a generic, widely-hashed download.
-   Never disable antivirus/SmartScreen entirely to "fix" this - scope any exclusion to the exact
    file path of the binary you've verified.

## Developement

If modifying the typescript code you will have to run the following command in a terminal in the root directory of this package:

```
npm run watch
```

This will cause the application to recompile the typescript whenever the source code is changed. If you are making a change to an application for a single system, please consider adding these changes to both keyboard servers if possible. Generally we will work on both simultaneiously however we know this is not always possible.

### Modifying the compiled binaries

To modify the Windows `C++` or Mac `Swift` source code please compile these applications before testing with:

#### Pre-requisites

##### Windows

This project is configured to use [mingw](https://sourceforge.net/projects/mingw/), and thus this should be installed before compiling the source code.

#### Compiling the binary code

To compile the source code of these applications use the below command line commands respective to the system you are working on.

##### Windows

```
npm run compile-win
```

##### Mac

```
npm run compile-mac
```

##### Linux (X11)

```
npm run compile-x11
```

## Notes

-   If Including this package into an Electron application, the built application will require explicit permission from the user on Mac OS X systems.
-   Given that a fallback may be required we may release an `electron-global-key-listener` package to accommodate this in the future. In our case for LaunchMenu, our fallback is implemented in [`core/keyHandler`](https://github.com/LaunchMenu/LaunchMenu/blob/master/packages/core/src/keyHandler/globalKeyHandler/globalKeyHandler.ts).
