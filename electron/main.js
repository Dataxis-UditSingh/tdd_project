const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const net = require("net");

let mainWindow = null;
let backendProcess = null;

const FRONTEND_PORT = 5173;
const BACKEND_PORT = 4000;

const isDevelopment = !app.isPackaged;

function waitForPort(port, host = "127.0.0.1", timeout = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      const socket = new net.Socket();

      socket.setTimeout(1000);

      socket.once("connect", () => {
        socket.destroy();
        resolve();
      });

      socket.once("error", () => {
        socket.destroy();

        if (Date.now() - startTime >= timeout) {
          reject(
            new Error(`Timeout waiting for ${host}:${port}`)
          );
          return;
        }

        setTimeout(check, 500);
      });

      socket.once("timeout", () => {
        socket.destroy();

        if (Date.now() - startTime >= timeout) {
          reject(
            new Error(`Timeout waiting for ${host}:${port}`)
          );
          return;
        }

        setTimeout(check, 500);
      });

      socket.connect(port, host);
    };

    check();
  });
}

function startBackend() {
  return new Promise((resolve, reject) => {
    if (isDevelopment) {
      console.log("Starting backend in development mode...");

      backendProcess = spawn(
        process.platform === "win32" ? "npm.cmd" : "npm",
        ["run", "dev", "--workspace", "backend"],
        {
          cwd: app.getAppPath(),
          stdio: "inherit",
          env: {
            ...process.env,
            PORT: String(BACKEND_PORT),
          },
        }
      );
    } else {
      const backendPath = path.join(
        process.resourcesPath,
        "backend",
        "dist",
        "server.js"
      );

      console.log(`Starting production backend: ${backendPath}`);

      backendProcess = spawn(
        process.execPath,
        [backendPath],
        {
          cwd: path.join(
            process.resourcesPath,
            "backend"
          ),
          stdio: "inherit",
          env: {
            ...process.env,
            NODE_ENV: "production",
            PORT: String(BACKEND_PORT),
            ELECTRON_RUN_AS_NODE: "1",
          },
        }
      );
    }

    backendProcess.once("error", (error) => {
      console.error("Failed to start backend:", error);
      reject(error);
    });

    backendProcess.once("exit", (code, signal) => {
      console.log(
        `Backend process exited. code=${code}, signal=${signal}`
      );

      backendProcess = null;
    });

    resolve();
  });
}

function stopBackend() {
  if (!backendProcess) {
    return;
  }

  console.log("Stopping backend...");

  if (process.platform === "win32") {
    spawn("taskkill", [
      "/pid",
      String(backendProcess.pid),
      "/f",
      "/t",
    ]);
  } else {
    backendProcess.kill("SIGTERM");
  }

  backendProcess = null;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,

    minWidth: 1000,
    minHeight: 700,

    icon: path.join(
      __dirname,
      "assets",
      "icon.png"
    ),

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDevelopment) {
    mainWindow.loadURL(`http://localhost:${FRONTEND_PORT}`);
    mainWindow.webContents.openDevTools();
  } else {
    const frontendPath = path.join(
      app.getAppPath(),
      "frontend",
      "dist",
      "index.html"
    );

    console.log(`Loading frontend: ${frontendPath}`);
    mainWindow.loadFile(frontendPath);

    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  try {
    console.log("Starting Electron application...");

    await startBackend();

    console.log("Waiting for backend...");

    await waitForPort(BACKEND_PORT);

    console.log(
      `Backend ready on http://localhost:${BACKEND_PORT}`
    );

    if (isDevelopment) {
      console.log("Waiting for frontend...");

      await waitForPort(FRONTEND_PORT);

      console.log(
        `Frontend ready on http://localhost:${FRONTEND_PORT}`
      );
    }

    createWindow();
  } catch (error) {
    console.error(
      "Application startup failed:",
      error
    );

    stopBackend();
    app.quit();
  }
});

app.on("before-quit", () => {
  stopBackend();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});