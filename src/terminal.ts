import os from 'os';
import pty from 'node-pty';

let sharedPtyProcess:any;
let sharedTerminalMode = false;

const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

const spawnShell = () => {
    return pty.spawn(shell, [], {
        name: 'xterm-color',
        env: process.env,
    });
};

export const setSharedTerminalMode = (useSharedTerminal: boolean) => {
    sharedTerminalMode = useSharedTerminal;
    if (sharedTerminalMode && !sharedPtyProcess) {
        sharedPtyProcess = spawnShell();
    }
};

export const handleTerminalConnection = (ws:any) => {
    let ptyProcess = sharedTerminalMode ? sharedPtyProcess : spawnShell();

    ws.on('message', (command: any) => {
        const processedCommand = commandProcessor(command);
        console.log('message: '+processedCommand)
        ptyProcess.write(processedCommand);
    });

    ptyProcess.on('data', (rawOutput: any) => {
        const processedOutput = outputProcessor(rawOutput);
        console.log('data: '+processedOutput)
        ws.send(processedOutput);
    });

    ws.on('close', () => {
        if (!sharedTerminalMode) {
            ptyProcess.kill();
        }
    });
};

// Utility function to process commands
const commandProcessor = (command: any) => {
    return command;
};

// Utility function to process output
const outputProcessor = (output: any) => {
    return output;
};
