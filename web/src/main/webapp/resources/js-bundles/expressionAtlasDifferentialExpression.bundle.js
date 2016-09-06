var expressionAtlasDifferentialExpression =
webpackJsonp_name_([3],{

/***/ 0:
/*!***********************************************************!*\
  !*** ./expression-atlas-differential-expression/index.js ***!
  \***********************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	module.exports = __webpack_require__(/*! ./src/differentialRenderer.js */ 1814);

/***/ },

/***/ 1806:
/*!**************************************************!*\
  !*** (webpack)/~/node-libs-browser/~/url/url.js ***!
  \**************************************************/
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	var punycode = __webpack_require__(/*! punycode */ 1807);
	
	exports.parse = urlParse;
	exports.resolve = urlResolve;
	exports.resolveObject = urlResolveObject;
	exports.format = urlFormat;
	
	exports.Url = Url;
	
	function Url() {
	  this.protocol = null;
	  this.slashes = null;
	  this.auth = null;
	  this.host = null;
	  this.port = null;
	  this.hostname = null;
	  this.hash = null;
	  this.search = null;
	  this.query = null;
	  this.pathname = null;
	  this.path = null;
	  this.href = null;
	}
	
	// Reference: RFC 3986, RFC 1808, RFC 2396
	
	// define these here so at least they only have to be
	// compiled once on the first module load.
	var protocolPattern = /^([a-z0-9.+-]+:)/i,
	    portPattern = /:[0-9]*$/,
	
	    // RFC 2396: characters reserved for delimiting URLs.
	    // We actually just auto-escape these.
	    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],
	
	    // RFC 2396: characters not allowed for various reasons.
	    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),
	
	    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
	    autoEscape = ['\''].concat(unwise),
	    // Characters that are never ever allowed in a hostname.
	    // Note that any invalid chars are also handled, but these
	    // are the ones that are *expected* to be seen, so we fast-path
	    // them.
	    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
	    hostEndingChars = ['/', '?', '#'],
	    hostnameMaxLen = 255,
	    hostnamePartPattern = /^[a-z0-9A-Z_-]{0,63}$/,
	    hostnamePartStart = /^([a-z0-9A-Z_-]{0,63})(.*)$/,
	    // protocols that can allow "unsafe" and "unwise" chars.
	    unsafeProtocol = {
	      'javascript': true,
	      'javascript:': true
	    },
	    // protocols that never have a hostname.
	    hostlessProtocol = {
	      'javascript': true,
	      'javascript:': true
	    },
	    // protocols that always contain a // bit.
	    slashedProtocol = {
	      'http': true,
	      'https': true,
	      'ftp': true,
	      'gopher': true,
	      'file': true,
	      'http:': true,
	      'https:': true,
	      'ftp:': true,
	      'gopher:': true,
	      'file:': true
	    },
	    querystring = __webpack_require__(/*! querystring */ 1808);
	
	function urlParse(url, parseQueryString, slashesDenoteHost) {
	  if (url && isObject(url) && url instanceof Url) return url;
	
	  var u = new Url;
	  u.parse(url, parseQueryString, slashesDenoteHost);
	  return u;
	}
	
	Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
	  if (!isString(url)) {
	    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
	  }
	
	  var rest = url;
	
	  // trim before proceeding.
	  // This is to support parse stuff like "  http://foo.com  \n"
	  rest = rest.trim();
	
	  var proto = protocolPattern.exec(rest);
	  if (proto) {
	    proto = proto[0];
	    var lowerProto = proto.toLowerCase();
	    this.protocol = lowerProto;
	    rest = rest.substr(proto.length);
	  }
	
	  // figure out if it's got a host
	  // user@server is *always* interpreted as a hostname, and url
	  // resolution will treat //foo/bar as host=foo,path=bar because that's
	  // how the browser resolves relative URLs.
	  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
	    var slashes = rest.substr(0, 2) === '//';
	    if (slashes && !(proto && hostlessProtocol[proto])) {
	      rest = rest.substr(2);
	      this.slashes = true;
	    }
	  }
	
	  if (!hostlessProtocol[proto] &&
	      (slashes || (proto && !slashedProtocol[proto]))) {
	
	    // there's a hostname.
	    // the first instance of /, ?, ;, or # ends the host.
	    //
	    // If there is an @ in the hostname, then non-host chars *are* allowed
	    // to the left of the last @ sign, unless some host-ending character
	    // comes *before* the @-sign.
	    // URLs are obnoxious.
	    //
	    // ex:
	    // http://a@b@c/ => user:a@b host:c
	    // http://a@b?@c => user:a host:c path:/?@c
	
	    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
	    // Review our test case against browsers more comprehensively.
	
	    // find the first instance of any hostEndingChars
	    var hostEnd = -1;
	    for (var i = 0; i < hostEndingChars.length; i++) {
	      var hec = rest.indexOf(hostEndingChars[i]);
	      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
	        hostEnd = hec;
	    }
	
	    // at this point, either we have an explicit point where the
	    // auth portion cannot go past, or the last @ char is the decider.
	    var auth, atSign;
	    if (hostEnd === -1) {
	      // atSign can be anywhere.
	      atSign = rest.lastIndexOf('@');
	    } else {
	      // atSign must be in auth portion.
	      // http://a@b/c@d => host:b auth:a path:/c@d
	      atSign = rest.lastIndexOf('@', hostEnd);
	    }
	
	    // Now we have a portion which is definitely the auth.
	    // Pull that off.
	    if (atSign !== -1) {
	      auth = rest.slice(0, atSign);
	      rest = rest.slice(atSign + 1);
	      this.auth = decodeURIComponent(auth);
	    }
	
	    // the host is the remaining to the left of the first non-host char
	    hostEnd = -1;
	    for (var i = 0; i < nonHostChars.length; i++) {
	      var hec = rest.indexOf(nonHostChars[i]);
	      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
	        hostEnd = hec;
	    }
	    // if we still have not hit it, then the entire thing is a host.
	    if (hostEnd === -1)
	      hostEnd = rest.length;
	
	    this.host = rest.slice(0, hostEnd);
	    rest = rest.slice(hostEnd);
	
	    // pull out port.
	    this.parseHost();
	
	    // we've indicated that there is a hostname,
	    // so even if it's empty, it has to be present.
	    this.hostname = this.hostname || '';
	
	    // if hostname begins with [ and ends with ]
	    // assume that it's an IPv6 address.
	    var ipv6Hostname = this.hostname[0] === '[' &&
	        this.hostname[this.hostname.length - 1] === ']';
	
	    // validate a little.
	    if (!ipv6Hostname) {
	      var hostparts = this.hostname.split(/\./);
	      for (var i = 0, l = hostparts.length; i < l; i++) {
	        var part = hostparts[i];
	        if (!part) continue;
	        if (!part.match(hostnamePartPattern)) {
	          var newpart = '';
	          for (var j = 0, k = part.length; j < k; j++) {
	            if (part.charCodeAt(j) > 127) {
	              // we replace non-ASCII char with a temporary placeholder
	              // we need this to make sure size of hostname is not
	              // broken by replacing non-ASCII by nothing
	              newpart += 'x';
	            } else {
	              newpart += part[j];
	            }
	          }
	          // we test again with ASCII char only
	          if (!newpart.match(hostnamePartPattern)) {
	            var validParts = hostparts.slice(0, i);
	            var notHost = hostparts.slice(i + 1);
	            var bit = part.match(hostnamePartStart);
	            if (bit) {
	              validParts.push(bit[1]);
	              notHost.unshift(bit[2]);
	            }
	            if (notHost.length) {
	              rest = '/' + notHost.join('.') + rest;
	            }
	            this.hostname = validParts.join('.');
	            break;
	          }
	        }
	      }
	    }
	
	    if (this.hostname.length > hostnameMaxLen) {
	      this.hostname = '';
	    } else {
	      // hostnames are always lower case.
	      this.hostname = this.hostname.toLowerCase();
	    }
	
	    if (!ipv6Hostname) {
	      // IDNA Support: Returns a puny coded representation of "domain".
	      // It only converts the part of the domain name that
	      // has non ASCII characters. I.e. it dosent matter if
	      // you call it with a domain that already is in ASCII.
	      var domainArray = this.hostname.split('.');
	      var newOut = [];
	      for (var i = 0; i < domainArray.length; ++i) {
	        var s = domainArray[i];
	        newOut.push(s.match(/[^A-Za-z0-9_-]/) ?
	            'xn--' + punycode.encode(s) : s);
	      }
	      this.hostname = newOut.join('.');
	    }
	
	    var p = this.port ? ':' + this.port : '';
	    var h = this.hostname || '';
	    this.host = h + p;
	    this.href += this.host;
	
	    // strip [ and ] from the hostname
	    // the host field still retains them, though
	    if (ipv6Hostname) {
	      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
	      if (rest[0] !== '/') {
	        rest = '/' + rest;
	      }
	    }
	  }
	
	  // now rest is set to the post-host stuff.
	  // chop off any delim chars.
	  if (!unsafeProtocol[lowerProto]) {
	
	    // First, make 100% sure that any "autoEscape" chars get
	    // escaped, even if encodeURIComponent doesn't think they
	    // need to be.
	    for (var i = 0, l = autoEscape.length; i < l; i++) {
	      var ae = autoEscape[i];
	      var esc = encodeURIComponent(ae);
	      if (esc === ae) {
	        esc = escape(ae);
	      }
	      rest = rest.split(ae).join(esc);
	    }
	  }
	
	
	  // chop off from the tail first.
	  var hash = rest.indexOf('#');
	  if (hash !== -1) {
	    // got a fragment string.
	    this.hash = rest.substr(hash);
	    rest = rest.slice(0, hash);
	  }
	  var qm = rest.indexOf('?');
	  if (qm !== -1) {
	    this.search = rest.substr(qm);
	    this.query = rest.substr(qm + 1);
	    if (parseQueryString) {
	      this.query = querystring.parse(this.query);
	    }
	    rest = rest.slice(0, qm);
	  } else if (parseQueryString) {
	    // no query string, but parseQueryString still requested
	    this.search = '';
	    this.query = {};
	  }
	  if (rest) this.pathname = rest;
	  if (slashedProtocol[lowerProto] &&
	      this.hostname && !this.pathname) {
	    this.pathname = '/';
	  }
	
	  //to support http.request
	  if (this.pathname || this.search) {
	    var p = this.pathname || '';
	    var s = this.search || '';
	    this.path = p + s;
	  }
	
	  // finally, reconstruct the href based on what has been validated.
	  this.href = this.format();
	  return this;
	};
	
	// format a parsed object into a url string
	function urlFormat(obj) {
	  // ensure it's an object, and not a string url.
	  // If it's an obj, this is a no-op.
	  // this way, you can call url_format() on strings
	  // to clean up potentially wonky urls.
	  if (isString(obj)) obj = urlParse(obj);
	  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
	  return obj.format();
	}
	
	Url.prototype.format = function() {
	  var auth = this.auth || '';
	  if (auth) {
	    auth = encodeURIComponent(auth);
	    auth = auth.replace(/%3A/i, ':');
	    auth += '@';
	  }
	
	  var protocol = this.protocol || '',
	      pathname = this.pathname || '',
	      hash = this.hash || '',
	      host = false,
	      query = '';
	
	  if (this.host) {
	    host = auth + this.host;
	  } else if (this.hostname) {
	    host = auth + (this.hostname.indexOf(':') === -1 ?
	        this.hostname :
	        '[' + this.hostname + ']');
	    if (this.port) {
	      host += ':' + this.port;
	    }
	  }
	
	  if (this.query &&
	      isObject(this.query) &&
	      Object.keys(this.query).length) {
	    query = querystring.stringify(this.query);
	  }
	
	  var search = this.search || (query && ('?' + query)) || '';
	
	  if (protocol && protocol.substr(-1) !== ':') protocol += ':';
	
	  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
	  // unless they had them to begin with.
	  if (this.slashes ||
	      (!protocol || slashedProtocol[protocol]) && host !== false) {
	    host = '//' + (host || '');
	    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
	  } else if (!host) {
	    host = '';
	  }
	
	  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
	  if (search && search.charAt(0) !== '?') search = '?' + search;
	
	  pathname = pathname.replace(/[?#]/g, function(match) {
	    return encodeURIComponent(match);
	  });
	  search = search.replace('#', '%23');
	
	  return protocol + host + pathname + search + hash;
	};
	
	function urlResolve(source, relative) {
	  return urlParse(source, false, true).resolve(relative);
	}
	
	Url.prototype.resolve = function(relative) {
	  return this.resolveObject(urlParse(relative, false, true)).format();
	};
	
	function urlResolveObject(source, relative) {
	  if (!source) return relative;
	  return urlParse(source, false, true).resolveObject(relative);
	}
	
	Url.prototype.resolveObject = function(relative) {
	  if (isString(relative)) {
	    var rel = new Url();
	    rel.parse(relative, false, true);
	    relative = rel;
	  }
	
	  var result = new Url();
	  Object.keys(this).forEach(function(k) {
	    result[k] = this[k];
	  }, this);
	
	  // hash is always overridden, no matter what.
	  // even href="" will remove it.
	  result.hash = relative.hash;
	
	  // if the relative url is empty, then there's nothing left to do here.
	  if (relative.href === '') {
	    result.href = result.format();
	    return result;
	  }
	
	  // hrefs like //foo/bar always cut to the protocol.
	  if (relative.slashes && !relative.protocol) {
	    // take everything except the protocol from relative
	    Object.keys(relative).forEach(function(k) {
	      if (k !== 'protocol')
	        result[k] = relative[k];
	    });
	
	    //urlParse appends trailing / to urls like http://www.example.com
	    if (slashedProtocol[result.protocol] &&
	        result.hostname && !result.pathname) {
	      result.path = result.pathname = '/';
	    }
	
	    result.href = result.format();
	    return result;
	  }
	
	  if (relative.protocol && relative.protocol !== result.protocol) {
	    // if it's a known url protocol, then changing
	    // the protocol does weird things
	    // first, if it's not file:, then we MUST have a host,
	    // and if there was a path
	    // to begin with, then we MUST have a path.
	    // if it is file:, then the host is dropped,
	    // because that's known to be hostless.
	    // anything else is assumed to be absolute.
	    if (!slashedProtocol[relative.protocol]) {
	      Object.keys(relative).forEach(function(k) {
	        result[k] = relative[k];
	      });
	      result.href = result.format();
	      return result;
	    }
	
	    result.protocol = relative.protocol;
	    if (!relative.host && !hostlessProtocol[relative.protocol]) {
	      var relPath = (relative.pathname || '').split('/');
	      while (relPath.length && !(relative.host = relPath.shift()));
	      if (!relative.host) relative.host = '';
	      if (!relative.hostname) relative.hostname = '';
	      if (relPath[0] !== '') relPath.unshift('');
	      if (relPath.length < 2) relPath.unshift('');
	      result.pathname = relPath.join('/');
	    } else {
	      result.pathname = relative.pathname;
	    }
	    result.search = relative.search;
	    result.query = relative.query;
	    result.host = relative.host || '';
	    result.auth = relative.auth;
	    result.hostname = relative.hostname || relative.host;
	    result.port = relative.port;
	    // to support http.request
	    if (result.pathname || result.search) {
	      var p = result.pathname || '';
	      var s = result.search || '';
	      result.path = p + s;
	    }
	    result.slashes = result.slashes || relative.slashes;
	    result.href = result.format();
	    return result;
	  }
	
	  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
	      isRelAbs = (
	          relative.host ||
	          relative.pathname && relative.pathname.charAt(0) === '/'
	      ),
	      mustEndAbs = (isRelAbs || isSourceAbs ||
	                    (result.host && relative.pathname)),
	      removeAllDots = mustEndAbs,
	      srcPath = result.pathname && result.pathname.split('/') || [],
	      relPath = relative.pathname && relative.pathname.split('/') || [],
	      psychotic = result.protocol && !slashedProtocol[result.protocol];
	
	  // if the url is a non-slashed url, then relative
	  // links like ../.. should be able
	  // to crawl up to the hostname, as well.  This is strange.
	  // result.protocol has already been set by now.
	  // Later on, put the first path part into the host field.
	  if (psychotic) {
	    result.hostname = '';
	    result.port = null;
	    if (result.host) {
	      if (srcPath[0] === '') srcPath[0] = result.host;
	      else srcPath.unshift(result.host);
	    }
	    result.host = '';
	    if (relative.protocol) {
	      relative.hostname = null;
	      relative.port = null;
	      if (relative.host) {
	        if (relPath[0] === '') relPath[0] = relative.host;
	        else relPath.unshift(relative.host);
	      }
	      relative.host = null;
	    }
	    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
	  }
	
	  if (isRelAbs) {
	    // it's absolute.
	    result.host = (relative.host || relative.host === '') ?
	                  relative.host : result.host;
	    result.hostname = (relative.hostname || relative.hostname === '') ?
	                      relative.hostname : result.hostname;
	    result.search = relative.search;
	    result.query = relative.query;
	    srcPath = relPath;
	    // fall through to the dot-handling below.
	  } else if (relPath.length) {
	    // it's relative
	    // throw away the existing file, and take the new path instead.
	    if (!srcPath) srcPath = [];
	    srcPath.pop();
	    srcPath = srcPath.concat(relPath);
	    result.search = relative.search;
	    result.query = relative.query;
	  } else if (!isNullOrUndefined(relative.search)) {
	    // just pull out the search.
	    // like href='?foo'.
	    // Put this after the other two cases because it simplifies the booleans
	    if (psychotic) {
	      result.hostname = result.host = srcPath.shift();
	      //occationaly the auth can get stuck only in host
	      //this especialy happens in cases like
	      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
	      var authInHost = result.host && result.host.indexOf('@') > 0 ?
	                       result.host.split('@') : false;
	      if (authInHost) {
	        result.auth = authInHost.shift();
	        result.host = result.hostname = authInHost.shift();
	      }
	    }
	    result.search = relative.search;
	    result.query = relative.query;
	    //to support http.request
	    if (!isNull(result.pathname) || !isNull(result.search)) {
	      result.path = (result.pathname ? result.pathname : '') +
	                    (result.search ? result.search : '');
	    }
	    result.href = result.format();
	    return result;
	  }
	
	  if (!srcPath.length) {
	    // no path at all.  easy.
	    // we've already handled the other stuff above.
	    result.pathname = null;
	    //to support http.request
	    if (result.search) {
	      result.path = '/' + result.search;
	    } else {
	      result.path = null;
	    }
	    result.href = result.format();
	    return result;
	  }
	
	  // if a url ENDs in . or .., then it must get a trailing slash.
	  // however, if it ends in anything else non-slashy,
	  // then it must NOT get a trailing slash.
	  var last = srcPath.slice(-1)[0];
	  var hasTrailingSlash = (
	      (result.host || relative.host) && (last === '.' || last === '..') ||
	      last === '');
	
	  // strip single dots, resolve double dots to parent dir
	  // if the path tries to go above the root, `up` ends up > 0
	  var up = 0;
	  for (var i = srcPath.length; i >= 0; i--) {
	    last = srcPath[i];
	    if (last == '.') {
	      srcPath.splice(i, 1);
	    } else if (last === '..') {
	      srcPath.splice(i, 1);
	      up++;
	    } else if (up) {
	      srcPath.splice(i, 1);
	      up--;
	    }
	  }
	
	  // if the path is allowed to go above the root, restore leading ..s
	  if (!mustEndAbs && !removeAllDots) {
	    for (; up--; up) {
	      srcPath.unshift('..');
	    }
	  }
	
	  if (mustEndAbs && srcPath[0] !== '' &&
	      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
	    srcPath.unshift('');
	  }
	
	  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
	    srcPath.push('');
	  }
	
	  var isAbsolute = srcPath[0] === '' ||
	      (srcPath[0] && srcPath[0].charAt(0) === '/');
	
	  // put the host back
	  if (psychotic) {
	    result.hostname = result.host = isAbsolute ? '' :
	                                    srcPath.length ? srcPath.shift() : '';
	    //occationaly the auth can get stuck only in host
	    //this especialy happens in cases like
	    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
	    var authInHost = result.host && result.host.indexOf('@') > 0 ?
	                     result.host.split('@') : false;
	    if (authInHost) {
	      result.auth = authInHost.shift();
	      result.host = result.hostname = authInHost.shift();
	    }
	  }
	
	  mustEndAbs = mustEndAbs || (result.host && srcPath.length);
	
	  if (mustEndAbs && !isAbsolute) {
	    srcPath.unshift('');
	  }
	
	  if (!srcPath.length) {
	    result.pathname = null;
	    result.path = null;
	  } else {
	    result.pathname = srcPath.join('/');
	  }
	
	  //to support request.http
	  if (!isNull(result.pathname) || !isNull(result.search)) {
	    result.path = (result.pathname ? result.pathname : '') +
	                  (result.search ? result.search : '');
	  }
	  result.auth = relative.auth || result.auth;
	  result.slashes = result.slashes || relative.slashes;
	  result.href = result.format();
	  return result;
	};
	
	Url.prototype.parseHost = function() {
	  var host = this.host;
	  var port = portPattern.exec(host);
	  if (port) {
	    port = port[0];
	    if (port !== ':') {
	      this.port = port.substr(1);
	    }
	    host = host.substr(0, host.length - port.length);
	  }
	  if (host) this.hostname = host;
	};
	
	function isString(arg) {
	  return typeof arg === "string";
	}
	
	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	
	function isNull(arg) {
	  return arg === null;
	}
	function isNullOrUndefined(arg) {
	  return  arg == null;
	}


