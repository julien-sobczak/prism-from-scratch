
var Prism = (function() {

	var self = {

		languages : {},

		highlightAll : function() {
			var elements = document.querySelectorAll('code[class*="language-"]');

			for (var i = 0, element; element = elements[i++];) {
				self.highlightElement(element);
			}
		},

		highlightElement : function(element) {
			var language = element.className.match(/\blanguage-(?!\*)(\w+)\b/i)[1];
			var grammar = self.languages[language];

			// Set language on the parent, for styling
			var parent = element.parentNode;
			if (/pre/i.test(parent.nodeName)) {
				parent.className = parent.className + ' language-' + language;
			}

			var code = element.textContent;

			element.innerHTML = self.highlight(code, grammar, language);
		},

		highlight : function(text, grammar, language) {
			var tokens = self.tokenize(text, grammar);
			return self.Token.stringify(tokens, language);
		},

		tokenize : function(text, grammar) {
			var strarr = [ text ];

			tokenloop: for ( var token in grammar) {
				if (!grammar.hasOwnProperty(token) || !grammar[token]) {
					continue;
				}

				var pattern = grammar[token],
				    lookbehind = !!pattern.lookbehind, 
				    lookbehindLength = 0;

				pattern = pattern.pattern || pattern;

				for (var i = 0; i < strarr.length; i++) { // Don’t cache length as it changes during the loop

					var str = strarr[i];

					if (str instanceof self.Token) {
						continue;
					}

					var match = pattern.exec(str);

					if (match) {
						if (lookbehind) {
							lookbehindLength = match[1].length;
						}

						var from = match.index - 1 + lookbehindLength, 
						    match = match[0].slice(lookbehindLength), 
						    len = match.length, 
						    to = from + len, 
						    before = str.slice(0, from + 1), 
						    after = str.slice(to + 1);

						var args = [ i, 1 ];

						if (before) {
							args.push(before);
						}

						var wrapped = new self.Token(token, match);

						args.push(wrapped);

						if (after) {
							args.push(after);
						}

						Array.prototype.splice.apply(strarr, args);
					}
				}
			}

			return strarr;
		},
		
		Token: function(type, content) {
			this.type = type;
			this.content = content;
			
			self.Token.stringify = function(o, language, parent) {
				if (typeof o == 'string') {
					return o;
				}

				if (Array.isArray(o)) {
					return o.map(function(element) {
						return self.Token.stringify(element, language, o);
					}).join('');
				}

				var content = self.Token.stringify(o.content, language, parent);
				var	classes = [ 'token', o.type ];

				return '<span class="' + classes.join(' ') + '">' + content + '</span>';
			};
		}
	};
	
	return self;

})();

document.addEventListener('DOMContentLoaded', Prism.highlightAll);


Prism.languages.java = {
	// C-like
	'comment': {
			pattern: /(^|[^\\])\/\*[\w\W]*?\*\//g,
			lookbehind: true
	},
	'string': /("|')(\\?.)*?\1/g,
	'class-name': {
		pattern: /((?:(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[a-z0-9_\.\\]+/ig,
		lookbehind: true
	},
	'keyword': /\b(if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/g,
	'boolean': /\b(true|false)\b/g,
	'function': {
		pattern: /[a-z0-9_]+\(/ig,
	},
	'number': /\b-?(0x[\dA-Fa-f]+|\d*\.?\d+([Ee]-?\d+)?)\b/g,
	'operator': /[-+]{1,2}|!|<=?|>=?|={1,3}|&{1,2}|\|?\||\?|\*|\/|\~|\^|\%/g,
	'ignore': /&(lt|gt|amp);/gi,
	'punctuation': /[{}[\];(),.:]/g,
	
	// Java Specific
	'keyword': /\b(abstract|continue|for|new|switch|assert|default|goto|package|synchronized|boolean|do|if|private|this|break|double|implements|protected|throw|byte|else|import|public|throws|case|enum|instanceof|return|transient|catch|extends|int|short|try|char|final|interface|static|void|class|finally|long|strictfp|volatile|const|float|native|super|while)\b/g,
	'number': /\b0b[01]+\b|\b0x[\da-f]*\.?[\da-fp\-]+\b|\b\d*\.?\d+[e]?[\d]*[df]\b|\W\d*\.?\d+\b/gi,
	'operator': {
		pattern: /(^|[^\.])(?:\+=|\+\+?|-=|--?|!=?|<{1,2}=?|>{1,3}=?|==?|&=|&&?|\|=|\|\|?|\?|\*=?|\/=?|%=?|\^=?|:|~)/gm,
		lookbehind: true
	}
};


