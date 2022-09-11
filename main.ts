import {app, BrowserWindow, dialog} from 'electron'
import * as express from "express";
import * as electron from 'electron'
import {export_docx, export_pdf} from './src/exporter'
import {writeFileSync} from "fs";

const IPCMain = electron.ipcMain
const Port = 2342 || process.env.PORT
const path = require('path')
const server = express()

server.listen(Port, () => {
    console.log("Listening to "+Port)
})


server.get("/editor", (req, res) => {
    res.sendFile(path.join(__dirname, '/views/index.html'))
})

server.get("/renderer.js", (req, res) => {
    res.sendFile(path.join(__dirname, '/views/renderer.js'))
})

function createWindow () {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
            devTools: false,
        }

    })

    win.menuBarVisible = false


    win.loadURL("http://localhost:2342/editor")
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})


IPCMain.on("export_pdf", async (event, args) => {

    let options = {

        //Placeholder 3
        filters :[
            {name: 'PDF', extensions: ['pdf']},
            {name: 'All Files', extensions: ['*']}
        ]
    }

   dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), options)
       .then(async (value) => {
          if (!value.canceled) {
              writeFileSync(value.filePath,  await export_pdf(args))
          }
       })

})

IPCMain.on("export_docx", async (event, args) => {

    let options = {

        //Placeholder 3
        filters :[
            {name: 'Word Doc', extensions: ['docx']},
            {name: 'All Files', extensions: ['*']}
        ]
    }

    dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), options)
        .then(async (value) => {
            if (!value.canceled) {
                writeFileSync(value.filePath,  await export_docx(args))
            }
        })
        .catch(reason => {
            dialog.showErrorBox("Error", reason.toString())
        })

})