/***/ },

/***/ 1807:
/*!******************************************************************!*\
  !*** (webpack)/~/node-libs-browser/~/url/~/punycode/punycode.js ***!
  \******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module, global) {/*! https://mths.be/punycode v1.3.2 by @mathias */
	;(function(root) {
	
		/** Detect free variables */
		var freeExports = typeof exports == 'object' && exports &&
			!exports.nodeType && exports;
		var freeModule = typeof module == 'object' && module &&
			!module.nodeType && module;
		var freeGlobal = typeof global == 'object' && global;
		if (
			freeGlobal.global === freeGlobal ||
			freeGlobal.window === freeGlobal ||
			freeGlobal.self === freeGlobal
		) {
			root = freeGlobal;
		}
	
		/**
		 * The `punycode` object.
		 * @name punycode
		 * @type Object
		 */
		var punycode,
	
		/** Highest positive signed 32-bit float value */
		maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1
	
		/** Bootstring parameters */
		base = 36,
		tMin = 1,
		tMax = 26,
		skew = 38,
		damp = 700,
		initialBias = 72,
		initialN = 128, // 0x80
		delimiter = '-', // '\x2D'
	
		/** Regular expressions */
		regexPunycode = /^xn--/,
		regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
		regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators
	
		/** Error messages */
		errors = {
			'overflow': 'Overflow: input needs wider integers to process',
			'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
			'invalid-input': 'Invalid input'
		},
	
		/** Convenience shortcuts */
		baseMinusTMin = base - tMin,
		floor = Math.floor,
		stringFromCharCode = String.fromCharCode,
	
		/** Temporary variable */
		key;
	
		/*--------------------------------------------------------------------------*/
	
		/**
		 * A generic error utility function.
		 * @private
		 * @param {String} type The error type.
		 * @returns {Error} Throws a `RangeError` with the applicable error message.
		 */
		function error(type) {
			throw RangeError(errors[type]);
		}
	
		/**
		 * A generic `Array#map` utility function.
		 * @private
		 * @param {Array} array The array to iterate over.
		 * @param {Function} callback The function that gets called for every array
		 * item.
		 * @returns {Array} A new array of values returned by the callback function.
		 */
		function map(array, fn) {
			var length = array.length;
			var result = [];
			while (length--) {
				result[length] = fn(array[length]);
			}
			return result;
		}
	
		/**
		 * A simple `Array#map`-like wrapper to work with domain name strings or email
		 * addresses.
		 * @private
		 * @param {String} domain The domain name or email address.
		 * @param {Function} callback The function that gets called for every
		 * character.
		 * @returns {Array} A new string of characters returned by the callback
		 * function.
		 */
		function mapDomain(string, fn) {
			var parts = string.split('@');
			var result = '';
			if (parts.length > 1) {
				// In email addresses, only the domain name should be punycoded. Leave
				// the local part (i.e. everything up to `@`) intact.
				result = parts[0] + '@';
				string = parts[1];
			}
			// Avoid `split(regex)` for IE8 compatibility. See #17.
			string = string.replace(regexSeparators, '\x2E');
			var labels = string.split('.');
			var encoded = map(labels, fn).join('.');
			return result + encoded;
		}
	
		/**
		 * Creates an array containing the numeric code points of each Unicode
		 * character in the string. While JavaScript uses UCS-2 internally,
		 * this function will convert a pair of surrogate halves (each of which
		 * UCS-2 exposes as separate characters) into a single code point,
		 * matching UTF-16.
		 * @see `punycode.ucs2.encode`
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode.ucs2
		 * @name decode
		 * @param {String} string The Unicode input string (UCS-2).
		 * @returns {Array} The new array of code points.
		 */
		function ucs2decode(string) {
			var output = [],
			    counter = 0,
			    length = string.length,
			    value,
			    extra;
			while (counter < length) {
				value = string.charCodeAt(counter++);
				if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
					// high surrogate, and there is a next character
					extra = string.charCodeAt(counter++);
					if ((extra & 0xFC00) == 0xDC00) { // low surrogate
						output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
					} else {
						// unmatched surrogate; only append this code unit, in case the next
						// code unit is the high surrogate of a surrogate pair
						output.push(value);
						counter--;
					}
				} else {
					output.push(value);
				}
			}
			return output;
		}
	
		/**
		 * Creates a string based on an array of numeric code points.
		 * @see `punycode.ucs2.decode`
		 * @memberOf punycode.ucs2
		 * @name encode
		 * @param {Array} codePoints The array of numeric code points.
		 * @returns {String} The new Unicode string (UCS-2).
		 */
		function ucs2encode(array) {
			return map(array, function(value) {
				var output = '';
				if (value > 0xFFFF) {
					value -= 0x10000;
					output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
					value = 0xDC00 | value & 0x3FF;
				}
				output += stringFromCharCode(value);
				return output;
			}).join('');
		}
	
		/**
		 * Converts a basic code point into a digit/integer.
		 * @see `digitToBasic()`
		 * @private
		 * @param {Number} codePoint The basic numeric code point value.
		 * @returns {Number} The numeric value of a basic code point (for use in
		 * representing integers) in the range `0` to `base - 1`, or `base` if
		 * the code point does not represent a value.
		 */
		function basicToDigit(codePoint) {
			if (codePoint - 48 < 10) {
				return codePoint - 22;
			}
			if (codePoint - 65 < 26) {
				return codePoint - 65;
			}
			if (codePoint - 97 < 26) {
				return codePoint - 97;
			}
			return base;
		}
	
		/**
		 * Converts a digit/integer into a basic code point.
		 * @see `basicToDigit()`
		 * @private
		 * @param {Number} digit The numeric value of a basic code point.
		 * @returns {Number} The basic code point whose value (when used for
		 * representing integers) is `digit`, which needs to be in the range
		 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
		 * used; else, the lowercase form is used. The behavior is undefined
		 * if `flag` is non-zero and `digit` has no uppercase form.
		 */
		function digitToBasic(digit, flag) {
			//  0..25 map to ASCII a..z or A..Z
			// 26..35 map to ASCII 0..9
			return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
		}
	
		/**
		 * Bias adaptation function as per section 3.4 of RFC 3492.
		 * http://tools.ietf.org/html/rfc3492#section-3.4
		 * @private
		 */
		function adapt(delta, numPoints, firstTime) {
			var k = 0;
			delta = firstTime ? floor(delta / damp) : delta >> 1;
			delta += floor(delta / numPoints);
			for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
				delta = floor(delta / baseMinusTMin);
			}
			return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
		}
	
		/**
		 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
		 * symbols.
		 * @memberOf punycode
		 * @param {String} input The Punycode string of ASCII-only symbols.
		 * @returns {String} The resulting string of Unicode symbols.
		 */
		function decode(input) {
			// Don't use UCS-2
			var output = [],
			    inputLength = input.length,
			    out,
			    i = 0,
			    n = initialN,
			    bias = initialBias,
			    basic,
			    j,
			    index,
			    oldi,
			    w,
			    k,
			    digit,
			    t,
			    /** Cached calculation results */
			    baseMinusT;
	
			// Handle the basic code points: let `basic` be the number of input code
			// points before the last delimiter, or `0` if there is none, then copy
			// the first basic code points to the output.
	
			basic = input.lastIndexOf(delimiter);
			if (basic < 0) {
				basic = 0;
			}
	
			for (j = 0; j < basic; ++j) {
				// if it's not a basic code point
				if (input.charCodeAt(j) >= 0x80) {
					error('not-basic');
				}
				output.push(input.charCodeAt(j));
			}
	
			// Main decoding loop: start just after the last delimiter if any basic code
			// points were copied; start at the beginning otherwise.
	
			for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {
	
				// `index` is the index of the next character to be consumed.
				// Decode a generalized variable-length integer into `delta`,
				// which gets added to `i`. The overflow checking is easier
				// if we increase `i` as we go, then subtract off its starting
				// value at the end to obtain `delta`.
				for (oldi = i, w = 1, k = base; /* no condition */; k += base) {
	
					if (index >= inputLength) {
						error('invalid-input');
					}
	
					digit = basicToDigit(input.charCodeAt(index++));
	
					if (digit >= base || digit > floor((maxInt - i) / w)) {
						error('overflow');
					}
	
					i += digit * w;
					t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
	
					if (digit < t) {
						break;
					}
	
					baseMinusT = base - t;
					if (w > floor(maxInt / baseMinusT)) {
						error('overflow');
					}
	
					w *= baseMinusT;
	
				}
	
				out = output.length + 1;
				bias = adapt(i - oldi, out, oldi == 0);
	
				// `i` was supposed to wrap around from `out` to `0`,
				// incrementing `n` each time, so we'll fix that now:
				if (floor(i / out) > maxInt - n) {
					error('overflow');
				}
	
				n += floor(i / out);
				i %= out;
	
				// Insert `n` at position `i` of the output
				output.splice(i++, 0, n);
	
			}
	
			return ucs2encode(output);
		}
	
		/**
		 * Converts a string of Unicode symbols (e.g. a domain name label) to a
		 * Punycode string of ASCII-only symbols.
		 * @memberOf punycode
		 * @param {String} input The string of Unicode symbols.
		 * @returns {String} The resulting Punycode string of ASCII-only symbols.
		 */
		function encode(input) {
			var n,
			    delta,
			    handledCPCount,
			    basicLength,
			    bias,
			    j,
			    m,
			    q,
			    k,
			    t,
			    currentValue,
			    output = [],
			    /** `inputLength` will hold the number of code points in `input`. */
			    inputLength,
			    /** Cached calculation results */
			    handledCPCountPlusOne,
			    baseMinusT,
			    qMinusT;
	
			// Convert the input in UCS-2 to Unicode
			input = ucs2decode(input);
	
			// Cache the length
			inputLength = input.length;
	
			// Initialize the state
			n = initialN;
			delta = 0;
			bias = initialBias;
	
			// Handle the basic code points
			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue < 0x80) {
					output.push(stringFromCharCode(currentValue));
				}
			}
	
			handledCPCount = basicLength = output.length;
	
			// `handledCPCount` is the number of code points that have been handled;
			// `basicLength` is the number of basic code points.
	
			// Finish the basic string - if it is not empty - with a delimiter
			if (basicLength) {
				output.push(delimiter);
			}
	
			// Main encoding loop:
			while (handledCPCount < inputLength) {
	
				// All non-basic code points < n have been handled already. Find the next
				// larger one:
				for (m = maxInt, j = 0; j < inputLength; ++j) {
					currentValue = input[j];
					if (currentValue >= n && currentValue < m) {
						m = currentValue;
					}
				}
	
				// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
				// but guard against overflow
				handledCPCountPlusOne = handledCPCount + 1;
				if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
					error('overflow');
				}
	
				delta += (m - n) * handledCPCountPlusOne;
				n = m;
	
				for (j = 0; j < inputLength; ++j) {
					currentValue = input[j];
	
					if (currentValue < n && ++delta > maxInt) {
						error('overflow');
					}
	
					if (currentValue == n) {
						// Represent delta as a generalized variable-length integer
						for (q = delta, k = base; /* no condition */; k += base) {
							t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
							if (q < t) {
								break;
							}
							qMinusT = q - t;
							baseMinusT = base - t;
							output.push(
								stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
							);
							q = floor(qMinusT / baseMinusT);
						}
	
						output.push(stringFromCharCode(digitToBasic(q, 0)));
						bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
						delta = 0;
						++handledCPCount;
					}
				}
	
				++delta;
				++n;
	
			}
			return output.join('');
		}
	
		/**
		 * Converts a Punycode string representing a domain name or an email address
		 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
		 * it doesn't matter if you call it on a string that has already been
		 * converted to Unicode.
		 * @memberOf punycode
		 * @param {String} input The Punycoded domain name or email address to
		 * convert to Unicode.
		 * @returns {String} The Unicode representation of the given Punycode
		 * string.
		 */
		function toUnicode(input) {
			return mapDomain(input, function(string) {
				return regexPunycode.test(string)
					? decode(string.slice(4).toLowerCase())
					: string;
			});
		}
	
		/**
		 * Converts a Unicode string representing a domain name or an email address to
		 * Punycode. Only the non-ASCII parts of the domain name will be converted,
		 * i.e. it doesn't matter if you call it with a domain that's already in
		 * ASCII.
		 * @memberOf punycode
		 * @param {String} input The domain name or email address to convert, as a
		 * Unicode string.
		 * @returns {String} The Punycode representation of the given domain name or
		 * email address.
		 */
		function toASCII(input) {
			return mapDomain(input, function(string) {
				return regexNonASCII.test(string)
					? 'xn--' + encode(string)
					: string;
			});
		}
	
		/*--------------------------------------------------------------------------*/
	
		/** Define the public API */
		punycode = {
			/**
			 * A string representing the current Punycode.js version number.
			 * @memberOf punycode
			 * @type String
			 */
			'version': '1.3.2',
			/**
			 * An object of methods to convert from JavaScript's internal character
			 * representation (UCS-2) to Unicode code points, and back.
			 * @see <https://mathiasbynens.be/notes/javascript-encoding>
			 * @memberOf punycode
			 * @type Object
			 */
			'ucs2': {
				'decode': ucs2decode,
				'encode': ucs2encode
			},
			'decode': decode,
			'encode': encode,
			'toASCII': toASCII,
			'toUnicode': toUnicode
		};
	
		/** Expose `punycode` */
		// Some AMD build optimizers, like r.js, check for specific condition patterns
		// like the following:
		if (
			true
		) {
			!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
				return punycode;
			}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		} else if (freeExports && freeModule) {
			if (module.exports == freeExports) { // in Node.js or RingoJS v0.8.0+
				freeModule.exports = punycode;
			} else { // in Narwhal or RingoJS v0.7.0-
				for (key in punycode) {
					punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
				}
			}
		} else { // in Rhino or a web browser
			root.punycode = punycode;
		}
	
	}(this));
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(/*! ./../../../../../../buildin/module.js */ 628)(module), (function() { return this; }())))

/***/ },

/***/ 1808:
/*!******************************************************************!*\
  !*** (webpack)/~/node-libs-browser/~/url/~/querystring/index.js ***!
  \******************************************************************/
[2491, 1809, 1810],

/***/ 1809:
/*!*******************************************************************!*\
  !*** (webpack)/~/node-libs-browser/~/url/~/querystring/decode.js ***!
  \*******************************************************************/
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	'use strict';
	
	// If obj.hasOwnProperty has been overridden, then calling
	// obj.hasOwnProperty(prop) will break.
	// See: https://github.com/joyent/node/issues/1707
	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}
	
	module.exports = function(qs, sep, eq, options) {
	  sep = sep || '&';
	  eq = eq || '=';
	  var obj = {};
	
	  if (typeof qs !== 'string' || qs.length === 0) {
	    return obj;
	  }
	
	  var regexp = /\+/g;
	  qs = qs.split(sep);
	
	  var maxKeys = 1000;
	  if (options && typeof options.maxKeys === 'number') {
	    maxKeys = options.maxKeys;
	  }
	
	  var len = qs.length;
	  // maxKeys <= 0 means that we should not limit keys count
	  if (maxKeys > 0 && len > maxKeys) {
	    len = maxKeys;
	  }
	
	  for (var i = 0; i < len; ++i) {
	    var x = qs[i].replace(regexp, '%20'),
	        idx = x.indexOf(eq),
	        kstr, vstr, k, v;
	
	    if (idx >= 0) {
	      kstr = x.substr(0, idx);
	      vstr = x.substr(idx + 1);
	    } else {
	      kstr = x;
	      vstr = '';
	    }
	
	    k = decodeURIComponent(kstr);
	    v = decodeURIComponent(vstr);
	
	    if (!hasOwnProperty(obj, k)) {
	      obj[k] = v;
	    } else if (Array.isArray(obj[k])) {
	      obj[k].push(v);
	    } else {
	      obj[k] = [obj[k], v];
	    }
	  }
	
	  return obj;
	};


/***/ },

/***/ 1810:
/*!*******************************************************************!*\
  !*** (webpack)/~/node-libs-browser/~/url/~/querystring/encode.js ***!
  \*******************************************************************/
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	'use strict';
	
	var stringifyPrimitive = function(v) {
	  switch (typeof v) {
	    case 'string':
	      return v;
	
	    case 'boolean':
	      return v ? 'true' : 'false';
	
	    case 'number':
	      return isFinite(v) ? v : '';
	
	    default:
	      return '';
	  }
	};
	
	module.exports = function(obj, sep, eq, name) {
	  sep = sep || '&';
	  eq = eq || '=';
	  if (obj === null) {
	    obj = undefined;
	  }
	
	  if (typeof obj === 'object') {
	    return Object.keys(obj).map(function(k) {
	      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
	      if (Array.isArray(obj[k])) {
	        return obj[k].map(function(v) {
	          return ks + encodeURIComponent(stringifyPrimitive(v));
	        }).join(sep);
	      } else {
	        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
	      }
	    }).join(sep);
	
	  }
	
	  if (!name) return '';
	  return encodeURIComponent(stringifyPrimitive(name)) + eq +
	         encodeURIComponent(stringifyPrimitive(obj));
	};


/***/ },

/***/ 1811:
/*!****************************************************************!*\
  !*** (webpack)/~/node-libs-browser/~/querystring-es3/index.js ***!
  \****************************************************************/
[2491, 1812, 1813],

/***/ 1812:
/*!*****************************************************************!*\
  !*** (webpack)/~/node-libs-browser/~/querystring-es3/decode.js ***!
  \*****************************************************************/
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	'use strict';
	
	// If obj.hasOwnProperty has been overridden, then calling
	// obj.hasOwnProperty(prop) will break.
	// See: https://github.com/joyent/node/issues/1707
	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}
	
	module.exports = function(qs, sep, eq, options) {
	  sep = sep || '&';
	  eq = eq || '=';
	  var obj = {};
	
	  if (typeof qs !== 'string' || qs.length === 0) {
	    return obj;
	  }
	
	  var regexp = /\+/g;
	  qs = qs.split(sep);
	
	  var maxKeys = 1000;
	  if (options && typeof options.maxKeys === 'number') {
	    maxKeys = options.maxKeys;
	  }
	
	  var len = qs.length;
	  // maxKeys <= 0 means that we should not limit keys count
	  if (maxKeys > 0 && len > maxKeys) {
	    len = maxKeys;
	  }
	
	  for (var i = 0; i < len; ++i) {
	    var x = qs[i].replace(regexp, '%20'),
	        idx = x.indexOf(eq),
	        kstr, vstr, k, v;
	
	    if (idx >= 0) {
	      kstr = x.substr(0, idx);
	      vstr = x.substr(idx + 1);
	    } else {
	      kstr = x;
	      vstr = '';
	    }
	
	    k = decodeURIComponent(kstr);
	    v = decodeURIComponent(vstr);
	
	    if (!hasOwnProperty(obj, k)) {
	      obj[k] = v;
	    } else if (isArray(obj[k])) {
	      obj[k].push(v);
	    } else {
	      obj[k] = [obj[k], v];
	    }
	  }
	
	  return obj;
	};
	
	var isArray = Array.isArray || function (xs) {
	  return Object.prototype.toString.call(xs) === '[object Array]';
	};


/***/ },

/***/ 1813:
/*!*****************************************************************!*\
  !*** (webpack)/~/node-libs-browser/~/querystring-es3/encode.js ***!
  \*****************************************************************/
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	'use strict';
	
	var stringifyPrimitive = function(v) {
	  switch (typeof v) {
	    case 'string':
	      return v;
	
	    case 'boolean':
	      return v ? 'true' : 'false';
	
	    case 'number':
	      return isFinite(v) ? v : '';
	
	    default:
	      return '';
	  }
	};
	
	module.exports = function(obj, sep, eq, name) {
	  sep = sep || '&';
	  eq = eq || '=';
	  if (obj === null) {
	    obj = undefined;
	  }
	
	  if (typeof obj === 'object') {
	    return map(objectKeys(obj), function(k) {
	      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
	      if (isArray(obj[k])) {
	        return map(obj[k], function(v) {
	          return ks + encodeURIComponent(stringifyPrimitive(v));
	        }).join(sep);
	      } else {
	        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
	      }
	    }).join(sep);
	
	  }
	
	  if (!name) return '';
	  return encodeURIComponent(stringifyPrimitive(name)) + eq +
	         encodeURIComponent(stringifyPrimitive(obj));
	};
	
	var isArray = Array.isArray || function (xs) {
	  return Object.prototype.toString.call(xs) === '[object Array]';
	};
	
	function map (xs, f) {
	  if (xs.map) return xs.map(f);
	  var res = [];
	  for (var i = 0; i < xs.length; i++) {
	    res.push(f(xs[i], i));
	  }
	  return res;
	}
	
	var objectKeys = Object.keys || function (obj) {
	  var res = [];
	  for (var key in obj) {
	    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
	  }
	  return res;
	};


