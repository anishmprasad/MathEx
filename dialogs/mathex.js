/*
 Copyright (c) 2018-2019, Anish M Prasad. All rights reserved.
*/

CKEDITOR.dialog.add("mathex", function (d) {
    var c, b = d.lang.mathex;
    return {
        title: b.title, minWidth: 350, minHeight: 100, contents: [{
            id: "info", elements: [{
                id: "equation", type: "textarea", label: b.dialogInput, onLoad: function () {
                    var a = this;
                    if (!CKEDITOR.env.ie || 8 != CKEDITOR.env.version) this.getInputElement().on("keyup", function () {
                        c.setValue("\\(" + a.getInputElement().getValue() + "\\)")
                    }
                    )
                }
                , setup: function (a) {
                    console.log(CKEDITOR.plugins.mathex.trim(a.data.math))
                    this.setValue(CKEDITOR.plugins.mathex.trim(a.data.math))
                }
                , commit: function (a) {
                    
                    a.setData("math", "\\(" + this.getValue() + "\\)")
                }
            }
                , {
                id: "documentation", type: "html", html: '\x3cdiv style\x3d"width:100%;text-align:right;margin:-8px 0 10px"\x3e\x3ca class\x3d"cke_mathex_doc" href\x3d"' + b.docUrl + '" target\x3d"_black" style\x3d"cursor:pointer;color:#00B2CE;text-decoration:underline"\x3e' + b.docLabel + "\x3c/a\x3e\x3c/div\x3e"
            }
                , !(CKEDITOR.env.ie && 8 == CKEDITOR.env.version) && {
                    id: "preview", type: "html", html: '\x3cdiv style\x3d"width:100%;text-align:center;"\x3e\x3ciframe style\x3d"border:0;width:0;height:0;font-size:20px" scrolling\x3d"no" frameborder\x3d"0" allowTransparency\x3d"true" src\x3d"' + CKEDITOR.plugins.mathex.fixSrc + '"\x3e\x3c/iframe\x3e\x3c/div\x3e', onLoad: function () {
                        var a = CKEDITOR.document.getById(this.domId).getChild(0);
                        c = new CKEDITOR.plugins.mathex.frameWrapper(a, d)
                    }
                    , setup: function (a) {
                        c.setValue(a.data.math)
                    }
                }
            ]
        }
        ]
    }
}

);