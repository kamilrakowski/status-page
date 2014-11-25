var hosts		= getJSON('hosts.json');
var readyCount	= 0;
var redirectTo	= '';

function getJSON(path) {
	var Request = new XMLHttpRequest();
	Request.open("GET", path, false);
	Request.send();
	return JSON.parse(Request.responseText);
}

function testServer(server, cb) {
	var img = new Image();

	img.onload = function() {
		cb.call(this, img);
	};
	
	img.src = server;
}

function doDots(id) {
	if($('#' + id).length == 0) {
		return;
	}
	
	switch($('#' + id).text()) {
		case '':
			$('#' + id).text('.');
		break;
		case '.':
			$('#' + id).text('..');
		break;
		case '..':
			$('#' + id).text('...');
		break;
		case '...':
			$('#' + id).text('');
		break;
	}
	
	setTimeout(function() {doDots(id);}, 100); 
}

function checkIfFinished() {
	if(readyCount == hosts.length) {
		$('#checkAnnounce').html('Finished checking, you will now be redirected to <span class="redir">' + redirectTo[1] + '</span>.');
		$('#checkResults').remove();
		setTimeout(function() {
			window.location = redirectTo[0];
		}, 1000);
		return false;
	}
	setTimeout(checkIfFinished, 1100);
}

function initialise() {
	$('#head').after('<span id="checkAnnounce">Checking status of mirrors<span id="checkDots"></span></span>');
	
	setTimeout(function() {
		doDots('checkDots');
	}, 2); 
	
	setTimeout(function() {
		$('#checkAnnounce').after('<ul id="checkResults"></ul>');
	}, 4); 
	
	setTimeout(checkIfFinished, 3); 
	
	setTimeout(function() {
		$.each(hosts, function(ind, val) {
			++readyCount;
			testServer('http://' + val[1] + '/check.png', function _self(img) {
				if(img.naturalHeight === 15) {
					if(redirectTo.length == 0) {
						redirectTo = ['http://' + val[1], val[0]];
					}
					$('#checkResults').append('<li id="' + val[1] + '" class="online">' + val[0] + ' is online.</li>');
				} else {
					$('#checkResults').append('<li id="' + val[1] + '" class="offline">' + val[0] + ' is offline.</li>');
				}
			});
		});
	}, 4);
}

window.onload = initialise;