/***/ },

/***/ 1814:
/*!******************************************************************************!*\
  !*** ./expression-atlas-differential-expression/src/differentialRenderer.js ***!
  \******************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var React = __webpack_require__(/*! react */ 1815);
	var ReactDOM = __webpack_require__(/*! react-dom */ 1971);
	
	//*------------------------------------------------------------------*
	
	var DifferentialRouter = __webpack_require__(/*! ./DifferentialRouter.jsx */ 1972);
	
	//*------------------------------------------------------------------*
	
	module.exports = function (_ref) {
	    var _ref$atlasHostUrl = _ref.atlasHostUrl;
	    var hostUrl = _ref$atlasHostUrl === undefined ? window.location.protocol + "//" + window.location.host : _ref$atlasHostUrl;
	    var geneQuery = _ref.geneQuery;
	    var conditionQuery = _ref.conditionQuery;
	    var species = _ref.species;
	    var _ref$target = _ref.target;
	    var target = _ref$target === undefined ? 'gxaDifferentialTab' : _ref$target;
	
	    ReactDOM.render(React.createElement(DifferentialRouter, { hostUrl: hostUrl, geneQuery: geneQuery, conditionQuery: conditionQuery, species: species }), document.getElementById(target));
	};

/***/ },

/***/ 1815:
/*!*******************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/react.js ***!
  \*******************************************************************/
[2493, 1816],

/***/ 1816:
/*!***********************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/React.js ***!
  \***********************************************************************/
[2494, 1817, 1961, 1965, 1852, 1970],

/***/ 1817:
/*!**************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactDOM.js ***!
  \**************************************************************************/
[2495, 1818, 1819, 1884, 1858, 1841, 1831, 1863, 1867, 1959, 1904, 1960, 1838, 1822],

/***/ 1818:
/*!***********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactCurrentOwner.js ***!
  \***********************************************************************************/
5,

/***/ 1819:
/*!***************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactDOMTextComponent.js ***!
  \***************************************************************************************/
[2496, 1820, 1835, 1839, 1841, 1852, 1834, 1833, 1883],

/***/ 1820:
/*!***************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/DOMChildrenOperations.js ***!
  \***************************************************************************************/
[2497, 1821, 1829, 1831, 1832, 1833, 1826],

/***/ 1821:
/*!************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/Danger.js ***!
  \************************************************************************/
[2498, 1822, 1823, 1828, 1827, 1826],

/***/ 1822:
/*!*********************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/~/fbjs/lib/ExecutionEnvironment.js ***!
  \*********************************************************************************************/
9,

/***/ 1823:
/*!**********************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/~/fbjs/lib/createNodesFromMarkup.js ***!
  \**********************************************************************************************/
[2499, 1822, 1824, 1827, 1826],

/***/ 1824:
/*!*********************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/~/fbjs/lib/createArrayFromMixed.js ***!
  \*********************************************************************************************/
[2500, 1825],

/***/ 1825:
/*!********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/~/fbjs/lib/toArray.js ***!
  \********************************************************************************/
[2501, 1826],

/***/ 1826:
/*!**********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/~/fbjs/lib/invariant.js ***!
  \**********************************************************************************/
13,

/***/ 1827:
/*!**************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/~/fbjs/lib/getMarkupWrap.js ***!
  \**************************************************************************************/
[2502, 1822, 1826],

/***/ 1828:
/*!**************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/~/fbjs/lib/emptyFunction.js ***!
  \**************************************************************************************/
15,

/***/ 1829:
/*!********************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactMultiChildUpdateTypes.js ***!
  \********************************************************************************************/
[2503, 1830],

/***/ 1830:
/*!**********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/~/fbjs/lib/keyMirror.js ***!
  \**********************************************************************************/
[2504, 1826],

/***/ 1831:
/*!***************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactPerf.js ***!
  \***************************************************************************/
18,

/***/ 1832:
/*!******************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/setInnerHTML.js ***!
  \******************************************************************************/
[2505, 1822],

/***/ 1833:
/*!********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/setTextContent.js ***!
  \********************************************************************************/
[2506, 1822, 1834, 1832],

/***/ 1834:
/*!*********************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/escapeTextContentForBrowser.js ***!
  \*********************************************************************************************/
21,

/***/ 1835:
/*!***************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/DOMPropertyOperations.js ***!
  \***************************************************************************************/
[2507, 1836, 1831, 1837, 1838],

/***/ 1836:
/*!*****************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/DOMProperty.js ***!
  \*****************************************************************************/
[2508, 1826],

/***/ 1837:
/*!***********************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/quoteAttributeValueForBrowser.js ***!
  \***********************************************************************************************/
[2509, 1834],

/***/ 1838:
/*!********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/~/fbjs/lib/warning.js ***!
  \********************************************************************************/
[2510, 1828],

/***/ 1839:
/*!**************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactComponentBrowserEnvironment.js ***!
  \**************************************************************************************************/
[2511, 1840, 1841],

/***/ 1840:
/*!**************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactDOMIDOperations.js ***!
  \**************************************************************************************/
[2512, 1820, 1835, 1841, 1831, 1826],

/***/ 1841:
/*!****************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactMount.js ***!
  \****************************************************************************/
[2513, 1836, 1842, 1818, 1854, 1855, 1857, 1858, 1860, 1861, 1831, 1863, 1866, 1867, 1852, 1871, 1872, 1875, 1826, 1832, 1880, 1883, 1838],

/***/ 1842:
/*!******************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactBrowserEventEmitter.js ***!
  \******************************************************************************************/
[2514, 1843, 1844, 1845, 1850, 1831, 1851, 1852, 1853],

/***/ 1843:
/*!********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/EventConstants.js ***!
  \********************************************************************************/
[2515, 1830],

/***/ 1844:
/*!********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/EventPluginHub.js ***!
  \********************************************************************************/
[2516, 1845, 1846, 1847, 1848, 1849, 1826, 1838],

/***/ 1845:
/*!*************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/EventPluginRegistry.js ***!
  \*************************************************************************************/
[2517, 1826],

/***/ 1846:
/*!**********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/EventPluginUtils.js ***!
  \**********************************************************************************/
[2518, 1843, 1847, 1826, 1838],

/***/ 1847:
/*!*********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactErrorUtils.js ***!
  \*********************************************************************************/
34,

/***/ 1848:
/*!********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/accumulateInto.js ***!
  \********************************************************************************/
[2519, 1826],

/***/ 1849:
/*!************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/forEachAccumulated.js ***!
  \************************************************************************************/
36,

/***/ 1850:
/*!****************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactEventEmitterMixin.js ***!
  \****************************************************************************************/
[2520, 1844],

/***/ 1851:
/*!*********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ViewportMetrics.js ***!
  \*********************************************************************************/
38,

/***/ 1852:
/*!*******************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/Object.assign.js ***!
  \*******************************************************************************/
39,

/***/ 1853:
/*!**********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/isEventSupported.js ***!
  \**********************************************************************************/
[2521, 1822],

/***/ 1854:
/*!**************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactDOMFeatureFlags.js ***!
  \**************************************************************************************/
41,

/***/ 1855:
/*!******************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactElement.js ***!
  \******************************************************************************/
[2522, 1818, 1852, 1856],

/***/ 1856:
/*!***********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/canDefineProperty.js ***!
  \***********************************************************************************/
43,

/***/ 1857:
/*!*********************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactEmptyComponentRegistry.js ***!
  \*********************************************************************************************/
44,

/***/ 1858:
/*!**************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactInstanceHandles.js ***!
  \**************************************************************************************/
[2523, 1859, 1826],

/***/ 1859:
/*!********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactRootIndex.js ***!
  \********************************************************************************/
46,

/***/ 1860:
/*!**********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactInstanceMap.js ***!
  \**********************************************************************************/
47,

/***/ 1861:
/*!*************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactMarkupChecksum.js ***!
  \*************************************************************************************/
[2524, 1862],

/***/ 1862:
/*!*************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/adler32.js ***!
  \*************************************************************************/
49,

/***/ 1863:
/*!*********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactReconciler.js ***!
  \*********************************************************************************/
[2525, 1864],

/***/ 1864:
/*!**************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactRef.js ***!
  \**************************************************************************/
[2526, 1865],

/***/ 1865:
/*!****************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactOwner.js ***!
  \****************************************************************************/
[2527, 1826],

/***/ 1866:
/*!**********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactUpdateQueue.js ***!
  \**********************************************************************************/
[2528, 1818, 1855, 1860, 1867, 1852, 1826, 1838],

/***/ 1867:
/*!******************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactUpdates.js ***!
  \******************************************************************************/
[2529, 1868, 1869, 1831, 1863, 1870, 1852, 1826],

/***/ 1868:
/*!*******************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/CallbackQueue.js ***!
  \*******************************************************************************/
[2530, 1869, 1852, 1826],

/***/ 1869:
/*!*****************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/PooledClass.js ***!
  \*****************************************************************************/
[2531, 1826],

/***/ 1870:
/*!*****************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/Transaction.js ***!
  \*****************************************************************************/
[2532, 1826],

/***/ 1871:
/*!************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/~/fbjs/lib/emptyObject.js ***!
  \************************************************************************************/
58,

/***/ 1872:
/*!*************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/~/fbjs/lib/containsNode.js ***!
  \*************************************************************************************/
[2533, 1873],

/***/ 1873:
/*!***********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/~/fbjs/lib/isTextNode.js ***!
  \***********************************************************************************/
[2534, 1874],

/***/ 1874:
/*!*******************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/~/fbjs/lib/isNode.js ***!
  \*******************************************************************************/
61,

/***/ 1875:
/*!*******************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/instantiateReactComponent.js ***!
  \*******************************************************************************************/
[2535, 1876, 1881, 1882, 1852, 1826, 1838],

/***/ 1876:
/*!*****************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactCompositeComponent.js ***!
  \*****************************************************************************************/
[2536, 1877, 1818, 1855, 1860, 1831, 1878, 1879, 1863, 1866, 1852, 1871, 1826, 1880, 1838],

/***/ 1877:
/*!*******************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactComponentEnvironment.js ***!
  \*******************************************************************************************/
[2537, 1826],

/***/ 1878:
/*!****************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactPropTypeLocations.js ***!
  \****************************************************************************************/
[2538, 1830],

/***/ 1879:
/*!********************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactPropTypeLocationNames.js ***!
  \********************************************************************************************/
66,

/***/ 1880:
/*!********************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/shouldUpdateReactComponent.js ***!
  \********************************************************************************************/
67,

/***/ 1881:
/*!*************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactEmptyComponent.js ***!
  \*************************************************************************************/
[2539, 1855, 1857, 1863, 1852],

/***/ 1882:
/*!**************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactNativeComponent.js ***!
  \**************************************************************************************/
[2540, 1852, 1826],

/***/ 1883:
/*!************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/validateDOMNesting.js ***!
  \************************************************************************************/
[2541, 1852, 1828, 1838],

/***/ 1884:
/*!***************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactDefaultInjection.js ***!
  \***************************************************************************************/
[2542, 1885, 1893, 1896, 1897, 1898, 1822, 1902, 1903, 1839, 1905, 1906, 1819, 1931, 1934, 1858, 1841, 1938, 1943, 1944, 1945, 1954, 1955],

/***/ 1885:
/*!****************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/BeforeInputEventPlugin.js ***!
  \****************************************************************************************/
[2543, 1843, 1886, 1822, 1887, 1889, 1891, 1892],

/***/ 1886:
/*!**********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/EventPropagators.js ***!
  \**********************************************************************************/
[2544, 1843, 1844, 1838, 1848, 1849],

/***/ 1887:
/*!******************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/FallbackCompositionState.js ***!
  \******************************************************************************************/
[2545, 1869, 1852, 1888],

/***/ 1888:
/*!****************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/getTextContentAccessor.js ***!
  \****************************************************************************************/
[2546, 1822],

/***/ 1889:
/*!*******************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/SyntheticCompositionEvent.js ***!
  \*******************************************************************************************/
[2547, 1890],

/***/ 1890:
/*!********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/SyntheticEvent.js ***!
  \********************************************************************************/
[2548, 1869, 1852, 1828, 1838],

/***/ 1891:
/*!*************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/SyntheticInputEvent.js ***!
  \*************************************************************************************/
[2549, 1890],

/***/ 1892:
/*!******************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/~/fbjs/lib/keyOf.js ***!
  \******************************************************************************/
79,

/***/ 1893:
/*!***********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ChangeEventPlugin.js ***!
  \***********************************************************************************/
[2550, 1843, 1844, 1886, 1822, 1867, 1890, 1894, 1853, 1895, 1892],

/***/ 1894:
/*!********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/getEventTarget.js ***!
  \********************************************************************************/
81,

/***/ 1895:
/*!************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/isTextInputElement.js ***!
  \************************************************************************************/
82,

/***/ 1896:
/*!**************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ClientReactRootIndex.js ***!
  \**************************************************************************************/
83,

/***/ 1897:
/*!*****************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/DefaultEventPluginOrder.js ***!
  \*****************************************************************************************/
[2551, 1892],

/***/ 1898:
/*!***************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/EnterLeaveEventPlugin.js ***!
  \***************************************************************************************/
[2552, 1843, 1886, 1899, 1841, 1892],

/***/ 1899:
/*!*************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/SyntheticMouseEvent.js ***!
  \*************************************************************************************/
[2553, 1900, 1851, 1901],

/***/ 1900:
/*!**********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/SyntheticUIEvent.js ***!
  \**********************************************************************************/
[2554, 1890, 1894],

/***/ 1901:
/*!***************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/getEventModifierState.js ***!
  \***************************************************************************************/
88,

/***/ 1902:
/*!***************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/HTMLDOMPropertyConfig.js ***!
  \***************************************************************************************/
[2555, 1836, 1822],

/***/ 1903:
/*!********************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactBrowserComponentMixin.js ***!
  \********************************************************************************************/
[2556, 1860, 1904, 1838],

/***/ 1904:
/*!*****************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/findDOMNode.js ***!
  \*****************************************************************************/
[2557, 1818, 1860, 1841, 1826, 1838],

/***/ 1905:
/*!**********************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactDefaultBatchingStrategy.js ***!
  \**********************************************************************************************/
[2558, 1867, 1870, 1852, 1828],

/***/ 1906:
/*!***********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactDOMComponent.js ***!
  \***********************************************************************************/
[2559, 1907, 1909, 1836, 1835, 1843, 1842, 1839, 1917, 1918, 1922, 1925, 1926, 1841, 1927, 1831, 1866, 1852, 1856, 1834, 1826, 1853, 1892, 1832, 1833, 1930, 1883, 1838],

/***/ 1907:
/*!********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/AutoFocusUtils.js ***!
  \********************************************************************************/
[2560, 1841, 1904, 1908],

/***/ 1908:
/*!**********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/~/fbjs/lib/focusNode.js ***!
  \**********************************************************************************/
95,

/***/ 1909:
/*!***************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/CSSPropertyOperations.js ***!
  \***************************************************************************************/
[2561, 1910, 1822, 1831, 1911, 1913, 1914, 1916, 1838],

/***/ 1910:
/*!*****************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/CSSProperty.js ***!
  \*****************************************************************************/
97,

/***/ 1911:
/*!******************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/~/fbjs/lib/camelizeStyleName.js ***!
  \******************************************************************************************/
[2562, 1912],

/***/ 1912:
/*!*********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/~/fbjs/lib/camelize.js ***!
  \*********************************************************************************/
99,

/***/ 1913:
/*!*************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/dangerousStyleValue.js ***!
  \*************************************************************************************/
[2563, 1910],

/***/ 1914:
/*!*******************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/~/fbjs/lib/hyphenateStyleName.js ***!
  \*******************************************************************************************/
[2564, 1915],

/***/ 1915:
/*!**********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/~/fbjs/lib/hyphenate.js ***!
  \**********************************************************************************/
102,

/***/ 1916:
/*!******************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/~/fbjs/lib/memoizeStringOnly.js ***!
  \******************************************************************************************/
103,

/***/ 1917:
/*!********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactDOMButton.js ***!
  \********************************************************************************/
104,

/***/ 1918:
/*!*******************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactDOMInput.js ***!
  \*******************************************************************************/
[2565, 1840, 1919, 1841, 1867, 1852, 1826],

/***/ 1919:
/*!**********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/LinkedValueUtils.js ***!
  \**********************************************************************************/
[2566, 1920, 1878, 1826, 1838],

/***/ 1920:
/*!********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactPropTypes.js ***!
  \********************************************************************************/
[2567, 1855, 1879, 1828, 1921],

/***/ 1921:
/*!*******************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/getIteratorFn.js ***!
  \*******************************************************************************/
108,

/***/ 1922:
/*!********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactDOMOption.js ***!
  \********************************************************************************/
[2568, 1923, 1925, 1852, 1838],

/***/ 1923:
/*!*******************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactChildren.js ***!
  \*******************************************************************************/
[2569, 1869, 1855, 1828, 1924],

/***/ 1924:
/*!*************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/traverseAllChildren.js ***!
  \*************************************************************************************/
[2570, 1818, 1855, 1858, 1921, 1826, 1838],

/***/ 1925:
/*!********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactDOMSelect.js ***!
  \********************************************************************************/
[2571, 1919, 1841, 1867, 1852, 1838],

/***/ 1926:
/*!**********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactDOMTextarea.js ***!
  \**********************************************************************************/
[2572, 1919, 1840, 1867, 1852, 1826, 1838],

/***/ 1927:
/*!*********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactMultiChild.js ***!
  \*********************************************************************************/
[2573, 1877, 1829, 1818, 1863, 1928, 1929],

/***/ 1928:
/*!**************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactChildReconciler.js ***!
  \**************************************************************************************/
[2574, 1863, 1875, 1880, 1924, 1838],

/***/ 1929:
/*!*********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/flattenChildren.js ***!
  \*********************************************************************************/
[2575, 1924, 1838],

/***/ 1930:
/*!*************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/~/fbjs/lib/shallowEqual.js ***!
  \*************************************************************************************/
117,

/***/ 1931:
/*!************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactEventListener.js ***!
  \************************************************************************************/
[2576, 1932, 1822, 1869, 1858, 1841, 1867, 1852, 1894, 1933],

/***/ 1932:
/*!**************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/~/fbjs/lib/EventListener.js ***!
  \**************************************************************************************/
[2577, 1828],

/***/ 1933:
/*!***************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/~/fbjs/lib/getUnboundedScrollPosition.js ***!
  \***************************************************************************************************/
120,

/***/ 1934:
/*!********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactInjection.js ***!
  \********************************************************************************/
[2578, 1836, 1844, 1877, 1935, 1881, 1842, 1882, 1831, 1859, 1867],

/***/ 1935:
/*!****************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactClass.js ***!
  \****************************************************************************/
[2579, 1936, 1855, 1878, 1879, 1937, 1852, 1871, 1826, 1830, 1892, 1838],

/***/ 1936:
/*!********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactComponent.js ***!
  \********************************************************************************/
[2580, 1937, 1856, 1871, 1826, 1838],

/***/ 1937:
/*!**************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactNoopUpdateQueue.js ***!
  \**************************************************************************************/
[2581, 1838],

/***/ 1938:
/*!*******************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactReconcileTransaction.js ***!
  \*******************************************************************************************/
[2582, 1868, 1869, 1842, 1854, 1939, 1870, 1852],

/***/ 1939:
/*!*************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactInputSelection.js ***!
  \*************************************************************************************/
[2583, 1940, 1872, 1908, 1942],

/***/ 1940:
/*!***********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactDOMSelection.js ***!
  \***********************************************************************************/
[2584, 1822, 1941, 1888],

/***/ 1941:
/*!*******************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/getNodeForCharacterOffset.js ***!
  \*******************************************************************************************/
128,

/***/ 1942:
/*!*****************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/~/fbjs/lib/getActiveElement.js ***!
  \*****************************************************************************************/
129,

/***/ 1943:
/*!***********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/SelectEventPlugin.js ***!
  \***********************************************************************************/
[2585, 1843, 1886, 1822, 1939, 1890, 1942, 1895, 1892, 1930],

/***/ 1944:
/*!**************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ServerReactRootIndex.js ***!
  \**************************************************************************************/
131,

/***/ 1945:
/*!***********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/SimpleEventPlugin.js ***!
  \***********************************************************************************/
[2586, 1843, 1932, 1886, 1841, 1946, 1890, 1947, 1948, 1899, 1951, 1952, 1900, 1953, 1828, 1949, 1826, 1892],

/***/ 1946:
/*!*****************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/SyntheticClipboardEvent.js ***!
  \*****************************************************************************************/
[2587, 1890],

/***/ 1947:
/*!*************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/SyntheticFocusEvent.js ***!
  \*************************************************************************************/
