import os from 'os';
import pty from 'node-pty';
import {Client} from 'ssh2'
import {readFileSync } from 'fs'
import {NodeSSH}  from 'node-ssh'
import { time } from 'console';
import { WebSocketServer,WebSocket } from 'ws';


const ssh = new NodeSSH()
ssh.connect({
  host: '192.168.31.190',
  username: 'zhaos',
    password:'123456'
}).then(()=>{
    // ssh.execCommand('ls -la')
    console.log("IsConnected:"+ssh.isConnected())

})
const conn=ssh.connection





// console.log("IsConnected:"+ssh.isConnected)
// const conn=ssh.connection
// const conn = new Client();

// conn?.on('ready', () => {
//     console.log('Client :: ready');
//     conn.shell((err, stream) => {
//       if (err) throw err;
//       stream.on('close', () => {
//         console.log('Stream :: close');
//         conn.end();
//       }).on('data', (data: string) => {
//         console.log('OUTPUT: ' + data);
//       });
//       stream.end('ls -l\nexit\n');
//     });


//     conn.exec("echo 123",(err, client) => {})
//   }).connect({
//       host: '192.168.31.190',
//       username: 'zhaos',
//         password:'123456'
//     })
//     setTimeout(() => {
//         conn.exec('echo 123',(err,channel)=>{
//             console.log(err?.message)
       
//         })  
//     }, 10000);
   



//  // Command
//  ssh.execCommand('ls -la').then(function(result) {
//     console.log('STDOUT: ' + result.stdout)
//     console.log('STDERR: ' + result.stderr)
//   })

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

export const handleTerminalConnection = (ws:WebSocket) => {
    console.log('handleTerminalConnection')
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

    conn?.shell((err, stream) => {
    
      if (err) throw err;
      stream.on('close', () => {
        console.log('Stream :: close');
        conn?.end();
      }).on('data', (data: any) => {
        // const processedOutput = outputProcessor(data);
        // console.log('data: '+processedOutput)
        // ws.send('shell');
      });
      
      stream.end();
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
