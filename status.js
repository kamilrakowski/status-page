var sites		= getJSON('/sites.json');
var sitecount	= Object.keys(sites).length;
var ready		= false;

function getJSON(path) {
	var Request = new XMLHttpRequest();
	Request.open("GET", path, false);
	Request.send();
	return JSON.parse(Request.responseText);
}

function getStatusData(url) {
	var Request = new XMLHttpRequest();
	Request.open("GET", '/index.php?url=' + url, false);
	Request.send();
	return JSON.parse(Request.responseText);
}

function getServerType(arr) {
	for(var j = 0; j < arr.length; j++) {
		if(arr[j].match('Server:'))
			return j;
	}
	return -1;
}

function addStatusLine(name, url, response) {
	if(response == 200 || response == 302) {
		var status = 'online';
		var statusText = '<div style="display: inline-block; font-size: 20em;>WORLD WIDE ONLINE !</div>"';
		var responseCode = response;
	} else if(response == 'fail') {
		var status = 'offline';
		var statusText = 'Offline';
		var responseCode = 'FAIL';
	} else {
		var status = 'semionline';
		var statusText = 'Online';
		var responseCode = response;
	}
	
	$('#indicator').before('<tr class="' + status + ' statusBar"><td>' + name + '</td><td><a href="' + (/http(s):\/\//i.exec(url) ? url : 'http://' + url) + '" target="_blank">' + url + '</a></td><td><b>' + statusText + '</b></td><td>' + responseCode + '</td></tr>');
}

function getHTTPd(arr) {
	if(arr.length > 1)
		return arr[getServerType(arr)].replace('Server: ', '');
	else
		return '-1';
}

function getStatusValues(arr) {
	if(getHTTPd(arr).match(/iis/i)) {
		return [getHTTPd(arr), arr[0], arr[9]];
	} else if(getHTTPd(arr).match(/nginx/i)) {
		return [getHTTPd(arr), arr[0], arr[2]];
	} else {
		return [getHTTPd(arr), arr[0], arr[1]];
	}
}

function statusChecker() {
	$.each(sites, function(k, v) {
		serverData = getStatusValues(getStatusData(v));
		
		if(serverData[1].length)
			r = serverData[1].substring(9).replace(/\D/g, '');
		else
			r = 'fail';
			
		addStatusLine(k, v, r);
	});
	
	ready = true;
}

function retrieveIndicator() {
	if(ready) {
		$('#indicator').remove();
		$('#statusTable').append('<tr class="head" id="rescan"><td colspan="4"><a href="javascript:;" onclick="rescan();">Reload</a></td></tr>');
		return false;
	}
	
	switch($('#busy').text()) {
		case '':
			$('#busy').html('.');
		break;
		case '.':
			$('#busy').html('..');
		break;
		case '..':
			$('#busy').html('...');
		break;
		case '...':
			$('#busy').html('');
		break;
	}
	
	setTimeout(retrieveIndicator, 500);
}

function rescan() {
	ready = false;
	$('.statusBar').remove();
	$('#rescan').remove();
	setTimeout(initStatus, 1);
}

function initStatus() {
	$('#noscriptMessage').remove();
	$('#statusTable').append('<tr class="head" id="indicator"><td colspan="4">Retrieving status, Please wait<span id="busy"></span></td></tr>');
	retrieveIndicator();
	statusChecker();
}

window.onload = initStatus;