[2588, 1900],

/***/ 1948:
/*!****************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/SyntheticKeyboardEvent.js ***!
  \****************************************************************************************/
[2589, 1900, 1949, 1950, 1901],

/***/ 1949:
/*!**********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/getEventCharCode.js ***!
  \**********************************************************************************/
136,

/***/ 1950:
/*!*****************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/getEventKey.js ***!
  \*****************************************************************************/
[2590, 1949],

/***/ 1951:
/*!************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/SyntheticDragEvent.js ***!
  \************************************************************************************/
[2591, 1899],

/***/ 1952:
/*!*************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/SyntheticTouchEvent.js ***!
  \*************************************************************************************/
[2592, 1900, 1901],

/***/ 1953:
/*!*************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/SyntheticWheelEvent.js ***!
  \*************************************************************************************/
[2593, 1899],

/***/ 1954:
/*!**************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/SVGDOMPropertyConfig.js ***!
  \**************************************************************************************/
[2594, 1836],

/***/ 1955:
/*!**********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactDefaultPerf.js ***!
  \**********************************************************************************/
[2595, 1836, 1956, 1841, 1831, 1957],

/***/ 1956:
/*!******************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactDefaultPerfAnalysis.js ***!
  \******************************************************************************************/
[2596, 1852],

/***/ 1957:
/*!***************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/~/fbjs/lib/performanceNow.js ***!
  \***************************************************************************************/
[2597, 1958],

/***/ 1958:
/*!************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/~/fbjs/lib/performance.js ***!
  \************************************************************************************/
[2598, 1822],

/***/ 1959:
/*!******************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactVersion.js ***!
  \******************************************************************************/
146,

/***/ 1960:
/*!********************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/renderSubtreeIntoContainer.js ***!
  \********************************************************************************************/
[2599, 1841],

/***/ 1961:
/*!********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactDOMServer.js ***!
  \********************************************************************************/
[2600, 1884, 1962, 1959],

/***/ 1962:
/*!**************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactServerRendering.js ***!
  \**************************************************************************************/
[2601, 1905, 1855, 1858, 1861, 1963, 1964, 1867, 1871, 1875, 1826],

/***/ 1963:
/*!*********************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactServerBatchingStrategy.js ***!
  \*********************************************************************************************/
150,

/***/ 1964:
/*!*************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactServerRenderingTransaction.js ***!
  \*************************************************************************************************/
[2602, 1869, 1868, 1870, 1852, 1828],

/***/ 1965:
/*!*********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactIsomorphic.js ***!
  \*********************************************************************************/
[2603, 1923, 1936, 1935, 1966, 1855, 1967, 1920, 1959, 1852, 1969],

/***/ 1966:
/*!***********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactDOMFactories.js ***!
  \***********************************************************************************/
[2604, 1855, 1967, 1968],

/***/ 1967:
/*!***************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactElementValidator.js ***!
  \***************************************************************************************/
[2605, 1855, 1878, 1879, 1818, 1856, 1921, 1826, 1838],

/***/ 1968:
/*!**********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/~/fbjs/lib/mapObject.js ***!
  \**********************************************************************************/
155,

/***/ 1969:
/*!***************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/onlyChild.js ***!
  \***************************************************************************/
[2606, 1855, 1826],

/***/ 1970:
/*!****************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/deprecated.js ***!
  \****************************************************************************/
[2607, 1852, 1838],

/***/ 1971:
/*!***********************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react-dom/index.js ***!
  \***********************************************************************/
[2608, 1817],

/***/ 1972:
/*!*****************************************************************************!*\
  !*** ./expression-atlas-differential-expression/src/DifferentialRouter.jsx ***!
  \*****************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var React = __webpack_require__(/*! react */ 1815);
	
	var $ = __webpack_require__(/*! jquery */ 1973);
	$.ajaxSetup({ traditional: true });
	
	var Url = __webpack_require__(/*! url */ 1806);
	
	//*------------------------------------------------------------------*
	
	var Results = __webpack_require__(/*! ./DifferentialResults.jsx */ 1975);
	var Facets = __webpack_require__(/*! ./DifferentialFacetsTree.jsx */ 2093);
	var UrlManager = __webpack_require__(/*! ./urlManager.js */ 2096);
	
	//*------------------------------------------------------------------*
	
	/*
	 TODO if Solr queries get fast enough that we can:
	 - split the two requests, so that the facets load first, initial results load second
	 - a request to the server is done for every interaction with the facets tree
	*/
	
	var RequiredString = React.PropTypes.string.isRequired;
	
	var DifferentialRouter = React.createClass({
	    displayName: 'DifferentialRouter',
	
	    propTypes: {
	        hostUrl: RequiredString,
	        geneQuery: RequiredString,
	        conditionQuery: RequiredString,
	        species: RequiredString
	    },
	
	    getInitialState: function getInitialState() {
	        return {
	            facetsTreeData: [],
	            results: [],
	            legend: {
	                maxDownLevel: 0,
	                minDownLevel: 0,
	                minUpLevel: 0,
	                maxUpLevel: 0
	            },
	            querySelect: {}
	        };
	    },
	    componentDidMount: function componentDidMount() {
	        var _this = this;
	
	        this._loadInitialData();
	        // TODO Consider using https://github.com/reactjs/react-router
	        window.addEventListener('popstate', function () {
	            _this.setState({ querySelect: UrlManager.parseDifferentialUrlParameter() });
	        }, false);
	    },
	    _addElementToObjectOfArrays: function _addElementToObjectOfArrays(obj, arrayName, element) {
	        if (!obj[arrayName]) {
	            obj[arrayName] = [];
	        }
	        obj[arrayName].push(element);
	    },
	    _removeElementFromObjectOfArrays: function _removeElementFromObjectOfArrays(obj, arrayName, element) {
	        delete obj[arrayName].splice(obj[arrayName].indexOf(element), 1);
	        if (obj[arrayName].length === 0) {
	            delete obj[arrayName];
	        }
	    },
	    _setChecked: function _setChecked(facetName, facetItemName, checked) {
	        // Update URL
	        var newQuerySelect = JSON.parse(JSON.stringify(this.state.querySelect));
	        if (checked) {
	            this._addElementToObjectOfArrays(newQuerySelect, facetName, facetItemName);
	        } else {
	            this._removeElementFromObjectOfArrays(newQuerySelect, facetName, facetItemName);
	        }
	
	        // TODO Consider using https://github.com/reactjs/react-router
	        UrlManager.differentialPush(newQuerySelect, false);
	        this.setState({
	            querySelect: newQuerySelect
	        });
	    },
	    _filteredResults: function _filteredResults() {
	        var _this2 = this;
	
	        var query = arguments.length <= 0 || arguments[0] === undefined ? this.state.querySelect : arguments[0];
	
	        return this.state.results.filter(function (result) {
	            return _this2._resultMatchesQuery(result, query);
	        });
	    },
	    _resultMatchesQuery: function _resultMatchesQuery(result, query) {
	        var _this3 = this;
	
	        if (Object.keys(query).length === 0) {
	            return false;
	        } else {
	            return Object.keys(query).every(function (facetName) {
	                return query[facetName].some(function (facetItem) {
	                    return _this3._equalsToOrIncludes(result[facetName], facetItem);
	                });
	            });
	        }
	    },
	    _equalsToOrIncludes: function _equalsToOrIncludes(obj, value) {
	        if (!!obj) {
	            if (obj.constructor === Array) {
	                return obj.includes(value);
	            } else {
	                return obj === value;
	            }
	        } else {
	            return false;
	        }
	    },
	
	
	    // Syncs tree data with URL (querySelect) and does some other smart things such as check/uncheck or disable facets based on
	    // the user results (e.g. check & disable a facet if it’s shared by all results as a side effect of other choice)
	    _prepareFacetTreeData: function _prepareFacetTreeData(filteredResults) {
	        var _this4 = this;
	
	        return this.state.facetsTreeData.map(function (facet) {
	            return {
	                facetName: facet.facetName,
	                facetItems: facet.facetItems.map(function (facetItem) {
	
	                    var allFilteredResultsMatchThisFacetItem = filteredResults.every(function (result) {
	                        return _this4._equalsToOrIncludes(result[facet.facetName], facetItem.name);
	                    });
	
	                    var querySelectAfterSwitchingThisFacetItem = JSON.parse(JSON.stringify(_this4.state.querySelect));
	                    if (_this4._equalsToOrIncludes(querySelectAfterSwitchingThisFacetItem[facet.facetName], facetItem.name)) {
	                        _this4._removeElementFromObjectOfArrays(querySelectAfterSwitchingThisFacetItem, facet.facetName, facetItem.name);
	                    } else {
	                        _this4._addElementToObjectOfArrays(querySelectAfterSwitchingThisFacetItem, facet.facetName, facetItem.name);
	                    }
	                    var resultIdsAfterSwitchingThisFacetItem = _this4._filteredResults(querySelectAfterSwitchingThisFacetItem).map(function (result) {
	                        return result.id;
	                    }).sort();
	                    var currentResultIds = filteredResults.map(function (result) {
	                        return result.id;
	                    }).sort();
	
	                    var sameResultsAfterSwitchingThisItem = JSON.stringify(resultIdsAfterSwitchingThisFacetItem) === JSON.stringify(currentResultIds);
	                    var noResultsAfterSwitchingThisItem = resultIdsAfterSwitchingThisFacetItem.length === 0;
	
	                    return {
	                        name: facetItem.name,
	                        value: facetItem.value,
	                        checked: _this4._equalsToOrIncludes(_this4.state.querySelect[facet.facetName], facetItem.name) || sameResultsAfterSwitchingThisItem && allFilteredResultsMatchThisFacetItem,
	                        disabled: noResultsAfterSwitchingThisItem || sameResultsAfterSwitchingThisItem
	                    };
	                })
	            };
	        });
	    },
	    render: function render() {
	        var filteredResults = this._filteredResults();
	
	        return React.createElement(
	            'div',
	            null,
	            React.createElement(
	                'div',
	                { className: 'grid_6 alpha', id: 'gxaDifferentialFacetsContainerDiv' },
	                Object.keys(this.state.facetsTreeData).length ? React.createElement(Facets, {
	                    facets: this._prepareFacetTreeData(filteredResults),
	                    setChecked: this._setChecked
	                }) : React.createElement('div', null)
	            ),
	            React.createElement(
	                'div',
	                { className: 'grid_18 omega', id: 'gxaDifferentialResultsContainerDiv' },
	                this.state.results && this.state.results.length ? React.createElement(Results, _extends({
	                    results: filteredResults,
	                    hostUrl: this.props.hostUrl
	                }, this.state.legend)) : React.createElement(
	                    'div',
	                    { ref: 'loadingImagePlaceholder' },
	                    React.createElement('img', { src: this.props.hostUrl + "/gxa/resources/images/loading.gif" })
	                )
	            )
	        );
	    },
	    _loadInitialData: function _loadInitialData() {
	        var _this5 = this;
	
	        var differentialFacetsUrlObject = Url.parse(this.props.hostUrl),
	            differentialResultsUrlObject = Url.parse(this.props.hostUrl);
	
	        differentialFacetsUrlObject.pathname = 'gxa/json/query/differentialFacets';
	        differentialResultsUrlObject.pathname = 'gxa/json/query/differentialResults';
	
	        var queryParams = { geneQuery: this.props.geneQuery, conditionQuery: this.props.conditionQuery, organism: this.props.species };
	        differentialFacetsUrlObject.query = queryParams;
	        differentialResultsUrlObject.query = queryParams;
	
	        var onAjaxFailure = function onAjaxFailure(jqXHR, textStatus, errorThrown) {
	            console.log("ERROR");
	            console.log("Status: " + textStatus);
	            console.log("Error thrown: " + errorThrown);
	        };
	
	        $.ajax({
	            url: Url.format(differentialFacetsUrlObject),
	            dataType: "json",
	            success: function success(facetsResponse) {
	                $.ajax({
	                    url: Url.format(differentialResultsUrlObject),
	                    dataType: "json",
	                    success: function success(resultsResponse) {
	
	                        // TODO Consider using https://github.com/reactjs/react-router
	                        var querySelect = UrlManager.parseDifferentialUrlParameter();
	                        if (!querySelect.kingdom) {
	                            querySelect.kingdom = facetsResponse.kingdom.map(function (facetItem) {
	                                return facetItem.name;
	                            });
	                        }
	                        UrlManager.differentialPush(querySelect, true);
	
	                        var facetsTreeData = _this5._transformFacetsResponseToArray(facetsResponse);
	
	                        _this5.setState({
	                            facetsTreeData: _this5._pruneFacetsTreeBasedOnResultsThatCameIn(facetsTreeData, resultsResponse.results),
	                            querySelect: querySelect,
	                            results: resultsResponse.results,
	                            legend: {
	                                minDownLevel: resultsResponse.minDownLevel,
	                                minUpLevel: resultsResponse.minUpLevel,
	                                maxDownLevel: resultsResponse.maxDownLevel,
	                                maxUpLevel: resultsResponse.maxUpLevel
	                            }
	                        });
	                    },
	                    error: onAjaxFailure
	                });
	            },
	            error: onAjaxFailure
	        });
	    },
	    _transformFacetsResponseToArray: function _transformFacetsResponseToArray(facetsResponse) {
	        return Object.keys(facetsResponse).map(function (facetName) {
	            return {
	                facetName: facetName,
	                facetItems: facetsResponse[facetName].map(function (facetItem) {
	                    return {
	                        name: facetItem.name,
	                        value: facetItem.value,
	                        disabled: false,
	                        checked: false
	                    };
	                })
	            };
	        });
	    },
	    _pruneFacetsTreeBasedOnResultsThatCameIn: function _pruneFacetsTreeBasedOnResultsThatCameIn(facetsTreeData, results) {
	        return facetsTreeData.map(function (facet) {
	            return {
	                facetName: facet.facetName,
	                facetItems: facet.facetItems.filter(function (facetItem) {
	                    return results.some(function (result) {
	                        if (result[facet.facetName].constructor === Array) {
	                            return result[facet.facetName].indexOf(facetItem.name) > -1;
	                        } else {
	                            return result[facet.facetName] === facetItem.name;
	                        }
	                    });
	                })
	            };
	        }).filter(function (facet) {
	            return facet.facetItems.length > 0;
	        });
	    }
	});
	
	//*------------------------------------------------------------------*
	
	module.exports = DifferentialRouter;

/***/ },

/***/ 1973:
/*!**************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/jquery/dist/jquery.js ***!
  \**************************************************************************/
[2821, 1974],

/***/ 1974:
/*!***********************************!*\
  !*** (webpack)/buildin/module.js ***!
  \***********************************/
628,

/***/ 1975:
/*!******************************************************************************!*\
  !*** ./expression-atlas-differential-expression/src/DifferentialResults.jsx ***!
  \******************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var $ = __webpack_require__(/*! jquery */ 1973);
	__webpack_require__(/*! jquery.browser */ 1976);
	
	var React = __webpack_require__(/*! react */ 1815);
	var ReactDOM = __webpack_require__(/*! react-dom */ 1971);
	
	//*------------------------------------------------------------------*
	
	var DisplayLevelsButton = __webpack_require__(/*! display-levels-button */ 1977);
	var Legend = __webpack_require__(/*! legend */ 1980).LegendDifferential;
	var CellDifferential = __webpack_require__(/*! cell-differential */ 1996);
	var DifferentialDownloadButton = __webpack_require__(/*! ./DifferentialDownloadButton.jsx */ 2005);
	var ContrastTooltips = __webpack_require__(/*! contrast-tooltips */ 2008);
	var AtlasFeedback = __webpack_require__(/*! atlas-feedback */ 2013);
	var EbiSpeciesIcon = __webpack_require__(/*! react-ebi-species */ 2085).Icon;
	
	//*------------------------------------------------------------------*
	
	__webpack_require__(/*! ./DifferentialResults.css */ 2091);
	
	//*------------------------------------------------------------------*
	
	var RequiredString = React.PropTypes.string.isRequired;
	var OptionalString = React.PropTypes.string;
	var RequiredBool = React.PropTypes.bool.isRequired;
	
	var DifferentialResults = React.createClass({
	    displayName: 'DifferentialResults',
	
	    /*
	    results: [
	     {
	       "bioentityIdentifier":"ENSMUSG00000072476",
	       "species":"mus musculus",
	       "kingdom":"animals",
	       "experimentAccession":"E-MTAB-698",
	       "experimentType":"rnaseq_mrna_differential",
	       "contrastId":"g1_g2",
	       "numReplicates":"3",
	       "foldChange":"2.4",
	       "regulation":"DOWN"
	       "colour": some_hex_value
	     },
	     {
	       "bioentityIdentifier":"ENSMUSG00000071341",
	       "species":"mus musculus",
	       "kingdom":"animals",
	       "experimentAccession":"E-MTAB-698",
	       "experimentType":"rnaseq_mrna_differential",
	       "contrastId":"g1_g2",
	       "numReplicates":"3",
	       "foldChange":"-∞",
	       "regulation":"DOWN",
	       "colour": some_hex_value
	      }
	    ],
	    maxDownLevel: "-∞" ,
	    minDownLevel: "0",
	    minUpLevel: "0",
	    maxUpLevel: "2.4"
	    */
	    propTypes: {
	        results: React.PropTypes.arrayOf(React.PropTypes.shape({
	            species: RequiredString,
	            kingdom: RequiredString,
	            experimentType: RequiredString,
	            numReplicates: RequiredString, // faceting only works with strings https://issues.apache.org/jira/browse/SOLR-7496
	            regulation: RequiredString,
	            factors: React.PropTypes.arrayOf(OptionalString).isRequired,
	            bioentityIdentifier: RequiredString,
	            experimentAccession: RequiredString,
	            experimentName: RequiredString,
	            contrastId: RequiredString,
	            comparison: RequiredString,
	            foldChange: RequiredString, // a string, a formatted value, to be able to work with Infinity values and rounding
	            colour: RequiredString,
	            id: RequiredString
	        })).isRequired,
	        maxDownLevel: RequiredString,
	        minDownLevel: RequiredString,
	        minUpLevel: RequiredString,
	        maxUpLevel: RequiredString,
	        hostUrl: RequiredString
	    },
	
	    getInitialState: function getInitialState() {
	        return {
	            displayLevels: false,
	            googleAnalyticsCallback: typeof ga !== 'undefined' ? ga : function () {}
	        };
	    },
	    _toggleDisplayLevels: function _toggleDisplayLevels() {
	        var newDisplayLevels = !this.state.displayLevels;
	        this.setState({ displayLevels: newDisplayLevels });
	    },
	    render: function render() {
	        var _this = this;
	
	        var differentialResultRows = this.props.results.map(function (diffResult) {
	            return React.createElement(DifferentialResultRow, _extends({
	                key: diffResult.id,
	                displayLevels: _this.state.displayLevels,
	                atlasBaseUrl: _this.props.hostUrl + '/gxa'
	            }, diffResult));
	        });
	
	        var feedbackSmileys = $.browser.msie ? null : React.createElement(
	            'div',
	            { style: { marginTop: '50px' } },
	            React.createElement(AtlasFeedback, {
	                collectionCallback: function collectionCallback(score, comment) {
	                    _this.state.googleAnalyticsCallback('send', 'event', 'DifferentialHeatmaps', 'feedback', comment, score);
	                } })
	        );
	
	        return React.createElement(
	            'div',
	            null,
	            React.createElement(
	                'div',
	                { style: { display: 'inline-block', verticalAlign: 'middle' } },
	                React.createElement(DisplayLevelsButton, { hideText: 'Hide log<sub>2</sub>-fold change', showText: 'Display log<sub>2</sub>-fold change', onClickCallback: this._toggleDisplayLevels, displayLevels: this.state.displayLevels, fontSize: '14px', width: '200px' })
	            ),
	            React.createElement(
	                'div',
	                { style: { display: 'inline-block', verticalAlign: 'middle' } },
	                React.createElement(Legend, {
	                    atlasBaseURL: this.props.hostUrl + '/gxa', minDownLevel: this.props.minDownLevel, maxDownLevel: this.props.maxDownLevel, minUpLevel: this.props.minUpLevel, maxUpLevel: this.props.maxUpLevel
	                })
	            ),
	            React.createElement(
	                'div',
	                { style: { display: 'inline-block', paddingLeft: '10px', verticalAlign: 'top' } },
	                React.createElement(DifferentialDownloadButton, { ref: 'downloadProfilesButton',
	                    hostUrl: this.props.hostUrl,
	                    results: this.props.results
	                })
	            ),
	            React.createElement(
	                'table',
	                { className: 'table-striped gxaDifferentialFacetedSearchResults' },
	                React.createElement(
	                    'thead',
	                    null,
	                    React.createElement(
	                        'tr',
	                        null,
	                        React.createElement(
	                            'th',
	                            { style: { width: '10%' } },
	                            'Log',
	                            React.createElement(
	                                'sub',
	                                null,
	                                '2'
	                            ),
	                            '-fold change'
	                        ),
	                        React.createElement(
	                            'th',
	                            { style: { width: '5%' } },
	                            'Species'
	                        ),
	                        React.createElement(
	                            'th',
	                            { style: { width: '30%' } },
	                            'Comparison'
	                        ),
	                        React.createElement(
	                            'th',
	                            { style: { width: '15%' } },
	                            'Experimental variables'
	                        ),
	                        React.createElement(
	                            'th',
	                            { style: { width: '40%' } },
	                            'Experiment name'
	                        )
	                    )
	                ),
	                React.createElement(
	                    'tbody',
	                    null,
	                    differentialResultRows
	                )
	            ),
	            feedbackSmileys
	        );
	    }
	});
	
	var DifferentialResultRow = React.createClass({
	    displayName: 'DifferentialResultRow',
	
	    propTypes: {
	        bioentityIdentifier: RequiredString,
	        foldChange: RequiredString,
	        colour: RequiredString,
	        species: RequiredString,
	        comparison: RequiredString,
	        factors: React.PropTypes.arrayOf(OptionalString).isRequired,
	        experimentName: RequiredString,
	        contrastId: RequiredString,
	        experimentAccession: RequiredString,
	        displayLevels: RequiredBool,
	        atlasBaseUrl: RequiredString
	    },
	
	    _linkToComparisonPage: function _linkToComparisonPage() {
	        return 'experiments/' + this.props.experimentAccession + '?geneQuery=' + this.props.bioentityIdentifier + '&queryFactorValues=' + this.props.contrastId + '&specific=false';
	    },
	    render: function render() {
	        var factors = this.props.factors ? this.props.factors.toString().replace(/,/g, ', ') : '';
	
	        return React.createElement(
	            'tr',
	            null,
	            React.createElement(CellDifferential, {
	                colour: this.props.colour,
	                infinity: this.props.infinity,
	                foldChange: this.props.foldChange,
	                displayLevels: this.props.displayLevels }),
	            React.createElement(
	                'td',
	                { className: 'col_species' },
	                React.createElement(EbiSpeciesIcon, { species: this.props.species })
	            ),
	            React.createElement(
	                'td',
	                { ref: 'comparison' },
	                React.createElement(
	                    'a',
	                    { href: this._linkToComparisonPage() },
	                    this.props.comparison
	                )
	            ),
	            React.createElement(
	                'td',
	                { className: 'gxaExperimentalVariable' },
	                factors
	            ),
	            React.createElement(
	                'td',
	                null,
	                React.createElement(
	                    'a',
	                    { href: 'experiments/' + this.props.experimentAccession },
	                    this.props.experimentName
	                )
	            )
	        );
	    },
	    componentDidMount: function componentDidMount() {
	        var _this2 = this;
	
	        ContrastTooltips(this.props.atlasBaseUrl, '', ReactDOM.findDOMNode(this.refs.comparison), this.props.experimentAccession, this.props.contrastId);
	        $(document).ready(function () {
	            _this2.setState({ googleAnalyticsCallback: typeof ga !== 'undefined' ? ga : function () {} });
	        });
	    }
	});
	
	//*------------------------------------------------------------------*
	
	module.exports = DifferentialResults;

