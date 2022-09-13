import {app, BrowserWindow, dialog} from 'electron'
import * as express from "express";
import * as electron from 'electron'
import {export_docx, export_pdf} from './src/exporter'
import {writeFileSync, readFileSync} from "fs";
import * as fs from "fs";

const IPCMain = electron.ipcMain
const path = require('path')

let currentNoteFilePath

async function createWindow () {
    const win = new BrowserWindow({
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
            // devTools: false,
        }

    })

    win.menuBarVisible = false


    await win.loadURL(path.join(__dirname, "/views/index.html"))

    if (process.argv[1] !== ".") {
        let fileContents = fs.readFileSync(process.argv[1]).toString()
        let fileJSON = JSON.parse(fileContents)
        currentNoteFilePath = process.argv[1]

        win.webContents.send("file-contents", fileJSON.content)
    }
    return win
}


app.whenReady().then(async () => {
    await createWindow()

    app.on('activate', () => {
        createWindow()
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

IPCMain.on("save-note-file", (event, args) => {
    let options = {

        //Placeholder 3
        filters :[
            {name: 'Note', extensions: ['note']},
            {name: 'All Files', extensions: ['*']}
        ]
    }

    if (args.new_save || !currentNoteFilePath) {
        dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), options)
            .then(async (value) => {
                if (!value.canceled) {
                    currentNoteFilePath = value.filePath
                    writeFileSync(value.filePath, JSON.stringify({
                        content: args.content || ""
                    }))
                }
            })
            .catch(reason => {
                dialog.showErrorBox("Error", reason.toString())
            })
    }
    else {
        writeFileSync(currentNoteFilePath, JSON.stringify({
            content: args.content || ""
        }))
    }

})

IPCMain.handle("icons", (event, args) => {
    return require("./icons.json")
})

IPCMain.handle("open-note-file", (event, args) => {
    let options: electron.OpenDialogOptions = {

        //Placeholder 3
        filters :[
            {name: 'Note', extensions: ['note']},
        ],
        properties: [
            "openFile",
        ]
    }

    return dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), options)
        .then(async (value) => {
            if (!value.canceled) {

                currentNoteFilePath = value.filePaths[0]
                let contents = JSON.parse(readFileSync(value.filePaths[0]).toString())

                return (contents.content)
            }
        })
        .catch(reason => {
            dialog.showErrorBox("Error", reason.toString())
        })
})