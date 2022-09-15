const {ipcRenderer} = require('electron')
const ipc  = ipcRenderer

let initFileContent = ""

ipc.invoke("icons")
    .then(json => {
        Object.keys(json).forEach(key => {
            tinymce.activeEditor.ui.registry.addIcon(key, json[key])
        })
    })

let configTinyMCE = {
    selector: 'textarea',
    theme_advanced_resizing : false,
    height: "99.9vh",
    resize: false,
    promotion: false,
    plugins: [
        "advlist", "anchor", "autolink", "charmap", "code", "fullscreen",
        "help", "image", "insertdatetime", "link", "lists", "media",
        "searchreplace", "table", "visualblocks", "slashcommands", "imagetools", 
        "wordcount", "emoticons", "imagetools"
    ],
    toolbar: "undo redo | styles | bold italic underline strikethrough removeformat | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image",
    editor: "restore_draft",
    toolbar_mode: 'floating',
    automatic_uploads: true,
    image_title: true,
    menu: {
        file: { title: 'File', items: 'newdocument open' },
        custom: { title: 'Export', items: 'PDF  WordDocx' }
    },
    image_caption: true,
    menubar: "file edit view insert format custom",
    file_picker_callback: function (cb, value, meta) {
        var input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');

        /*
          Note: In modern browsers input[type="file"] is functional without
          even adding it to the DOM, but that might not be the case in some older
          or quirky browsers like IE, so you might want to add it to the DOM
          just in case, and visually hide it. And do not forget do remove it
          once you do not need it anymore.
        */

        input.onchange = function () {
            var file = this.files[0];

            var reader = new FileReader();
            reader.onload = function () {
                /*
                  Note: Now we need to register the blob in TinyMCEs image blob
                  registry. In the next release this part hopefully won't be
                  necessary, as we are looking to handle it internally.
                */
                var id = 'blobid' + (new Date()).getTime();
                var blobCache =  tinymce.activeEditor.editorUpload.blobCache;
                var base64 = reader.result.split(',')[1];
                var blobInfo = blobCache.create(id, file, base64);
                blobCache.add(blobInfo);

                /* call the callback and populate the Title field with the file name */

                cb(blobInfo.blobUri(), { title: file.name });
            };

            reader.readAsDataURL(file);


        };

        input.click();
    },
    setup: function(editor) {
        editor.on("init", () => {
            editor.setContent(initFileContent)

            ipc.on("send-file-data", (event, args) => {
                ipc.send("save-note-file", {
                    new_save: false,
                    content: editor.getContent()
                })
            })
        })

        editor.ui.registry.addMenuItem('PDF', {
            text: 'PDF',
            icon: "pdf",
            onAction: function() {
                ipc.send("export_pdf", tinymce.activeEditor.getContent())
            }
        });

        editor.ui.registry.addMenuItem('open', {
            text: 'Open Note',
            icon: "open_doc",
            onAction: function() {
                ipc.invoke("open-note-file", "")
                    .then(content => tinymce.activeEditor.setContent(content))
            }
        });

        editor.ui.registry.addMenuItem('WordDocx_disabled', {
            text: 'Docx',
            icon: "word_doc",
            onAction: function() {
                ipc.send("export_docx", tinymce.activeEditor.getContent())
            }
        });

        editor.on('keydown', function (event) {
            if (event.code === "KeyS" && event.ctrlKey) {
                ipc.send("save-note-file", {
                    new_save: false,
                    content: tinymce.activeEditor.getContent()
                })
            }
            if (event.code === "KeyS" && event.ctrlKey && event.shiftKey) {
                ipc.send("save-note-file", {
                    new_save: true,
                    content: tinymce.activeEditor.getContent()
                })
            }
        });

        function getSelectionText() {
            var text = "";
            if (window.getSelection) {
                text = window.getSelection().toString();
            } else if (document.selection && document.selection.type != "Control") {
                text = document.selection.createRange().text;
            }
            return text;
        }

        document.onmouseup = document.onkeyup = document.onselectionchange = function() {
            document.getElementById("sel").value = getSelectionText();
        };
    },
    branding: false,

}

tinymce.PluginManager.add('slashcommands', function (editor) {
    var insertActions = [
        {
            text: 'Heading 1',
            icon: 'h1',
            action: function () {
                editor.execCommand('mceInsertContent', false, '<h1>Heading 1</h1>')
                editor.selection.select(editor.selection.getNode());
            }
        },
        {
            text: 'Heading 2',
            icon: 'h2',
            action: function () {
                editor.execCommand('mceInsertContent', false, '<h2>Heading 2</h2>');
                editor.selection.select(editor.selection.getNode());
            }
        },
        {
            text: 'Heading 3',
            icon: 'h3',
            action: function () {
                editor.execCommand('mceInsertContent', false, '<h3>Heading 3</h3>');
                editor.selection.select(editor.selection.getNode());
            }
        },
        {
            type: 'separator'
        },
        {
            text: 'Paragraph',
            icon: 'p',
            action: function () {
                editor.execCommand('mceInsertContent', false, '<p>Paragraph</p>');
                editor.selection.select(editor.selection.getNode());
            }
        },
        {
            type: 'separator'
        },
        {
            text: 'Bulleted list',
            icon: 'unordered-list',
            action: function () {
                editor.execCommand('InsertUnorderedList', false);
            }
        },
        {
            text: 'Numbered list',
            icon: 'ordered-list',
            action: function () {
                editor.execCommand('InsertOrderedList', false);
            }
        }
    ];

    // Register the slash commands autocompleter
    editor.ui.registry.addAutocompleter('slashcommands', {
        ch: '/',
        minChars: 0,
        columns: 1,
        fetch: function (pattern) {
            const matchedActions = insertActions.filter(function (action) {
                return action.type === 'separator' ||
                    action.text.toLowerCase().indexOf(pattern.toLowerCase()) !== -1;
            });

            return new Promise(function (resolve) {
                var results = matchedActions.map(function (action) {
                    return {
                        meta: action,
                        text: action.text,
                        icon: action.icon,
                        value: action.text,
                        type: action.type
                    }
                });
                resolve(results);
            });
        },
        onAction: function (autocompleteApi, rng, action, meta) {
            editor.selection.setRng(rng);
            // Some actions don't delete the "slash", so we delete all the slash
            // command content before performing the action
            editor.execCommand('Delete');
            meta.action();
            autocompleteApi.hide();
        }
    });
    return {};
});

ipc.on("file-contents", (event, args) => {
    console.log('file contented received')
    initFileContent = args
    tinymce.activeEditor.setContent(args)
})

tinyMCE.init(configTinyMCE);

document.onkeydown = (event) => {
    if (event.code === "KeyS" && event.ctrlKey) {
        ipc.send("save-note-file", {
            new_save: false,
            content: tinymce.activeEditor.getContent()
        })
    }
    if (event.code === "KeyS" && event.ctrlKey && event.shiftKey) {
        ipc.send("save-note-file", {
            new_save: true,
            content: tinymce.activeEditor.getContent()
        })
    }
}

let db = false

window.onbeforeunload = (e) => {
    if (db) return

    db = true

    // Unlike usual browsers that a message box will be prompted to users, returning
    // a non-void value will silently cancel the close.
    // It is recommended to use the dialog API to let the user confirm closing the
    // application.
    e.returnValue = false
    ipc.invoke("closing-window", {
        new_save: false,
        content: tinymce.activeEditor.getContent()
    }).then((success) => {
        if (success) {
            window.close()
        }
    })
}