/***/ },

/***/ 1976:
/*!******************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/jquery.browser/dist/jquery.browser.js ***!
  \******************************************************************************************/
[2823, 1973],

/***/ 1977:
/*!***********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/display-levels-button/index.js ***!
  \***********************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	//*------------------------------------------------------------------*
	
	module.exports = __webpack_require__(/*! ./src/DisplayLevelsButton.jsx */ 1978);

/***/ },

/***/ 1978:
/*!******************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/display-levels-button/src/DisplayLevelsButton.jsx ***!
  \******************************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	//*------------------------------------------------------------------*
	
	var React = __webpack_require__(/*! react */ 1815);
	var ReactDOM = __webpack_require__(/*! react-dom */ 1971);
	
	var $ = __webpack_require__(/*! jquery */ 1973);
	__webpack_require__(/*! jquery-ui-bundle */ 1979);
	
	//*------------------------------------------------------------------*
	
	
	//*------------------------------------------------------------------*
	
	var DisplayLevelsButton = React.createClass({
	    displayName: 'DisplayLevelsButton',
	
	
	    propTypes: {
	        hideText: React.PropTypes.string.isRequired,
	        showText: React.PropTypes.string.isRequired,
	        onClickCallback: React.PropTypes.func.isRequired,
	        displayLevels: React.PropTypes.bool.isRequired,
	        width: React.PropTypes.string,
	        fontSize: React.PropTypes.string
	    },
	
	    _buttonText: function _buttonText() {
	        return this.props.displayLevels ? this.props.hideText : this.props.showText;
	    },
	
	    _updateButtonText: function _updateButtonText() {
	        $(ReactDOM.findDOMNode(this)).button({ label: this._buttonText() });
	    },
	
	    render: function render() {
	        var style = {};
	        if (this.props.width) {
	            style.width = this.props.width;
	        }
	        if (this.props.fontSize) {
	            style.fontSize = this.props.fontSize;
	        }
	
	        return React.createElement('button', { style: style, onClick: this.props.onClickCallback });
	    },
	
	    componentDidMount: function componentDidMount() {
	        this._updateButtonText();
	    },
	
	    componentDidUpdate: function componentDidUpdate() {
	        this._updateButtonText();
	    }
	
	});
	
	//*------------------------------------------------------------------*
	
	module.exports = DisplayLevelsButton;

/***/ },

/***/ 1979:
/*!**********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/jquery-ui-bundle/jquery-ui.js ***!
  \**********************************************************************************/
[2822, 1973],

/***/ 1980:
/*!********************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/legend/index.js ***!
  \********************************************************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	//*------------------------------------------------------------------*
	
	exports.LegendDifferential = __webpack_require__(/*! ./src/LegendDifferential.jsx */ 1981);
	exports.LegendBaseline = __webpack_require__(/*! ./src/LegendBaseline.jsx */ 1993);

/***/ },

/***/ 1981:
/*!**************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/legend/src/LegendDifferential.jsx ***!
  \**************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	//*------------------------------------------------------------------*
	
	var React = __webpack_require__(/*! react */ 1815);
	var ReactDOM = __webpack_require__(/*! react-dom */ 1971);
	
	//*------------------------------------------------------------------*
	
	var LegendRow = __webpack_require__(/*! ./LegendRow.jsx */ 1982);
	var HelpTooltips = __webpack_require__(/*! help-tooltips */ 1987);
	
	//*------------------------------------------------------------------*
	
	__webpack_require__(/*! ./gxaLegend.css */ 1991);
	
	//*------------------------------------------------------------------*
	
	var LegendDifferential = React.createClass({
	    displayName: 'LegendDifferential',
	
	
	    propTypes: {
	        atlasBaseURL: React.PropTypes.string.isRequired,
	        minDownLevel: React.PropTypes.string.isRequired,
	        maxDownLevel: React.PropTypes.string.isRequired,
	        minUpLevel: React.PropTypes.string.isRequired,
	        maxUpLevel: React.PropTypes.string.isRequired
	    },
	
	    render: function render() {
	        return React.createElement(
	            'div',
	            { className: 'gxaLegend' },
	            React.createElement(
	                'div',
	                { style: { display: "inline-table" } },
	                isNaN(this.props.minDownLevel) && isNaN(this.props.maxDownLevel) ? null : React.createElement(LegendRow, { lowExpressionLevel: this.props.minDownLevel,
	                    highExpressionLevel: this.props.maxDownLevel,
	                    lowValueColour: '#C0C0C0',
	                    highValueColour: '#0000FF' }),
	                isNaN(this.props.minUpLevel) && isNaN(this.props.maxUpLevel) ? null : React.createElement(LegendRow, { lowExpressionLevel: this.props.minUpLevel,
	                    highExpressionLevel: this.props.maxUpLevel,
	                    lowValueColour: '#FFAFAF',
	                    highValueColour: '#FF0000' })
	            ),
	            React.createElement('div', { ref: 'legendHelp', 'data-help-loc': '#gradient-differential', className: 'gxaLegendHelp' })
	        );
	    },
	
	    componentDidMount: function componentDidMount() {
	        HelpTooltips(this.props.atlasBaseURL, "experiment", ReactDOM.findDOMNode(this.refs.legendHelp));
	    }
	});
	
	//*------------------------------------------------------------------*
	
	module.exports = LegendDifferential;

/***/ },

/***/ 1982:
/*!*****************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/legend/src/LegendRow.jsx ***!
  \*****************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	//*------------------------------------------------------------------*
	
	var React = __webpack_require__(/*! react */ 1815);
	
	//*------------------------------------------------------------------*
	
	__webpack_require__(/*! ./gxaGradient.css */ 1983);
	
	//*------------------------------------------------------------------*
	
	var LegendRow = React.createClass({
	    displayName: 'LegendRow',
	
	
	    propTypes: {
	        lowValueColour: React.PropTypes.string.isRequired,
	        highValueColour: React.PropTypes.string.isRequired,
	        lowExpressionLevel: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]).isRequired, // Baseline legend rows can be a React <span> element returned by NumberFormat
	        highExpressionLevel: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]).isRequired
	    },
	
	    render: function render() {
	        var BACKGROUND_IMAGE_TEMPLATE = "-webkit-gradient(linear, left top, right top,color-stop(0, ${lowValueColour}), color-stop(1, ${highValueColour}));background-image: -moz-linear-gradient(left, ${lowValueColour}, ${highValueColour});background-image: -ms-linear-gradient(left, ${lowValueColour}, ${highValueColour}); background-image: -o-linear-gradient(left, ${lowValueColour}, ${highValueColour})";
	        var backgroundImage = BACKGROUND_IMAGE_TEMPLATE.replace(/\${lowValueColour}/g, this.props.lowValueColour).replace(/\${highValueColour}/g, this.props.highValueColour);
	
	        // for IE9
	        var LT_IE10_FILTER_TEMPLATE = "progid:DXImageTransform.Microsoft.Gradient(GradientType =1,startColorstr=${lowValueColour},endColorstr=${highValueColour})";
	        var lt_ie10_filter = LT_IE10_FILTER_TEMPLATE.replace(/\${lowValueColour}/, this.props.lowValueColour).replace(/\${highValueColour}/, this.props.highValueColour);
	
	        return React.createElement(
	            'div',
	            { style: { display: "table-row" } },
	            React.createElement(
	                'div',
	                { className: 'gxaGradientLevel gxaGradientLevelMin' },
	                this.props.lowExpressionLevel
	            ),
	            React.createElement(
	                'div',
	                { style: { display: "table-cell" } },
	                React.createElement('span', { className: 'gxaGradientColour', style: { backgroundImage: backgroundImage, filter: lt_ie10_filter } })
	            ),
	            React.createElement(
	                'div',
	                { className: 'gxaGradientLevel gxaGradientLevelMax' },
	                this.props.highExpressionLevel
	            )
	        );
	    }
	});
	
	//*------------------------------------------------------------------*
	
	module.exports = LegendRow;

/***/ },

/***/ 1983:
/*!*******************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/legend/src/gxaGradient.css ***!
  \*******************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(/*! !./../../css-loader!./gxaGradient.css */ 1984);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(/*! ./../../style-loader/addStyles.js */ 1986)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../css-loader/index.js!./gxaGradient.css", function() {
				var newContent = require("!!./../../css-loader/index.js!./gxaGradient.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 1984:
/*!***************************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/css-loader!./expression-atlas-differential-expression/~/legend/src/gxaGradient.css ***!
  \***************************************************************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(/*! ./../../css-loader/lib/css-base.js */ 1985)();
	// imports
	
	
	// module
	exports.push([module.id, ".gxaGradientColour {\n    overflow: auto;\n    vertical-align: middle;\n    width: 200px;\n    height: 15px;\n    margin: 2px 6px 2px 6px;\n    display: inline-block;\n}\n\n.gxaGradientLevel {\n    white-space: nowrap;\n    font-size: 10px;\n    vertical-align: middle;\n    display: table-cell;\n}\n\n.gxaGradientLevelMin {\n    text-align: right;\n}\n\n.gxaGradientLevelMax {\n    text-align: left;\n}", ""]);
	
	// exports


/***/ },

/***/ 1985:
/*!*******************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/css-loader/lib/css-base.js ***!
  \*******************************************************************************/
578,

/***/ 1986:
/*!******************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/style-loader/addStyles.js ***!
  \******************************************************************************/
579,

/***/ 1987:
/*!************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/legend/~/help-tooltips/index.js ***!
  \************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	//*------------------------------------------------------------------*
	
	module.exports = __webpack_require__(/*! ./src/helpTooltipsModule.js */ 1988);

/***/ },

/***/ 1988:
/*!*****************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/legend/~/help-tooltips/src/helpTooltipsModule.js ***!
  \*****************************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	//*------------------------------------------------------------------*
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };
	
	var $ = __webpack_require__(/*! jquery */ 1973);
	__webpack_require__(/*! jquery-ui-bundle */ 1979);
	
	//*------------------------------------------------------------------*
	
	__webpack_require__(/*! ./gxaHelpTooltip.css */ 1989);
	
	//*------------------------------------------------------------------*
	
	function buildHelpAnchor() {
	    return $("<a/>", {
	        class: "help-icon",
	        href: "#",
	        title: "",
	        text: "?"
	    });
	}
	
	function getHelpFileName(pageName) {
	    return "help-tooltips." + pageName + "-page.html";
	}
	
	function initTooltips(atlasBaseURL, pageName, parentElementId) {
	
	    var anchor = buildHelpAnchor();
	
	    var helpSelector = (typeof parentElementId === 'undefined' ? 'undefined' : _typeof(parentElementId)) === "object" ? parentElementId : parentElementId == "" ? "[data-help-loc]" : "#" + parentElementId + " [data-help-loc]";
	
	    $(helpSelector).append(anchor).click(function (e) {
	        e.preventDefault();
	    }).tooltip({
	        tooltipClass: "gxaHelpTooltip",
	        content: function content(callback) {
	            var tooltipHelpHtmlId = $(this).parent().attr("data-help-loc");
	
	            $.get(atlasBaseURL + "/resources/html/" + getHelpFileName(pageName), function (response, status, xhr) {
	                var tooltipContent;
	
	                if (status === "error") {
	                    tooltipContent = "Sorry but there was an error: " + xhr.status + " " + xhr.statusText;
	                    callback(tooltipContent);
	                    return;
	                }
	
	                tooltipContent = $(response).filter(tooltipHelpHtmlId).text();
	                if (!tooltipContent) {
	                    tooltipContent = "Missing help section for id = " + tooltipHelpHtmlId + " in html file " + getHelpFileName(pageName);
	                }
	
	                callback(tooltipContent);
	            });
	        }
	    });
	}
	
	//*------------------------------------------------------------------*
	
	module.exports = function (atlasBaseURL, pageName, parentElementId) {
	    initTooltips(atlasBaseURL, pageName, parentElementId);
	};

/***/ },

/***/ 1989:
/*!**************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/legend/~/help-tooltips/src/gxaHelpTooltip.css ***!
  \**************************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(/*! !./../../../../css-loader!./gxaHelpTooltip.css */ 1990);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(/*! ./../../../../style-loader/addStyles.js */ 1986)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../../css-loader/index.js!./gxaHelpTooltip.css", function() {
				var newContent = require("!!./../../../../css-loader/index.js!./gxaHelpTooltip.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 1990:
/*!**********************************************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/css-loader!./expression-atlas-differential-expression/~/legend/~/help-tooltips/src/gxaHelpTooltip.css ***!
  \**********************************************************************************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(/*! ./../../../../css-loader/lib/css-base.js */ 1985)();
	// imports
	
	
	// module
	exports.push([module.id, ".gxaHelpTooltip {\n    background: white;\n    border-width: 1px !important;\n    border: solid cornflowerblue;\n    padding: 4px;\n    color: cornflowerblue;\n    font: 10px Verdana, Helvetica, Arial, sans-serif;\n}\n\na.help-icon {\n    color: darkorange;\n    vertical-align: top;\n    font: 10px Verdana, Helvetica, Arial, sans-serif;\n    font-weight: bold;\n}\n", ""]);
	
	// exports


/***/ },

/***/ 1991:
/*!*****************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/legend/src/gxaLegend.css ***!
  \*****************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(/*! !./../../css-loader!./gxaLegend.css */ 1992);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(/*! ./../../style-loader/addStyles.js */ 1986)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../css-loader/index.js!./gxaLegend.css", function() {
				var newContent = require("!!./../../css-loader/index.js!./gxaLegend.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 1992:
/*!*************************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/css-loader!./expression-atlas-differential-expression/~/legend/src/gxaLegend.css ***!
  \*************************************************************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(/*! ./../../css-loader/lib/css-base.js */ 1985)();
	// imports
	
	
	// module
	exports.push([module.id, ".gxaLegendHelp {\n    display: inline-block;\n    vertical-align: top;\n    padding-left: 2px;\n}\n\n.gxaLegend {\n    display: inline-block;\n    padding-left: 20px;\n}\n", ""]);
	
	// exports


/***/ },

/***/ 1993:
/*!**********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/legend/src/LegendBaseline.jsx ***!
  \**********************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	//*------------------------------------------------------------------*
	
	var React = __webpack_require__(/*! react */ 1815);
	var ReactDOM = __webpack_require__(/*! react-dom */ 1971);
	
	//*------------------------------------------------------------------*
	
	var LegendRow = __webpack_require__(/*! ./LegendRow.jsx */ 1982);
	var NumberFormat = __webpack_require__(/*! number-format */ 1994);
	var HelpTooltips = __webpack_require__(/*! help-tooltips */ 1987);
	
	//*------------------------------------------------------------------*
	
	__webpack_require__(/*! ./gxaLegend.css */ 1991);
	
	//*------------------------------------------------------------------*
	
	var LegendBaseline = React.createClass({
	    displayName: 'LegendBaseline',
	
	
	    propTypes: {
	        atlasBaseURL: React.PropTypes.string.isRequired,
	        minExpressionLevel: React.PropTypes.string.isRequired,
	        maxExpressionLevel: React.PropTypes.string.isRequired,
	        isMultiExperiment: React.PropTypes.bool.isRequired
	    },
	
	    render: function render() {
	        var dataHelpLoc = this.props.isMultiExperiment ? "#gradient-base-crossexp" : "#gradient-base";
	
	        // The class gxaHeatmapLegendGradient is used for Selenium tests but isn’t styled
	        return React.createElement(
	            'div',
	            { className: 'gxaHeatmapLegendGradient' },
	            React.createElement(
	                'div',
	                { style: { display: "inline-table" } },
	                React.createElement(LegendRow, { lowExpressionLevel: NumberFormat.baselineExpression(this.props.minExpressionLevel),
	                    highExpressionLevel: NumberFormat.baselineExpression(this.props.maxExpressionLevel),
	                    lowValueColour: '#C0C0C0',
	                    highValueColour: '#0000FF' })
	            ),
	            React.createElement('div', { ref: 'legendHelp', 'data-help-loc': dataHelpLoc, className: 'gxaLegendHelp' })
	        );
	    },
	
	    componentDidMount: function componentDidMount() {
	        HelpTooltips(this.props.atlasBaseURL, "experiment", ReactDOM.findDOMNode(this.refs.legendHelp));
	    }
	});
	
	//*------------------------------------------------------------------*
	
	module.exports = LegendBaseline;

/***/ },

/***/ 1994:
/*!************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/legend/~/number-format/index.js ***!
  \************************************************************************************/
[2492, 1995],

/***/ 1995:
/*!************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/legend/~/number-format/src/NumberFormat.jsx ***!
  \************************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var React = __webpack_require__(/*! react */ 1815); // React is called in the transpiled JS files in the return statements
	
	//*------------------------------------------------------------------*
	
	function formatBaselineExpression(expressionLevel) {
	    var numberExpressionLevel = +expressionLevel;
	    return numberExpressionLevel >= 100000 || numberExpressionLevel < 0.1 ? formatScientificNotation(numberExpressionLevel.toExponential(1).replace('+', '')) : '' + numberExpressionLevel;
	}
	
	// expects number in the format #E# and displays exponent in superscript
	function formatScientificNotation(scientificNotationString) {
	
	    var formatParts = scientificNotationString.split(/[Ee]/);
	
	    if (formatParts.length == 1) {
	        return React.createElement(
	            'span',
	            null,
	            scientificNotationString
	        );
	    }
	
	    var mantissa = formatParts[0];
	    var exponent = formatParts[1];
	
	    return React.createElement(
	        'span',
	        null,
	        mantissa !== "1" ? mantissa + ' × ' : '',
	        '10',
	        React.createElement(
	            'span',
	            { style: { 'verticalAlign': 'super' } },
	            exponent
	        )
	    );
	}
	
	//*------------------------------------------------------------------*
	
	exports.baselineExpression = formatBaselineExpression;
	exports.scientificNotation = formatScientificNotation;

/***/ },

