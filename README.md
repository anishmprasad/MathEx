# MathEx

A CKEditor Plugin for MathML and Latex Mathemathical Expressions

Editor accepted string format from input

Download mathex plugin from [CKEditor Addons](https://ckeditor.com/cke4/addon/MathEx)

default class was math if you change this you need to configure through ``` mathexClass ```

```html

<span class="math">\({ MathML or Tex Mathemathical expressions }\)</span>

```

Encoder Helper

``` let str = "<span class="math"><math><mrow><msup><mfenced><mrow><mi>a</mi><mo>+</mo><mi>b</mi></mrow></mfenced><mn>2</mn></msup></mrow></math></span>" ```

``` this helper function added escape character before <math /> and html Decode for editor readable format  ```

``` decoder(str) // <span class="math">\( &gt;math&lt;&gt;mrow&lt;&gt;msup&lt;&gt;mfenced&lt;&gt;mrow&lt;&gt;mi&lt;a&gt;/mi&lt;&gt;mo&lt;+&gt;/mo&lt;&gt;mi&lt;b&gt;/mi&lt;&gt;/mrow&lt;&gt;/mfenced&lt;&gt;mn>2&gt/mn&lt;&gt;/msup&lt;&gt;/mrow&lt;&gt;/math> \) </span> ```

```javascript

    function encoder(text){
        if (text){
            var myregexp = /<span[^>]+?class="math".*?>([\s\S]*?)<\/span>/g;
            return text.replace(myregexp, function replacer(match) {
                return match.replace(/<math>([\s\S]*?)<\/math>/g , function replacerData(match) {
                    let tempString = match.replace(/<math>/g, "\\(<math>");
                    return this.htmlEncode(tempString.replace(/<\/math>/g, "</math>\\)"))
                }.bind(this))
            }.bind(this))
        }
    }

```

Decoder Helper

``` let str = "<span class="math">\({ MathML or Tex Mathemathical expressions }\)</span>" ```

``` this helper function removed escape character before <math /> ```

``` decoder(str) // <span class="math"> MathML or Tex Mathemathical expressions </span> ```

```javascript

    function decoder(str) {
        let tempString = str.replace(/\\\(<math>/g, "<math>");
        return tempString.replace(/<\/math>\\\)/g, "</math>");
    }

```

htmlEncode Helper

``` htmlEncode( 'A > B & C < D' )  // 'A &gt; B &amp; C &lt; D' ```

```javascript

    var ampRegex = /&/g,
    gtRegex = />/g,
    ltRegex = /</g,
    quoteRegex = /"/g,
    tokenCharset = 'abcdefghijklmnopqrstuvwxyz0123456789',

/**
     * Replaces special HTML characters in a string with their relative HTML
     * entity values.
     *
     *		console.log( htmlEncode( 'A > B & C < D' ) ); // 'A &gt; B &amp; C &lt; D'
     *
     * @param {String} text The string to be encoded.
     * @returns {String} The encoded string.
     */
    htmlEncode = text => {
        // Backwards compatibility - accept also non-string values (casting is done below).
        // Since 4.4.8 we return empty string for null and undefined because these values make no sense.
        if (text === undefined || text === null) {
            return '';
        }

        return String(text).replace(ampRegex, '&amp;').replace(gtRegex, '&gt;').replace(ltRegex, '&lt;');
    }


```

htmlDecode Helper

``` htmlDecode( '&lt;a &amp; b &gt;' ) // '<a & b >' ```

```javascript

    var ampRegex = /&/g,
    gtRegex = />/g,
    ltRegex = /</g,
    quoteRegex = /"/g,
    tokenCharset = 'abcdefghijklmnopqrstuvwxyz0123456789',

    allEscRegex = /&(lt|gt|amp|quot|nbsp|shy|#\d{1,5});/g,
    namedEntities = {
        lt: '<',
        gt: '>',
        amp: '&',
        quot: '"',
        nbsp: '\u00a0',
        shy: '\u00ad'
    }

    allEscDecode(match, code) {
        if (code[0] == '#') {
            return String.fromCharCode(parseInt(code.slice(1), 10));
        } else {
            return namedEntities[code];
        }
    }

    /**
      * Decodes HTML entities that browsers tend to encode when used in text nodes.
      *
      *		console.log( htmlDecode( '&lt;a &amp; b &gt;' ) ); // '<a & b >'
      *
      * Read more about chosen entities in the [research].
      *
      * @param {String} The string to be decoded.
      * @returns {String} The decoded string.
      */
    htmlDecode = text => {
        // See:
        // * http://jsperf.com/wth-is-going-on-with-jsperf JSPerf has some serious problems, but you can observe
        // that combined regexp tends to be quicker (except on V8). It will also not be prone to fail on '&amp;lt;'
        return text.replace(allEscRegex, this.allEscDecode);
    }

```
### Licence
GPL
