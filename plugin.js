'use strict';
(function () {
    CKEDITOR.plugins.add('mathex', {
        // jscs:disable maximumLineLength
        lang: 'en,en-au,en-gb',
        // jscs:enable maximumLineLength
        requires: 'widget,dialog',
        icons: 'mathex',
        hidpi: true, // %REMOVE_LINE_CORE%
        init: function (editor) {
            var cls = editor.config.mathexClass || 'math';
            if (!editor.config.mathJaxLib) {
                CKEDITOR.error('mathjax-no-config');
            }
            editor.widgets.add('mathex', {
                inline: true,
                dialog: 'mathex',
                button: editor.lang.mathex.button,
                mask: true,
                allowedContent: 'span(!' + cls + ')',
                styleToAllowedContentRules: function (style) {
                    var classes = style.getClassesArray();
                    if (!classes)
                        return null;
                    classes.push('!' + cls);

                    return 'span(' + classes.join(',') + ')';
                },
                pathName: editor.lang.mathex.pathName,
                template: '<span class="' + cls + '" style="display:inline-block" data-cke-survive=1></span>',
                parts: {
                    span: 'span'
                },
                defaults: {
                    math: '\\(x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}\\)'
                },
                init: function () {
                    var iframe = this.parts.span.getChild(0);
                    if (!iframe || iframe.type != CKEDITOR.NODE_ELEMENT || !iframe.is('iframe')) {
                        iframe = new CKEDITOR.dom.element('iframe');
                        iframe.setAttributes({
                            style: 'border:0;width:0;height:0',
                            scrolling: 'no',
                            frameborder: 0,
                            allowTransparency: true,
                            src: CKEDITOR.plugins.mathex.fixSrc
                        });
                        this.parts.span.append(iframe);
                    }
                    this.once('ready', function () {
                        if (CKEDITOR.env.ie)
                            iframe.setAttribute('src', CKEDITOR.plugins.mathex.fixSrc);

                        this.frameWrapper = new CKEDITOR.plugins.mathex.frameWrapper(iframe, editor);
                        this.frameWrapper.setValue(this.data.math);
                        console.log(this.frameWrapper.setValue(this.data.math));
                    });
                },
                data: function () {
                    if (this.frameWrapper){
                        console.log(this.frameWrapper.setValue(this.data.math));
                        
                        this.frameWrapper.setValue(this.data.math);
                    }
                },
                upcast: function (el, data) {
                    if (!(el.name == 'span' && el.hasClass(cls)))
                        return;
                    if (el.children.length > 1 || el.children[0].type != CKEDITOR.NODE_TEXT)
                        return;
                    data.math = CKEDITOR.tools.htmlDecode(el.children[0].value);
                    var attrs = el.attributes;
                    if (attrs.style)
                        attrs.style += ';display:inline-block';
                    else
                        attrs.style = 'display:inline-block';
                    attrs['data-cke-survive'] = 1;

                    el.children[0].remove();

                    return el;
                },
                downcast: function (el) {
                    el.children[0].replaceWith(new CKEDITOR.htmlParser.text(CKEDITOR.tools.htmlEncode(this.data.math)));
                    var attrs = el.attributes;
                    attrs.style = attrs.style.replace(/display:\s?inline-block;?\s?/, '');
                    if (attrs.style === '')
                        delete attrs.style;

                    return el;
                }
            });
            CKEDITOR.dialog.add('mathex', this.path + 'dialogs/mathex.js');
            editor.on('contentPreview', function (evt) {
                evt.data.dataValue = evt.data.dataValue.replace(
                    /<\/head>/,
                    '<script src="' + CKEDITOR.getUrl(editor.config.mathJaxLib) + '"><\/script><\/head>'
                );
            });
            editor.on('paste', function (evt) {
                var regex = new RegExp('<span[^>]*?' + cls + '.*?<\/span>', 'ig');
                evt.data.dataValue = evt.data.dataValue.replace(regex, function (match) {
                    return match.replace(/(<iframe.*?\/iframe>)/i, '');
                });
            });
        }
    });
    CKEDITOR.plugins.mathex = {};
    CKEDITOR.plugins.mathex.fixSrc =
        CKEDITOR.env.gecko ? 'javascript:true' :
            CKEDITOR.env.ie ? 'javascript:' +
                'void((function(){' + encodeURIComponent(
                    'document.open();' +
                    '(' + CKEDITOR.tools.fixDomain + ')();' +
                    'document.close();'
                ) + '})())' :
                'javascript:void(0)';
    CKEDITOR.plugins.mathex.loadingIcon = CKEDITOR.plugins.get('mathex').path + 'images/loader.gif';
    CKEDITOR.plugins.mathex.copyStyles = function (from, to) {
        var stylesToCopy = ['color', 'font-family', 'font-style', 'font-weight', 'font-variant', 'font-size'];

        for (var i = 0; i < stylesToCopy.length; i++) {
            var key = stylesToCopy[i],
                val = from.getComputedStyle(key);
            if (val)
                to.setStyle(key, val);
        }
    };
    CKEDITOR.plugins.mathex.trim = function (value) {
        var begin = value.indexOf('\\(') + 2,
            end = value.lastIndexOf('\\)');

        return value.substring(begin, end);
    };
    if (!(CKEDITOR.env.ie && CKEDITOR.env.version == 8)) {
        CKEDITOR.plugins.mathex.frameWrapper = function (iFrame, editor) {
            var buffer, preview, value, newValue,
                doc = iFrame.getFrameDocument(),
                isInit = false,
                isRunning = false,
                loadedHandler = CKEDITOR.tools.addFunction(function () {
                    preview = doc.getById('preview');
                    buffer = doc.getById('buffer');
                    isInit = true;
                    if (newValue)
                        update();
                    CKEDITOR.fire('mathexLoaded', iFrame);
                }),

                updateDoneHandler = CKEDITOR.tools.addFunction(function () {
                    CKEDITOR.plugins.mathex.copyStyles(iFrame, preview);
                    preview.setHtml(buffer.getHtml());
                    editor.fire('lockSnapshot');
                    iFrame.setStyles({
                        height: 0,
                        width: 0
                    });
                    var height = Math.max(doc.$.body.offsetHeight, doc.$.documentElement.offsetHeight),
                      width = Math.max(preview.$.offsetWidth, doc.$.body.scrollWidth) * 1.2;
                    iFrame.setStyles({
                        height: height + 'px',
                        width: width + 'px'
                    });
                    editor.fire('unlockSnapshot');
                    CKEDITOR.fire('mathexUpdateDone', iFrame);
                    if (value != newValue)
                        update();
                    else
                        isRunning = false;
                });
            iFrame.on('load', load);
            load();
            function load() {
                doc = iFrame.getFrameDocument();
                if (doc.getById('preview'))
                    return;
                if (CKEDITOR.env.ie)
                    iFrame.removeAttribute('src');
                doc.write('<!DOCTYPE html>' +
                    '<html>' +
                    '<head>' +
                    '<meta charset="utf-8">' +
                    '<script type="text/x-mathex-config">' +
                    'mathex.Hub.Config( {' +
                    'showMathMenu: false,' +
                    'messageStyle: "none",' +
                    'jax: ["input/TeX", "input/MathML", "output/CommonHTML"],' +
                    'extensions: ["tex2jax.js", "mml2jax.js", "MathMenu.js", "MathZoom.js"],' +
                    'TeX: { extensions: ["AMSmath.js", "AMSsymbols.js", "noErrors.js", "noUndefined.js"] },'+
                    '} );' +
                    'function getCKE() {' +
                    'if ( typeof window.parent.CKEDITOR == \'object\' ) {' +
                    'return window.parent.CKEDITOR;' +
                    '} else {' +
                    'return window.parent.parent.CKEDITOR;' +
                    '}' +
                    '}' +
                    'function update() {' +
                    'window.sessionStorage.setItem("MathjaxRenderStart",true);' +                    
                    'mathex.Hub.Queue(' +
                    '[ \'Typeset\', mathex.Hub, this.buffer ],' +
                    'function() {' +
                    'getCKE().tools.callFunction( ' + updateDoneHandler + ' );' +
                    '}' +
                    ');' +
                    '}' +
                    'mathex.Hub.Queue( function() {' +
                    'getCKE().tools.callFunction(' + loadedHandler + ');' +
                    '} );' +
                    '</script>' +
                    '<script src="' + (editor.config.mathJaxLib) + '"></script>' +
                    '</head>' +
                    '<body style="padding:0;margin:0;background:transparent;overflow:hidden">' +
                    '<span id="preview"></span>' +
                    '<span id="buffer" style="display:none"></span>' +
                    '</body>' +
                    '</html>');
            }
            function update() {
                isRunning = true;
                value = newValue;
                editor.fire('lockSnapshot');
                if (CKEDITOR.tools.htmlDecode(CKEDITOR.plugins.mathex.trim(value)).includes("math")){
                    buffer.setHtml(CKEDITOR.tools.htmlDecode(CKEDITOR.plugins.mathex.trim(value)));
                }else{
                    buffer.setHtml(value)
                }
                preview.setHtml('<img src=' + CKEDITOR.plugins.mathex.loadingIcon + ' alt=' + editor.lang.mathex.loading + '>');
                iFrame.setStyles({
                    height: '16px',
                    width: '16px',
                    display: 'inline',
                    'vertical-align': 'middle'
                });
                editor.fire('unlockSnapshot');
                doc.getWindow().$.update(CKEDITOR.tools.htmlDecode(CKEDITOR.plugins.mathex.trim(value)));
                
            }
            return {
                setValue: function (value) {
                    newValue = CKEDITOR.tools.htmlEncode(value);
                    if (isInit && !isRunning)
                        update();
                }
            };
        };
    } else {
        CKEDITOR.plugins.mathex.frameWrapper = function (iFrame, editor) {
            iFrame.getFrameDocument().write('<!DOCTYPE html>' +
                '<html>' +
                '<head>' +
                '<meta charset="utf-8">' +
                '</head>' +
                '<body style="padding:0;margin:0;background:transparent;overflow:hidden">' +
                '<span style="white-space:nowrap;" id="tex"></span>' +
                '</body>' +
                '</html>');

            return {
                setValue: function (value) {
                    var doc = iFrame.getFrameDocument(),
                        tex = doc.getById('tex');
                    tex.setHtml(CKEDITOR.plugins.mathex.trim(CKEDITOR.tools.htmlEncode(value)));

                    CKEDITOR.plugins.mathex.copyStyles(iFrame, tex);

                    editor.fire('lockSnapshot');

                    iFrame.setStyles({
                        width: Math.min(250, tex.$.offsetWidth) + 'px',
                        height: doc.$.body.offsetHeight + 'px',
                        display: 'inline',
                        'vertical-align': 'middle'
                    });

                    editor.fire('unlockSnapshot');
                }
            };
        };
    }
})();