/***/ 1996:
/*!*******************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/cell-differential/index.js ***!
  \*******************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	//*------------------------------------------------------------------*
	
	module.exports = __webpack_require__(/*! ./src/CellDifferential.jsx */ 1997);

/***/ },

/***/ 1997:
/*!***********************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/cell-differential/src/CellDifferential.jsx ***!
  \***********************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	//*------------------------------------------------------------------*
	
	var React = __webpack_require__(/*! react */ 1815);
	var ReactDOM = __webpack_require__(/*! react-dom */ 1971);
	var ReactDOMServer = __webpack_require__(/*! react-dom/server */ 1998);
	var $ = __webpack_require__(/*! jquery */ 1973);
	__webpack_require__(/*! jquery-ui-bundle */ 1979);
	
	//*------------------------------------------------------------------*
	
	var NumberFormat = __webpack_require__(/*! number-format */ 1999);
	
	//*------------------------------------------------------------------*
	
	__webpack_require__(/*! ./gxaShowHideCell.css */ 2001);
	__webpack_require__(/*! ./gxaDifferentialCellTooltip.css */ 2003);
	
	//*------------------------------------------------------------------*
	
	var CellDifferential = React.createClass({
	    displayName: 'CellDifferential',
	
	
	    propTypes: {
	        fontSize: React.PropTypes.number,
	        colour: React.PropTypes.string,
	        foldChange: React.PropTypes.number,
	        pValue: React.PropTypes.string,
	        tStat: React.PropTypes.string,
	        displayLevels: React.PropTypes.bool.isRequired
	    },
	
	    _hasValue: function _hasValue() {
	        return this.props.foldChange !== undefined;
	    },
	
	    _getStyle: function _getStyle() {
	        var style = {};
	        if (this.props.fontSize) {
	            style.fontSize = this.props.fontSize + "px";
	        }
	
	        return style;
	    },
	
	    render: function render() {
	        if (!this._hasValue()) {
	            return React.createElement('td', null);
	        }
	
	        return React.createElement(
	            'td',
	            { style: { backgroundColor: this.props.colour, verticalAlign: "middle" } },
	            React.createElement(
	                'div',
	                { style: this._getStyle(), className: this.props.displayLevels ? "gxaShowCell" : "gxaHideCell" },
	                this.props.foldChange
	            )
	        );
	    },
	
	    componentDidMount: function componentDidMount() {
	        if (this._hasValue()) {
	            this._initTooltip(ReactDOM.findDOMNode(this));
	        }
	    },
	
	    _initTooltip: function _initTooltip(element) {
	
	        //TODO - build this from a React component, like we do for FactorTooltip
	        function buildHeatmapCellTooltip(pValue, tStatistic, foldChange) {
	
	            return "<table>" + "<thead>" + (pValue !== undefined ? "<th>Adjusted <em>p</em>-value</th>" : "") + (tStatistic !== undefined ? "<th><em>t</em>-statistic</th>" : "") + "<th class='gxaHeaderCell'>Log<sub>2</sub>-fold change</th>" + "</thead>" + "<tbody>" + "<tr>" + (pValue !== undefined ? "<td>" + ReactDOMServer.renderToStaticMarkup(NumberFormat.scientificNotation(pValue)) + "</td>" : "") + (tStatistic !== undefined ? "<td>" + tStatistic + "</td>" : "") + "<td>" + foldChange + "</td>" + "</tr>" + "</tbody>" + "</table>";
	        }
	
	        // Don’t use bind, tooltip uses this internally
	        var thisProps = this.props;
	
	        $(element).attr("title", "").tooltip({
	            open: function open(event, ui) {
	                ui.tooltip.css("background", thisProps.colour);
	            },
	
	            tooltipClass: "gxaDifferentialCellTooltip",
	
	            content: function content() {
	                return buildHeatmapCellTooltip(thisProps.pValue, thisProps.tStat, thisProps.foldChange);
	            }
	        });
	    }
	});
	
	//*------------------------------------------------------------------*
	
	module.exports = CellDifferential;

/***/ },

/***/ 1998:
/*!************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react-dom/server.js ***!
  \************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	module.exports = __webpack_require__(/*! react/lib/ReactDOMServer */ 1961);

/***/ },

/***/ 1999:
/*!***********************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/cell-differential/~/number-format/index.js ***!
  \***********************************************************************************************/
[2492, 2000],

/***/ 2000:
/*!***********************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/cell-differential/~/number-format/src/NumberFormat.jsx ***!
  \***********************************************************************************************************/
1995,

/***/ 2001:
/*!**********************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/cell-differential/src/gxaShowHideCell.css ***!
  \**********************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(/*! !./../../css-loader!./gxaShowHideCell.css */ 2002);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(/*! ./../../style-loader/addStyles.js */ 1986)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../css-loader/index.js!./gxaShowHideCell.css", function() {
				var newContent = require("!!./../../css-loader/index.js!./gxaShowHideCell.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 2002:
/*!******************************************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/css-loader!./expression-atlas-differential-expression/~/cell-differential/src/gxaShowHideCell.css ***!
  \******************************************************************************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(/*! ./../../css-loader/lib/css-base.js */ 1985)();
	// imports
	
	
	// module
	exports.push([module.id, ".gxaShowCell {\n    background-color: white;\n    white-space: nowrap;\n    text-align: center;\n    margin: 4px;\n    padding: 2px;\n}\n\n.gxaHideCell {\n    display: none;\n    visibility: hidden;\n}\n", ""]);
	
	// exports


/***/ },

/***/ 2003:
/*!*********************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/cell-differential/src/gxaDifferentialCellTooltip.css ***!
  \*********************************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(/*! !./../../css-loader!./gxaDifferentialCellTooltip.css */ 2004);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(/*! ./../../style-loader/addStyles.js */ 1986)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../css-loader/index.js!./gxaDifferentialCellTooltip.css", function() {
				var newContent = require("!!./../../css-loader/index.js!./gxaDifferentialCellTooltip.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 2004:
/*!*****************************************************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/css-loader!./expression-atlas-differential-expression/~/cell-differential/src/gxaDifferentialCellTooltip.css ***!
  \*****************************************************************************************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(/*! ./../../css-loader/lib/css-base.js */ 1985)();
	// imports
	
	
	// module
	exports.push([module.id, ".gxaDifferentialCellTooltip {\n    border: solid transparent;\n    color: darkslategray;\n    padding: 2px;\n    font: 10px Verdana, Helvetica, Arial, sans-serif;\n}\n\n.gxaDifferentialCellTooltip table {\n    margin: 0; /* overrides ebi-visual.css:134 */\n    background-color: white;\n    border: 1px solid lightgrey;\n    border-collapse: collapse;\n}\n\n.gxaDifferentialCellTooltip th {\n    border-bottom: 1px solid lightgrey;\n    background-color: floralwhite;\n}\n\n.gxaDifferentialCellTooltip td, .gxaDifferentialCellTooltip th {\n    text-align: center;\n    white-space: nowrap;\n    vertical-align: middle;\n    padding: 8px;\n    width: 25px;\n}\n", ""]);
	
	// exports


/***/ },

/***/ 2005:
/*!*************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/src/DifferentialDownloadButton.jsx ***!
  \*************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };
	
	var $ = __webpack_require__(/*! jquery */ 1973);
	__webpack_require__(/*! jquery-ui-bundle */ 1979);
	
	var React = __webpack_require__(/*! react */ 1815);
	var ReactDOM = __webpack_require__(/*! react-dom */ 1971);
	
	//*------------------------------------------------------------------*
	
	__webpack_require__(/*! ./DifferentialDownloadButton.css */ 2006);
	
	//*------------------------------------------------------------------*
	
	
	var RequiredString = React.PropTypes.string.isRequired;
	var OptionalString = React.PropTypes.string;
	var RequiredNumber = React.PropTypes.number.isRequired;
	var OptionalNumber = React.PropTypes.number;
	
	var DownloadDifferentialButton = React.createClass({
	    displayName: 'DownloadDifferentialButton',
	
	
	    propTypes: {
	        hostUrl: RequiredString,
	        results: React.PropTypes.arrayOf(React.PropTypes.shape({
	            species: RequiredString,
	            kingdom: RequiredString,
	            experimentType: RequiredString,
	            numReplicates: RequiredString, // faceting only works with strings https://issues.apache.org/jira/browse/SOLR-7496
	            regulation: RequiredString,
	            factors: React.PropTypes.arrayOf(OptionalString).isRequired,
	            bioentityIdentifier: RequiredString,
	            experimentAccession: RequiredString,
	            experimentName: RequiredString,
	            contrastId: RequiredString,
	            comparison: RequiredString,
	            foldChange: RequiredString, // a string, a formatted value, to be able to work with Infinity values and rounding
	            pValue: RequiredNumber,
	            tStatistics: OptionalNumber,
	            colour: RequiredString,
	            id: RequiredString
	        })).isRequired
	    },
	
	    _convertJsonToTsv: function _convertJsonToTsv(results) {
	        var arrayResults = (typeof results === 'undefined' ? 'undefined' : _typeof(results)) !== 'object' ? JSON.parse(results) : results;
	
	        var headers = ['Gene', 'Organism', 'Experiment Accession', 'Comparison', 'log2foldchange', 'pValue'];
	        if (arrayResults.some(function (diffResults) {
	            return diffResults.tStatistics != null;
	        })) {
	            headers.push('tStatistics');
	        }
	
	        var tsv = headers.join('\t') + '\n';
	        tsv += arrayResults.map(function (diffResults) {
	            return [diffResults.bioentityIdentifier, diffResults.species, diffResults.experimentAccession, diffResults.comparison, diffResults.foldChange, diffResults.pValue, diffResults.tStatistics].filter(function (el) {
	                return el !== null;
	            }) // tStatistics might be missing
	            .join('\t') + '\n';
	        });
	
	        return tsv;
	    },
	    _downloadDifferentialProfiles: function _downloadDifferentialProfiles() {
	        $(ReactDOM.findDOMNode(this.refs.downloadProfilesLink)).click();
	    },
	    render: function render() {
	        var downloadImgSrcURL = this.props.hostUrl + '/gxa/resources/images/download_blue_small.png';
	
	        var tsvString = this._convertJsonToTsv(this.props.results);
	        var uri = 'data:text/tsv;charset=utf-8,' + encodeURI(tsvString);
	        var fileName = 'differentialResults.tsv';
	
	        return React.createElement(
	            'div',
	            { style: { display: 'inline-block', verticalAlign: 'top', paddingLeft: '10px' } },
	            React.createElement(
	                'a',
	                { ref: 'downloadProfilesLink', className: 'gxaNoTextButton',
	                    href: uri, download: fileName, target: '_blank',
	                    onClick: this._downloadDifferentialProfiles },
	                React.createElement('img', { id: 'download-profiles', alt: 'Download query results', style: { width: '20px' },
	                    src: downloadImgSrcURL })
	            )
	        );
	    },
	    componentDidMount: function componentDidMount() {
	        var $downloadProfilesLink = $(ReactDOM.findDOMNode(this.refs.downloadProfilesLink));
	        $downloadProfilesLink.tooltip();
	        $downloadProfilesLink.button();
	    }
	});
	
	//*------------------------------------------------------------------*
	
	module.exports = DownloadDifferentialButton;

/***/ },

/***/ 2006:
/*!*************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/src/DifferentialDownloadButton.css ***!
  \*************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(/*! !./../~/css-loader!./DifferentialDownloadButton.css */ 2007);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(/*! ./../~/style-loader/addStyles.js */ 1986)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../node_modules/css-loader/index.js!./DifferentialDownloadButton.css", function() {
				var newContent = require("!!./../node_modules/css-loader/index.js!./DifferentialDownloadButton.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 2007:
/*!*********************************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/css-loader!./expression-atlas-differential-expression/src/DifferentialDownloadButton.css ***!
  \*********************************************************************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(/*! ./../~/css-loader/lib/css-base.js */ 1985)();
	// imports
	
	
	// module
	exports.push([module.id, ".gxaNoTextButton {\n    border: 1px solid #ccc !important; /* overrides ebi-visual.css */\n}\n\n.gxaNoTextButton .ui-button-text {\n    padding: 2px;\n}\n", ""]);
	
	// exports


/***/ },

/***/ 2008:
/*!*******************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/contrast-tooltips/index.js ***!
  \*******************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	//*------------------------------------------------------------------*
	
	module.exports = __webpack_require__(/*! ./src/contrastTooltipModule.js */ 2009);

/***/ },

/***/ 2009:
/*!***************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/contrast-tooltips/src/contrastTooltipModule.js ***!
  \***************************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	//*------------------------------------------------------------------*
	
	var React = __webpack_require__(/*! react */ 1815);
	var ReactDOMServer = __webpack_require__(/*! react-dom/server */ 1998);
	
	var $ = __webpack_require__(/*! jquery */ 1973);
	__webpack_require__(/*! jquery-ui-bundle */ 1979);
	
	//*------------------------------------------------------------------*
	
	var ContrastTooltip = __webpack_require__(/*! ./ContrastTooltip.jsx */ 2010);
	
	//*------------------------------------------------------------------*
	
	__webpack_require__(/*! ./gxaContrastTooltip.css */ 2011);
	
	//*------------------------------------------------------------------*
	
	function initTooltip(contextRoot, accessKey, element, experimentAccession, contrastId) {
	
	    $(element).attr("title", "").tooltip({
	
	        hide: false,
	
	        show: false,
	
	        tooltipClass: "gxaContrastTooltip",
	
	        close: function close() {
	            $(".gxaContrastTooltip").remove();
	        },
	
	        content: function content(callback) {
	            $.ajax({
	                url: contextRoot + "/rest/contrast-summary",
	                data: {
	                    experimentAccession: experimentAccession,
	                    contrastId: contrastId,
	                    accessKey: accessKey
	                },
	                type: "GET",
	                success: function success(data) {
	                    var html = ReactDOMServer.renderToString(React.createElement(ContrastTooltip, {
	                        experimentDescription: data.experimentDescription,
	                        contrastDescription: data.contrastDescription,
	                        testReplicates: data.testReplicates,
	                        referenceReplicates: data.referenceReplicates,
	                        properties: data.properties
	                    }));
	                    callback(html);
	                }
	            }).fail(function (data) {
	                console.log("ERROR:  " + data);
	                callback("ERROR: " + data);
	            });
	        }
	
	    });
	}
	
	//*------------------------------------------------------------------*
	
	module.exports = function (contextRoot, accessKey, element, experimentAccession, contrastId) {
	    initTooltip(contextRoot, accessKey, element, experimentAccession, contrastId);
	};

/***/ },

/***/ 2010:
/*!**********************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/contrast-tooltips/src/ContrastTooltip.jsx ***!
  \**********************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	//*------------------------------------------------------------------*
	
	var React = __webpack_require__(/*! react */ 1815);
	
	//*------------------------------------------------------------------*
	
	var ContrastTooltip = React.createClass({
	    displayName: "ContrastTooltip",
	
	    propTypes: {
	        experimentDescription: React.PropTypes.string.isRequired,
	        contrastDescription: React.PropTypes.string.isRequired,
	        testReplicates: React.PropTypes.number.isRequired,
	        referenceReplicates: React.PropTypes.number.isRequired,
	        properties: React.PropTypes.arrayOf(React.PropTypes.shape({
	            contrastPropertyType: React.PropTypes.string,
	            propertyName: React.PropTypes.string.isRequired,
	            referenceValue: React.PropTypes.string.isRequired,
	            testValue: React.PropTypes.string.isRequired
	        }))
	    },
	
	    propertyRow: function propertyRow(property) {
	        if (!property.testValue && !property.referenceValue) {
	            return null;
	        }
	
	        function isFactor(property) {
	            return property.contrastPropertyType === "FACTOR";
	        }
	
	        var style = { whiteSpace: "normal" };
	
	        if (isFactor(property)) {
	            style.fontWeight = "bold";
	        } else {
	            style.color = "gray";
	        }
	
	        return React.createElement(
	            "tr",
	            { key: property.contrastPropertyType + "-" + property.propertyName },
	            React.createElement(
	                "td",
	                { style: style },
	                property.propertyName
	            ),
	            React.createElement(
	                "td",
	                { style: style },
	                property.testValue
	            ),
	            React.createElement(
	                "td",
	                { style: style },
	                property.referenceValue
	            )
	        );
	    },
	
	    render: function render() {
	        return React.createElement(
	            "div",
	            null,
	            React.createElement(
	                "div",
	                { id: "contrastExperimentDescription", style: { fontWeight: "bold", color: "blue", textAlign: "center" } },
	                this.props.experimentDescription
	            ),
	            React.createElement(
	                "div",
	                { id: "contrastDescription", style: { textAlign: "center" } },
	                this.props.contrastDescription
	            ),
	            React.createElement(
	                "table",
	                { style: { padding: "0px", margin: "0px", width: "100%" } },
	                React.createElement(
	                    "thead",
	                    null,
	                    React.createElement(
	                        "tr",
	                        null,
	                        React.createElement(
	                            "th",
	                            null,
	                            "Property"
	                        ),
	                        React.createElement(
	                            "th",
	                            null,
	                            "Test value (N=",
	                            this.props.testReplicates,
	                            ")"
	                        ),
	                        React.createElement(
	                            "th",
	                            null,
	                            "Reference value (N=",
	                            this.props.referenceReplicates,
	                            ")"
	                        )
	                    )
	                ),
	                React.createElement(
	                    "tbody",
	                    null,
	                    this.props.properties.map(this.propertyRow)
	                )
	            )
	        );
	    }
	
	});
	
	//*------------------------------------------------------------------*
	
	module.exports = ContrastTooltip;

/***/ },

/***/ 2011:
/*!*************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/contrast-tooltips/src/gxaContrastTooltip.css ***!
  \*************************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(/*! !./../../css-loader!./gxaContrastTooltip.css */ 2012);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(/*! ./../../style-loader/addStyles.js */ 1986)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../css-loader/index.js!./gxaContrastTooltip.css", function() {
				var newContent = require("!!./../../css-loader/index.js!./gxaContrastTooltip.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 2012:
/*!*********************************************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/css-loader!./expression-atlas-differential-expression/~/contrast-tooltips/src/gxaContrastTooltip.css ***!
  \*********************************************************************************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(/*! ./../../css-loader/lib/css-base.js */ 1985)();
	// imports
	
	
	// module
	exports.push([module.id, ".gxaContrastTooltip {\n    border: solid transparent;\n    color: darkslategray;\n    padding: 2px;\n    font: 10px Verdana, Helvetica, Arial, sans-serif;\n    max-width: 500px;\n}\n\n.gxaContrastTooltip table {\n    margin: 0; /* overrides ebi-visual.css:134 */\n    background-color: white;\n    border: 1px solid lightgrey;\n    border-collapse: collapse;\n}\n\n.gxaContrastTooltip th {\n    border-bottom: 1px solid lightgrey;\n    background-color: floralwhite;\n}\n\n.gxaContrastTooltip td {\n    border: 1px solid lightgrey;\n}\n\n.gxaContrastTooltip td, .gxaContrastTooltip th {\n    vertical-align: middle;\n    padding: 8px;\n}\n", ""]);
	
	// exports


/***/ },

/***/ 2013:
/*!****************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/index.js ***!
  \****************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	//*------------------------------------------------------------------*
	
	module.exports = __webpack_require__(/*! ./src/Feedback.jsx */ 2014);

/***/ },

/***/ 2014:
/*!************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/src/Feedback.jsx ***!
  \************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	//*------------------------------------------------------------------*
	
	var React = __webpack_require__(/*! react */ 1815);
	var LocalStorageMixin = __webpack_require__(/*! react-localstorage */ 2015);
	var TimerMixin = __webpack_require__(/*! react-timer-mixin */ 2017);
	var ReactCSSTransitionGroup = __webpack_require__(/*! react-addons-css-transition-group */ 2018);
	
	var BootstrapButton = __webpack_require__(/*! react-bootstrap/lib/Button */ 2025);
	var BootstrapFormGroup = __webpack_require__(/*! react-bootstrap/lib/FormGroup */ 2065);
	var BootstrapFormControl = __webpack_require__(/*! react-bootstrap/lib/FormControl */ 2069);
	
	var EmojiSpritesFile = __webpack_require__(/*! ../assets/emojione.sprites.png */ 2073);
	var Emoji = __webpack_require__(/*! react-emojione */ 2074);
	
	__webpack_require__(/*! ./gxaFeedback.css */ 2083);
	
	//*------------------------------------------------------------------*
	
	var FeedbackPersistence = function createFeedbackComponent(FeedbackUIComponent) {
	  return React.createClass({
	    displayName: 'ExpressionAtlasFeedbackForm',
	    mixins: [LocalStorageMixin],
	
	    propTypes: {
	      collectionCallback: React.PropTypes.func.isRequired
	    },
	
	    getInitialState: function getInitialState() {
	      return {
	        created: new Date().toISOString(),
	        shownTimes: 0,
	        show: true
	      };
	    },
	
	    _shouldShow: function _shouldShow() {
	      var timeDiff = Math.abs(new Date().getTime() - new Date(this.state.created).getTime());
	      var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
	
	      return this.state.show && diffDays > 0 && this.state.shownTimes < 50;
	    },
	
	    _hide: function _hide() {
	      this.setState({ show: false });
	    },
	
	    _complete: function _complete(userResponse, optionalUserComment) {
	      this.setState({ show: false });
	      this.props.collectionCallback(userResponse, new Date().toISOString() + (optionalUserComment || ""));
	    },
	
	    render: function render() {
	      var it = this._shouldShow() ? React.createElement(FeedbackUIComponent, { key: "box", onComplete: this._complete, onRequestHide: this._hide }) : React.createElement('div', { key: 'nullKey' });
	      return React.createElement(
	        ReactCSSTransitionGroup,
	        { transitionName: 'feedbackBoxTransitionWrapper', transitionEnterTimeout: 500, transitionLeaveTimeout: 1000 },
	        it
	      );
	    },
	
	    componentDidMount: function componentDidMount() {
	      if (this._shouldShow()) {
	        this.setState(function (previousState) {
	          return { shownTimes: previousState.shownTimes + 1 };
	        });
	      }
	    }
	  });
	};
	
	var FeedbackBox = React.createClass({
	  displayName: 'FeedbackBox',
	
	  propTypes: {
	    onComplete: React.PropTypes.func.isRequired,
	    onRequestHide: React.PropTypes.func.isRequired
	  },
	
	  mixins: [TimerMixin],
	
	  getInitialState: function getInitialState() {
	    return {
	      askingWhyTheResultsWereNotUseful: false,
	      feedbackMessage: ""
	    };
	  },
	
	  componentDidUpdate: function componentDidUpdate() {
	    if (this.state.askingWhyTheResultsWereNotUseful && this.state.feedbackMessage.length === 0) {
	      this.setTimeout(function () {
	        if (this.state.feedbackMessage.length === 0) {
	          this._submitNegativeAnswer();
	        }
	      }.bind(this), 5000);
	    }
	  },
	
	  _updateStateWithFormAnswer: function _updateStateWithFormAnswer(e) {
	    this.setState({ feedbackMessage: e.target.value });
	  },
	
	  _submitNegativeAnswer: function _submitNegativeAnswer() {
	    this._submitAnswer(0, this.state.feedbackMessage);
	  },
	
	  _submitPositiveAnswer: function _submitPositiveAnswer() {
	    this._submitAnswer(10);
	  },
	
	  _submitAnswer: function _submitAnswer(score, optionalMessage) {
	    this.props.onComplete.apply(this, arguments);
	  },
	
	  render: function render() {
	    return React.createElement(
	      'div',
	      { className: 'gxaFeedbackQuestionBox' },
	      React.createElement('div', { id: 'feedbackBoxCross', className: 'icon icon-functional', 'data-icon': 'x', onClick: this.props.onRequestHide }),
	      React.createElement(
	        'p',
	        null,
	        'Did you find these results useful?'
	      ),
	      React.createElement(
	        'div',
	        { className: 'gxaFeedbackQuestionBoxAnswer' },
	        this.state.askingWhyTheResultsWereNotUseful ? React.createElement(
	          'form',
	          null,
	          React.createElement(
	            BootstrapFormGroup,
	            {
	              controlId: 'optionalFeedback'
	            },
	            React.createElement(BootstrapFormControl, {
	              componentClass: 'textarea',
	              type: 'text',
	              value: this.state.feedbackMessage,
	              placeholder: 'Why not? (optional)',
	              onChange: this._updateStateWithFormAnswer
	            }),
	            React.createElement(BootstrapFormControl.Feedback, null),
	            React.createElement(
	              BootstrapButton,
	              { style: { float: "right" }, onClick: this._submitNegativeAnswer },
	              'Submit'
	            )
	          )
	        ) : React.createElement(
	          'div',
	          null,
	          React.createElement(
	            BootstrapButton,
	            { bsStyle: 'default', onClick: this._submitPositiveAnswer },
	            'Yes'
	          ),
	          React.createElement(
	            BootstrapButton,
	            { onClick: function () {
	                this.setState({ askingWhyTheResultsWereNotUseful: true });
	              }.bind(this), bsStyle: 'default' },
	            'No'
	          ),
	          React.createElement(
	            'a',
	            { onClick: this.props.onRequestHide },
	            'Do not show this again'
	          )
	        )
	      )
	    );
	  }
	});
	
	var Smiley = React.createClass({
	  displayName: 'Smiley',
	
	  propTypes: {
	    emoji: React.PropTypes.string.isRequired,
	    value: React.PropTypes.number.isRequired,
	    onClickCallback: React.PropTypes.func.isRequired,
	    selected: React.PropTypes.bool.isRequired
	  },
	
	  _onClick: function _onClick() {
	    this.props.onClickCallback(this.props.value);
	  },
	
	  _emojifyOptions: {
	    convertShortnames: true,
	    convertUnicode: false,
	    convertAscii: true,
	    styles: {
	      backgroundImage: 'url(' + (window.location.href.indexOf("gxa") > -1 ? "resources/js-bundles/" : "") + EmojiSpritesFile + ')',
	      width: '32px',
	      height: '32px',
	      margin: '4px'
	    }
	  },
	
	  render: function render() {
	    return React.createElement(
	      'span',
	      { style: { padding: "6px" } },
	      React.createElement(
	        'span',
	        { className: this.props.selected ? "gxaSmiley gxaSmileyClicked" : "gxaSmiley", onClick: this._onClick },
	        Emoji.emojify(this.props.emoji, this._emojifyOptions)
	      )
	    );
	  }
	});
	
	var FeedbackSmileys = React.createClass({
	  displayName: 'FeedbackSmileys',
	
	  propTypes: {
	    onComplete: React.PropTypes.func.isRequired,
	    onRequestHide: React.PropTypes.func.isRequired
	  },
	
	  mixins: [TimerMixin],
	
	  getInitialState: function getInitialState() {
	    return {
	      score: -1,
	      feedbackMessage: ""
	    };
	  },
	
	  _interactionHappened: function _interactionHappened() {
	    return this.state.score !== this.getInitialState().score;
	  },
	
	  _updateStateWithFormAnswer: function _updateStateWithFormAnswer(e) {
	    this.setState({ feedbackMessage: e.target.value });
	  },
	
	  _smileyClicked: function _smileyClicked(newScore) {
	    this.setState({ score: newScore });
	  },
	
	  _submit: function _submit() {
	    this.props.onComplete(this.state.score, this.state.feedbackMessage);
	  },
	
	  componentDidUpdate: function componentDidUpdate() {
	    if (this._interactionHappened() && this.state.feedbackMessage.length === 0) {
	      this.setTimeout(function () {
	        if (this.state.feedbackMessage.length === 0) {
	          this._submit();
	        }
	      }.bind(this), 5000);
	    }
	  },
	
	  render: function render() {
	    /* identifiers from http://emoji.codes/ */
	    return React.createElement(
	      'div',
	      { className: 'gxaSmileyFeedbackBox' },
	      React.createElement(
	        'p',
	        null,
	        ' Did you find these results useful?'
	      ),
	      React.createElement(
	        'div',
	        { className: 'gxaSmileyRow' },
	        [[":frowning:", 0], [":slight_frown:", 2], [":neutral_face:", 5], [":slight_smile:", 8], [":smiley:", 10]].map(function (ar) {
	          return React.createElement(Smiley, {
	            key: ar[0] + (this.state.score === ar[1]),
	            emoji: ar[0],
	            value: ar[1],
	            onClickCallback: this._smileyClicked,
	            selected: this.state.score === ar[1]
	          });
	        }.bind(this))
	      ),
	      React.createElement(
	        'form',
	        { style: { display: this._interactionHappened() ? "block" : "none" } },
	        React.createElement(
	          BootstrapFormGroup,
	          {
	            controlId: 'optionalFeedback'
	          },
	          React.createElement(BootstrapFormControl, {
	            componentClass: 'textarea',
	            type: 'text',
	            value: this.state.feedbackMessage,
	            placeholder: 'Feedback (optional)',
	            onChange: this._updateStateWithFormAnswer
	          }),
	          React.createElement(BootstrapFormControl.Feedback, null),
	          React.createElement(
	            'div',
	            null,
	            React.createElement(
	              BootstrapButton,
	              { onClick: this._submit },
	              'Submit'
	            )
	          )
	        )
	      )
	    );
	  }
	
	});
	
	module.exports = FeedbackPersistence(FeedbackSmileys);

/***/ },

/***/ 2015:
/*!**************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-localstorage/react-localstorage.js ***!
  \**************************************************************************************************************/
[2844, 1815, 2016],

/***/ 2016:
/*!*******************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-localstorage/lib/warning.js ***!
  \*******************************************************************************************************/
662,

/***/ 2017:
/*!*****************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-timer-mixin/TimerMixin.js ***!
  \*****************************************************************************************************/
663,

/***/ 2018:
/*!****************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-addons-css-transition-group/index.js ***!
  \****************************************************************************************************************/
[2831, 2019],

/***/ 2019:
/*!*****************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactCSSTransitionGroup.js ***!
  \*****************************************************************************************/
[2832, 1816, 1852, 2020, 2022],

/***/ 2020:
/*!**************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactTransitionGroup.js ***!
  \**************************************************************************************/
[2833, 1816, 2021, 1852, 1828],

/***/ 2021:
/*!*********************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactTransitionChildMapping.js ***!
  \*********************************************************************************************/
[2834, 1929],

/***/ 2022:
/*!**********************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactCSSTransitionGroupChild.js ***!
  \**********************************************************************************************/
[2835, 1816, 1817, 2023, 2024, 1969],

/***/ 2023:
/*!********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/~/fbjs/lib/CSSCore.js ***!
  \********************************************************************************/
[2836, 1826],

/***/ 2024:
/*!***************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react/lib/ReactTransitionEvents.js ***!
  \***************************************************************************************/
[2837, 1822],

/***/ 2025:
/*!***************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/lib/Button.js ***!
  \***************************************************************************************************/
[2655, 2026, 2041, 2042, 2052, 2053, 1815, 2054, 2056, 2061, 2063],

/***/ 2026:
/*!*************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/~/babel-runtime/helpers/inherits.js ***!
  \*************************************************************************************************************************/
[2610, 2027, 2030],

/***/ 2027:
/*!******************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/~/babel-runtime/core-js/object/create.js ***!
  \******************************************************************************************************************************/
[2611, 2028],

/***/ 2028:
/*!*******************************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/~/babel-runtime/~/core-js/library/fn/object/create.js ***!
  \*******************************************************************************************************************************************/
[2612, 2029],

/***/ 2029:
/*!************************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/~/babel-runtime/~/core-js/library/modules/$.js ***!
  \************************************************************************************************************************************/
165,

/***/ 2030:
/*!****************************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/~/babel-runtime/core-js/object/set-prototype-of.js ***!
  \****************************************************************************************************************************************/
[2613, 2031],

/***/ 2031:
/*!*****************************************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/~/babel-runtime/~/core-js/library/fn/object/set-prototype-of.js ***!
  \*****************************************************************************************************************************************************/
[2614, 2032, 2035],

/***/ 2032:
/*!**************************************************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/~/babel-runtime/~/core-js/library/modules/es6.object.set-prototype-of.js ***!
  \**************************************************************************************************************************************************************/
[2615, 2033, 2038],

/***/ 2033:
/*!*******************************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/~/babel-runtime/~/core-js/library/modules/$.export.js ***!
  \*******************************************************************************************************************************************/
[2616, 2034, 2035, 2036],

/***/ 2034:
/*!*******************************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/~/babel-runtime/~/core-js/library/modules/$.global.js ***!
  \*******************************************************************************************************************************************/
170,

/***/ 2035:
/*!*****************************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/~/babel-runtime/~/core-js/library/modules/$.core.js ***!
  \*****************************************************************************************************************************************/
171,

/***/ 2036:
/*!****************************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/~/babel-runtime/~/core-js/library/modules/$.ctx.js ***!
  \****************************************************************************************************************************************/
[2617, 2037],

/***/ 2037:
/*!***********************************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/~/babel-runtime/~/core-js/library/modules/$.a-function.js ***!
  \***********************************************************************************************************************************************/
173,

/***/ 2038:
/*!**********************************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/~/babel-runtime/~/core-js/library/modules/$.set-proto.js ***!
  \**********************************************************************************************************************************************/
[2618, 2029, 2039, 2040, 2036],

/***/ 2039:
/*!**********************************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/~/babel-runtime/~/core-js/library/modules/$.is-object.js ***!
  \**********************************************************************************************************************************************/
175,

/***/ 2040:
/*!**********************************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/~/babel-runtime/~/core-js/library/modules/$.an-object.js ***!
  \**********************************************************************************************************************************************/
[2619, 2039],

/***/ 2041:
/*!*********************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/~/babel-runtime/helpers/class-call-check.js ***!
  \*********************************************************************************************************************************/
177,

/***/ 2042:
/*!************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/~/babel-runtime/helpers/extends.js ***!
  \************************************************************************************************************************/
[2620, 2043],

/***/ 2043:
/*!******************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/~/babel-runtime/core-js/object/assign.js ***!
  \******************************************************************************************************************************/
[2621, 2044],

/***/ 2044:
/*!*******************************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/~/babel-runtime/~/core-js/library/fn/object/assign.js ***!
  \*******************************************************************************************************************************************/
[2622, 2045, 2035],

/***/ 2045:
/*!****************************************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/~/babel-runtime/~/core-js/library/modules/es6.object.assign.js ***!
  \****************************************************************************************************************************************************/
[2623, 2033, 2046],

/***/ 2046:
/*!**************************************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/~/babel-runtime/~/core-js/library/modules/$.object-assign.js ***!
  \**************************************************************************************************************************************************/
[2624, 2029, 2047, 2049, 2051],

/***/ 2047:
/*!**********************************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/~/babel-runtime/~/core-js/library/modules/$.to-object.js ***!
  \**********************************************************************************************************************************************/
[2625, 2048],

/***/ 2048:
/*!********************************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/~/babel-runtime/~/core-js/library/modules/$.defined.js ***!
  \********************************************************************************************************************************************/
184,

/***/ 2049:
/*!********************************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/~/babel-runtime/~/core-js/library/modules/$.iobject.js ***!
  \********************************************************************************************************************************************/
[2626, 2050],

/***/ 2050:
/*!****************************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/~/babel-runtime/~/core-js/library/modules/$.cof.js ***!
  \****************************************************************************************************************************************/
186,

/***/ 2051:
/*!******************************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/~/babel-runtime/~/core-js/library/modules/$.fails.js ***!
  \******************************************************************************************************************************************/
187,

/***/ 2052:
/*!****************************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/~/babel-runtime/helpers/interop-require-default.js ***!
  \****************************************************************************************************************************************/
193,

/***/ 2053:
/*!***********************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/~/classnames/index.js ***!
  \***********************************************************************************************************/
195,

/***/ 2054:
/*!***************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/~/react-prop-types/lib/elementType.js ***!
  \***************************************************************************************************************************/
[2651, 1815, 2055],

/***/ 2055:
/*!**********************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/~/react-prop-types/lib/common.js ***!
  \**********************************************************************************************************************/
272,

/***/ 2056:
/*!******************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/lib/styleMaps.js ***!
  \******************************************************************************************************/
[2653, 2043, 2027, 2057],

/***/ 2057:
/*!****************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/~/babel-runtime/core-js/object/keys.js ***!
  \****************************************************************************************************************************/
[2627, 2058],

/***/ 2058:
/*!*****************************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/~/babel-runtime/~/core-js/library/fn/object/keys.js ***!
  \*****************************************************************************************************************************************/
[2628, 2059, 2035],

/***/ 2059:
/*!**************************************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/~/babel-runtime/~/core-js/library/modules/es6.object.keys.js ***!
  \**************************************************************************************************************************************************/
[2629, 2047, 2060],

/***/ 2060:
/*!***********************************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/~/babel-runtime/~/core-js/library/modules/$.object-sap.js ***!
  \***********************************************************************************************************************************************/
[2630, 2033, 2035, 2051],

/***/ 2061:
/*!*****************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/lib/utils/bootstrapUtils.js ***!
  \*****************************************************************************************************************/
[2652, 2042, 2052, 1815, 2056, 2062],

/***/ 2062:
/*!************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/~/invariant/browser.js ***!
  \************************************************************************************************************/
277,

/***/ 2063:
/*!*******************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/lib/SafeAnchor.js ***!
  \*******************************************************************************************************/
[2656, 2026, 2041, 2042, 2064, 2052, 1815, 2054],

/***/ 2064:
/*!******************************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/~/babel-runtime/helpers/object-without-properties.js ***!
  \******************************************************************************************************************************************/
188,

/***/ 2065:
/*!******************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/lib/FormGroup.js ***!
  \******************************************************************************************************/
[2663, 2026, 2041, 2042, 2064, 2052, 2053, 1815, 2066, 2056, 2061, 2068],

/***/ 2066:
/*!**************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/~/react-prop-types/lib/deprecated.js ***!
  \**************************************************************************************************************************/
[2664, 2067],

/***/ 2067:
/*!**********************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/~/warning/browser.js ***!
  \**********************************************************************************************************/
279,

/***/ 2068:
/*!*************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/lib/utils/ValidComponentChildren.js ***!
  \*************************************************************************************************************************/
[2654, 2052, 1815],

/***/ 2069:
/*!********************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/lib/FormControl.js ***!
  \********************************************************************************************************/
[2665, 2026, 2041, 2064, 2042, 2052, 2053, 1815, 2054, 2067, 2061, 2070, 2072],

/***/ 2070:
/*!****************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/lib/FormControlFeedback.js ***!
  \****************************************************************************************************************/
[2666, 2026, 2041, 2042, 2064, 2052, 2053, 1815, 2061, 2071],

/***/ 2071:
/*!******************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/lib/Glyphicon.js ***!
  \******************************************************************************************************/
[2667, 2042, 2052, 2053, 1815, 2066],

/***/ 2072:
/*!**************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-bootstrap/lib/FormControlStatic.js ***!
  \**************************************************************************************************************/
[2668, 2026, 2041, 2064, 2042, 2052, 2053, 1815, 2054, 2061],

/***/ 2073:
/*!***********************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/assets/emojione.sprites.png ***!
  \***********************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "72e306f1246f69de2c83c8d3c3141177.png";

/***/ },

/***/ 2074:
/*!**********************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-emojione/lib/react-emojione.js ***!
  \**********************************************************************************************************/
[2838, 2075, 2076, 2080],

/***/ 2075:
/*!*****************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-emojione/lib/data/ascii-to-unicode.js ***!
  \*****************************************************************************************************************/
653,

/***/ 2076:
/*!**********************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-emojione/lib/renderers/renderer-factory.js ***!
  \**********************************************************************************************************************/
[2839, 2077, 2082],

/***/ 2077:
/*!********************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-emojione/lib/renderers/emoji-renderer.js ***!
  \********************************************************************************************************************/
[2840, 1815, 2078, 2080],

/***/ 2078:
/*!******************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-emojione/lib/styles/emojione-sprite.js ***!
  \******************************************************************************************************************/
[2841, 2079],

/***/ 2079:
/*!****************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-emojione/lib/styles/emojione-sprite-positions.js ***!
  \****************************************************************************************************************************/
657,

/***/ 2080:
/*!*************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-emojione/lib/utils/emoji-format-conversion.js ***!
  \*************************************************************************************************************************/
[2842, 2081],

/***/ 2081:
/*!***********************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-emojione/lib/data/emoji-data.js ***!
  \***********************************************************************************************************/
659,

/***/ 2082:
/*!**********************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/~/react-emojione/lib/renderers/unicode-renderer.js ***!
  \**********************************************************************************************************************/
[2843, 2080],

/***/ 2083:
/*!***************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/atlas-feedback/src/gxaFeedback.css ***!
  \***************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(/*! !./../../css-loader!./gxaFeedback.css */ 2084);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(/*! ./../../style-loader/addStyles.js */ 1986)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../css-loader/index.js!./gxaFeedback.css", function() {
				var newContent = require("!!./../../css-loader/index.js!./gxaFeedback.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 2084:
/*!***********************************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/css-loader!./expression-atlas-differential-expression/~/atlas-feedback/src/gxaFeedback.css ***!
  \***********************************************************************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(/*! ./../../css-loader/lib/css-base.js */ 1985)();
	// imports
	
	
	// module
	exports.push([module.id, "div.gxaFeedbackQuestionBox {\n  margin: 30px;\n  width: 300px;\n  background-color: #b3e0ff;\n  border: 3px solid #008ae6;\n  opacity: 0.6;\n  filter: alpha(opacity=60); /* For IE8 and earlier */\n}\n\n#feedbackBoxCross {\n  margin: 3px;\n  margin-top: 5px;\n  float: right;\n  cursor:pointer;\n}\n\n#feedbackBoxCross:before {\n  color: #BF2222;\n}\n\ndiv.gxaFeedbackQuestionBox p {\n  margin: 2%;\n font-weight: bold;\n text-align: center;\n}\n\ndiv.gxaFeedbackQuestionBox a {\n  float: right;\n  margin-top: 6px;\n  cursor:pointer;\n}\n\ndiv.gxaFeedbackQuestionBoxAnswer {\n  position:relative;\ntext-align: center;\n  margin: 0 auto;\n  margin-bottom: 10px;\n  width: 90%;\n}\n\ndiv.gxaFeedbackQuestionBox button {\n width: auto;\n}\n\n.feedbackBoxTransitionWrapper-leave {\n  opacity: 1;\n}\n\n.feedbackBoxTransitionWrapper-leave.feedbackBoxTransitionWrapper-leave-active {\n  opacity: 0.01;\n  transition: opacity 300ms ease-in;\n}\n\n.gxaSmiley {\n  opacity: 0.6;\n  text-decoration:none;\n  cursor:pointer;\n}\n\n.gxaSmiley:hover {\n  opacity: 0.9;\n  text-decoration:none;\n  cursor:pointer;\n}\n\n.gxaSmileyClicked {\n  opacity: 1;\n}\n\n.gxaSmileyFeedbackBox {\n  text-align: center;\n  clear: both;\n  width: 300px;\n  opacity: 0.8;\n  filter: alpha(opacity=80); /* For IE8 and earlier */\n}\n\n.gxaSmileyRow {\n  text-align: center!important;\n}\n\n.gxaSmileyFeedbackBox p {\n  padding-left: 18px;\n  padding-top: 5px;\n  font-weight: bold;\n  font-size: 14px;\n}\n\n.gxaSmileyFeedbackBox form {\n  padding: 6px;\n  width: 87%;\n}\n\n.gxaSmileyFeedbackBox button {\n  width: 100px;\n  margin-left: 91px;\n}\n\n.form-control {\n  display: block;\n  width: 100%;\n  height: 34px;\n  padding: 6px 12px;\n  font-size: 14px;\n  line-height: 1.42857143;\n  color: #555;\n  background-color: #fff;\n  background-image: none;\n  border: 1px solid #ccc;\n  border-radius: 4px;\n  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);\n          box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);\n  -webkit-transition: border-color ease-in-out .15s, -webkit-box-shadow ease-in-out .15s;\n       -o-transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;\n          transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;\n}\n.form-control:focus {\n  border-color: #66afe9;\n  outline: 0;\n  -webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102, 175, 233, .6);\n          box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102, 175, 233, .6);\n}\n.form-control::-moz-placeholder {\n  color: #999;\n  opacity: 1;\n}\n.form-control:-ms-input-placeholder {\n  color: #999;\n}\n.form-control::-webkit-input-placeholder {\n  color: #999;\n}\n", ""]);
	
	// exports


/***/ },

/***/ 2085:
/*!*******************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react-ebi-species/index.js ***!
  \*******************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	exports.Icon = __webpack_require__(/*! ./src/SpeciesIcon.jsx */ 2086);
	exports.render = __webpack_require__(/*! ./src/renderer.js */ 2090);

/***/ },

/***/ 2086:
/*!******************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react-ebi-species/src/SpeciesIcon.jsx ***!
  \******************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	//*------------------------------------------------------------------*
	
	var React = __webpack_require__(/*! react */ 1815);
	__webpack_require__(/*! style!css!./ebi-visual-species.css */ 2087);
	var mapping = __webpack_require__(/*! ./mapping.js */ 2089);
	
	//*------------------------------------------------------------------*
	
	var Icon = React.createClass({
	  displayName: "Icon",
	
	
	  propTypes: {
	    species: React.PropTypes.string.isRequired,
	    colourOverride: React.PropTypes.string,
	    colourPerGroup: React.PropTypes.objectOf(React.PropTypes.string).isRequired
	  },
	
	  getDefaultProps: function getDefaultProps() {
	    return {
	      species: "oryctolagus cuniculus", //rabbit is objectively the best species
	      colourPerGroup: {
	        mammals: "red",
	        plants: "green",
	        other: "blue"
	      }
	    };
	  },
	
	  _lookUpIcon: function _lookUpIcon() {
	    for (var group in mapping) {
	      if (mapping.hasOwnProperty(group)) {
	        for (var iconSymbol in mapping[group]) {
	          if (mapping[group].hasOwnProperty(iconSymbol)) {
	            if (mapping[group][iconSymbol].indexOf(this.props.species.toLowerCase()) > -1) {
	              return [group, iconSymbol];
	            }
	          }
	        }
	      }
	    }
	    return ["", ""];
	  },
	
	  render: function render() {
	    var groupAndIcon = this._lookUpIcon();
	    return React.createElement("span", {
	      className: "react-ebi-species-icon",
	      "data-icon": groupAndIcon[1],
	      style: { "color": this.props.colourOverride || this.props.colourPerGroup[groupAndIcon[0]] },
	      title: this.props.species });
	  }
	
	});
	
	//*------------------------------------------------------------------*
	
	module.exports = Icon;

/***/ },

/***/ 2087:
/*!*******************************************************************************************************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/style-loader!./expression-atlas-differential-expression/~/css-loader!./expression-atlas-differential-expression/~/react-ebi-species/src/ebi-visual-species.css ***!
  \*******************************************************************************************************************************************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(/*! !./../../css-loader!./ebi-visual-species.css */ 2088);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(/*! ./../../style-loader/addStyles.js */ 1986)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../css-loader/index.js!./ebi-visual-species.css", function() {
				var newContent = require("!!./../../css-loader/index.js!./ebi-visual-species.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 2088:
/*!*********************************************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/css-loader!./expression-atlas-differential-expression/~/react-ebi-species/src/ebi-visual-species.css ***!
  \*********************************************************************************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(/*! ./../../css-loader/lib/css-base.js */ 1985)();
	// imports
	
	
	// module
	exports.push([module.id, "/* Taken from: https://www.ebi.ac.uk/web_guidelines/css/compliance/develop/ebi-visual.css */\n\n@font-face {\n    font-family: 'EBI-Species';\n    src: url('https://www.ebi.ac.uk/web_guidelines/fonts/EBI-Species/fonts/EBI-Species.eot');\n    src: url('https://www.ebi.ac.uk/web_guidelines/fonts/EBI-Species/fonts/EBI-Species.eot?#iefix') format('embedded-opentype'), url('https://www.ebi.ac.uk/web_guidelines/fonts/EBI-Species/fonts/EBI-Species.woff') format('woff'), local('\\263A'), url('https://www.ebi.ac.uk/web_guidelines/fonts/EBI-Species/fonts/EBI-Species.svg#EBI-Species') format('svg'), url('https://www.ebi.ac.uk/web_guidelines/fonts/EBI-Species/fonts/EBI-Species.ttf') format('truetype');\n    font-weight: normal;\n    font-style: normal\n}\n\n.react-ebi-species-icon:before {\n    font-family: 'EBI-Species';\n    font-size: 100%;\n    color: inherit;\n    content: attr(data-icon);\n    margin: 0 0.3em 0 0\n}\n\n.react-ebi-species-icon {\n    text-decoration: none;\n    font-style: normal\n}\n", ""]);
	
	// exports


/***/ },

/***/ 2089:
/*!*************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react-ebi-species/src/mapping.js ***!
  \*************************************************************************************/
/***/ function(module, exports) {

	"use strict";
	
	module.exports = {
		"mammals": {
			"C": "bos taurus",
			"d": ["canis lupus", "canis lupus familiaris"],
			"h": "equus caballus",
			"H": "homo sapiens",
			"k": "gallus gallus",
			"G": "gorilla gorilla",
			"r": "macaca mulatta",
			"9": "monodelphis domestica",
			"M": "mus musculus",
			"i": ["pan paniscus", "pan troglodytes"],
			"R": "rattus norvegicus",
			"t": "oryctolagus cuniculus",
			"x": "ovis aries",
			"8": "papio anubis"
		},
		"plants": {
			"B": "arabidopsis thaliana",
			"5": ["hordeum vulgare", "hordeum vulgare subsp. vulgare"],
			"6": ["oryza sativa", "oryza sativa japonica group"],
			"c": "zea mays",
			"P": ["brachypodium distachyon", "glycine max", "solanum lycopersicum", "sorghum bicolor", "vitis vinifera"]
		},
		"other": {
			"7": "anolis carolinensis",
			"Z": "danio rerio",
			"F": "drosophila melanogaster",
			"W": ["caenorhabditis elegans", "schistosoma mansoni"],
			"E": "tetraodon nigroviridis",
			"f": ["xenopus (silurana) tropicalis", "xenopus tropicalis"]
		}
	};

/***/ },

/***/ 2090:
/*!**************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/react-ebi-species/src/renderer.js ***!
  \**************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	//*------------------------------------------------------------------*
	
	var React = __webpack_require__(/*! react */ 1815);
	var ReactDOM = __webpack_require__(/*! react-dom */ 1971);
	
	//*------------------------------------------------------------------*
	
	var Icon = __webpack_require__(/*! ./SpeciesIcon.jsx */ 2086);
	
	//*------------------------------------------------------------------*
	
	module.exports = function (mountNode, species, colourOverride, colourPerKingdom) {
	    ReactDOM.render(React.createElement(Icon, {
	        species: species,
	        colourOverride: colourOverride,
	        colourPerKingdom: colourPerKingdom
	    }), mountNode);
	};

/***/ },

/***/ 2091:
/*!******************************************************************************!*\
  !*** ./expression-atlas-differential-expression/src/DifferentialResults.css ***!
  \******************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(/*! !./../~/css-loader!./DifferentialResults.css */ 2092);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(/*! ./../~/style-loader/addStyles.js */ 1986)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../node_modules/css-loader/index.js!./DifferentialResults.css", function() {
				var newContent = require("!!./../node_modules/css-loader/index.js!./DifferentialResults.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 2092:
/*!**************************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/css-loader!./expression-atlas-differential-expression/src/DifferentialResults.css ***!
  \**************************************************************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(/*! ./../~/css-loader/lib/css-base.js */ 1985)();
	// imports
	
	
	// module
	exports.push([module.id, "table.table-striped tr:nth-child(even) {\n    background-color: #f9f9f9;\n}\n\ntable.table-striped tr:nth-child(odd) {\n    background: #FFF;\n}\n\ntable.gxaDifferentialFacetedSearchResults th, table.gxaDifferentialFacetedSearchResults th span {\n    font-weight: bold;\n}\n\ntable.gxaDifferentialFacetedSearchResults th {\n    font-size: 90%;\n    border: 0 solid #ddd;\n    border-bottom-width: 2px;\n    vertical-align: bottom;\n}\n\ntable.gxaDifferentialFacetedSearchResults tr td {\n    padding: 8px;\n    line-height: 1.42857143;\n    vertical-align: top;\n    border-top: 1px solid #ddd\n}\n\ntable.gxaDifferentialFacetedSearchResults tr td.col_species .react-ebi-species-icon {\n    font-size: 300%;\n    margin-left: 4px;\n}\n\ntd.gxaExperimentalVariable {\n    text-align: center;\n}\n", ""]);
	
	// exports


/***/ },

/***/ 2093:
/*!*********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/src/DifferentialFacetsTree.jsx ***!
  \*********************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var React = __webpack_require__(/*! react */ 1815);
	
	//*------------------------------------------------------------------*
	
	__webpack_require__(/*! ./DifferentialFacetsTree.css */ 2094);
	
	//*------------------------------------------------------------------*
	
	var RequiredString = React.PropTypes.string.isRequired;
	var RequiredBool = React.PropTypes.bool.isRequired;
	
	var DifferentialFacetsTree = React.createClass({
	    displayName: 'DifferentialFacetsTree',
	
	    propTypes: {
	        /*
	        [
	            { "facetName" : "species",
	              "facetItems" : [ {"name": "homo sapiens", "value": "Homo sapiens", checked: false, disabled: false},
	                               {"name": "arabidopsis thaliana", "value": "arabidopsis thaliana", checked: true, disabled: false} ]
	            },
	            { "facetName" : "experimentType",
	              "facetItems" : [ {"name": "rnaseq_mrna_differential", "value": "RNA-seq mRNA", checked: false, disabled: true},
	                                {"name": "microarray_1colour_mrna_differential", "value": "1 colour mRNA", checked: false, disabled: false} ]
	            },
	            { "facetName" : "factors",
	              "facetItems" : [ {"name": "genotype", "value": "genotype", checked: true, disabled: true} ]
	            },
	            { "facetName" : "numReplicates",
	              "facetItems" : [ {"name": "3", "value": "3", checked: true, disabled: true} ]
	            },
	            { "facetName" : "regulation".
	              "facetItems" : [ {"name": "UP", "value": "Up", checked: true, disabled: false},
	                            {"name": "DOWN", "value": "Down", checked: false, disabled: false} ]
	            }
	        ]
	        */
	        facets: React.PropTypes.arrayOf(React.PropTypes.shape({
	            facetName: RequiredString,
	            facetItems: React.PropTypes.arrayOf(React.PropTypes.shape({
	                name: RequiredString,
	                value: RequiredString,
	                checked: RequiredBool,
	                disabled: RequiredBool
	            }).isRequired).isRequired
	        }).isRequired).isRequired,
	        setChecked: React.PropTypes.func.isRequired
	    },
	
	    _setChecked: function _setChecked(facetName, facetItemName, checked) {
	        this.props.setChecked(facetName, facetItemName, checked);
	    },
	    render: function render() {
	        var _this = this;
	
	        var facets = this.props.facets.map(function (facet) {
	            return React.createElement(Facet, {
	                key: facet.facetName,
	                facetName: facet.facetName,
	                facetItems: facet.facetItems,
	                setChecked: _this._setChecked
	            });
	        });
	
	        return React.createElement(
	            'div',
	            { className: 'hidden-xs gxaFacetsContainer' },
	            React.createElement(
	                'h3',
	                null,
	                'Filter your results'
	            ),
	            facets
	        );
	    }
	});
	
	var Facet = React.createClass({
	    displayName: 'Facet',
	
	    propTypes: {
	        facetName: React.PropTypes.string.isRequired,
	        facetItems: React.PropTypes.arrayOf(React.PropTypes.shape({
	            name: RequiredString,
	            value: RequiredString,
	            checked: RequiredBool,
	            disabled: RequiredBool
	        }).isRequired).isRequired,
	        setChecked: React.PropTypes.func.isRequired
	    },
	
	    _setChecked: function _setChecked(facetItemName, checked) {
	        this.props.setChecked(this.props.facetName, facetItemName, checked);
	    },
	    _prettifyFacetName: function _prettifyFacetName(facetName) {
	        switch (facetName) {
	            case 'kingdom':
	                return 'Kingdom';
	            case 'species':
	                return 'Species';
	            case 'experimentType':
	                return 'Experiment type';
	            case 'factors':
	                return 'Experimental variables';
	            case 'numReplicates':
	                return 'Number of replicates';
	            case 'regulation':
	                return 'Regulation';
	            default:
	                return facetName;
	        }
	    },
	    render: function render() {
	        var _this2 = this;
	
	        var facetItems = this.props.facetItems.map(function (facetItem) {
	            return React.createElement(FacetItem, {
	                key: facetItem.name,
	                name: facetItem.name,
	                value: facetItem.value,
	                checked: facetItem.checked,
	                disabled: facetItem.disabled,
	                setChecked: _this2._setChecked
	            });
	        });
	
	        var className = this.props.facetName === 'species' ? 'gxaSpeciesFacet' : '';
	
	        return React.createElement(
	            'div',
	            { className: 'gxaFacetItem' },
	            React.createElement(
	                'h4',
	                null,
	                this._prettifyFacetName(this.props.facetName)
	            ),
	            React.createElement(
	                'ul',
	                { className: className },
	                facetItems
	            )
	        );
	    }
	});
	
	var FacetItem = React.createClass({
	    displayName: 'FacetItem',
	
	    propTypes: {
	        name: RequiredString,
	        value: RequiredString,
	        checked: RequiredBool,
	        disabled: RequiredBool,
	        setChecked: React.PropTypes.func.isRequired
	    },
	
	    _setChecked: function _setChecked() {
	        this.props.setChecked(this.props.name, !this.props.checked);
	    },
	    render: function render() {
	        var className = this.props.disabled ? 'gxaDisabledFacet' : '';
	        return React.createElement(
	            'li',
	            { className: className },
	            React.createElement('input', { type: 'checkbox', checked: this.props.checked, onChange: this._setChecked, disabled: this.props.disabled }),
	            this.props.value
	        );
	    }
	});
	
	//*------------------------------------------------------------------*
	
	module.exports = DifferentialFacetsTree;

/***/ },

/***/ 2094:
/*!*********************************************************************************!*\
  !*** ./expression-atlas-differential-expression/src/DifferentialFacetsTree.css ***!
  \*********************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(/*! !./../~/css-loader!./DifferentialFacetsTree.css */ 2095);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(/*! ./../~/style-loader/addStyles.js */ 1986)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../node_modules/css-loader/index.js!./DifferentialFacetsTree.css", function() {
				var newContent = require("!!./../node_modules/css-loader/index.js!./DifferentialFacetsTree.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 2095:
/*!*****************************************************************************************************************************************!*\
  !*** ./expression-atlas-differential-expression/~/css-loader!./expression-atlas-differential-expression/src/DifferentialFacetsTree.css ***!
  \*****************************************************************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(/*! ./../~/css-loader/lib/css-base.js */ 1985)();
	// imports
	
	
	// module
	exports.push([module.id, "/*Responsive*/\n@media (max-width: 768px) {\n    .hidden-xs {display: none!important;} /*remove column like filter for small devices*/\n}\n\n/* Facets-tree container */\n.gxaFacetsContainer ul, .gxaFacetsContainer li {\n    list-style-type: none;\n    padding: 2px 0;\n}\n\n.gxaFacetsContainer .gxaFacetItem {\n    padding-bottom: 8px;\n}\n\n.gxaFacetsContainer .gxaFacetItem h4:first-letter, .gxaFacetsContainer .gxaFacetItem ul li span:first-letter {\n    text-transform: capitalize;\n}\n\n.gxaFacetsContainer .gxaFacetItem h4 {\n    font-weight: bold;\n    font-size: 133%;\n    padding: 0;\n}\n\n.gxaFacetsContainer .gxaFacetItem .gxaDisabledFacet span {\n    color: gray;\n}\n\n.gxaFacetsContainer .gxaDisabledCheckbox {\n    color: lightgray;\n}\n\n.gxaSpeciesFacet li span {\n    font-style: italic;\n}\n", ""]);
	
	// exports


/***/ },

/***/ 2096:
/*!********************************************************************!*\
  !*** ./expression-atlas-differential-expression/src/urlManager.js ***!
  \********************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Url = __webpack_require__(/*! url */ 1806);
	var QueryString = __webpack_require__(/*! querystring */ 1811);
	
	/**
	 * Stringify the `query` object, assign it to the `ds` search field in the URL and store it in the History
	 * @param {object} querySelect
	 * @param {boolean} replace - use `replaceState` instead of `pushState`
	 */
	exports.differentialPush = function pushQueryIntoBrowserHistory(querySelect, replace) {
	    var currentUrlObject = Url.parse(window.location.toString());
	
	    var newUrlQueryParams = QueryString.parse(currentUrlObject.query);
	    newUrlQueryParams.ds = JSON.stringify(querySelect);
	
	    var newUrlObject = {
	        protocol: currentUrlObject.protocol,
	        host: currentUrlObject.host,
	        hash: currentUrlObject.hash,
	        pathname: currentUrlObject.pathname,
	        query: newUrlQueryParams
	    };
	
	    if (replace) {
	        history.replaceState(null, '', Url.format(newUrlObject));
	    } else {
	        history.pushState(null, '', Url.format(newUrlObject));
	    }
	};
	
	exports.parseDifferentialUrlParameter = function getQuerySelectFromLocation() {
	    var location = arguments.length <= 0 || arguments[0] === undefined ? window.location : arguments[0];
	
	    var currentURL = Url.parse(location.toString());
	    var differentialSelectParam = QueryString.parse(currentURL.query).ds;
	    return differentialSelectParam ? JSON.parse(differentialSelectParam) : {};
	};

/***/ },

/***/ 2491:
/*!*************************************!*\
  !*** template of 1808 referencing  ***!
  \*************************************/
/***/ function(module, exports, __webpack_require__, __webpack_module_template_argument_0__, __webpack_module_template_argument_1__) {

	'use strict';
	
	exports.decode = exports.parse = __webpack_require__(__webpack_module_template_argument_0__);
	exports.encode = exports.stringify = __webpack_require__(__webpack_module_template_argument_1__);


/***/ },

/***/ 2492:
/*!*************************************!*\
  !*** template of 1994 referencing  ***!
  \*************************************/
/***/ function(module, exports, __webpack_require__, __webpack_module_template_argument_0__) {

	"use strict";
	
	//*------------------------------------------------------------------*
	
	module.exports = __webpack_require__(__webpack_module_template_argument_0__);

/***/ }

});
//# sourceMappingURL=expressionAtlasDifferentialExpression.bundle.js.map