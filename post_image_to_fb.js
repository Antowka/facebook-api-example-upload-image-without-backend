window.fbAsyncInit = function() {
    FB.init({
      appId      : '2119246578305281',
      cookie     : true,
      xfbml      : true,
      version    : 'v2.12'
    });
      
    FB.AppEvents.logPageView();   
  };

(function(d, s, id){
 var js, fjs = d.getElementsByTagName(s)[0];
 if (d.getElementById(id)) {return;}
 js = d.createElement(s); js.id = id;
 js.src = "https://connect.facebook.net/en_US/sdk.js";
 fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

//переопределяем метод для ХРОМА 
XMLHttpRequest.prototype.sendAsBinary = function(datastr) {
    function byteValue(x) {
        return x.charCodeAt(0) & 0xff;
    }
    var ords = Array.prototype.map.call(datastr, byteValue);
    var ui8a = new Uint8Array(ords);
    this.send(ui8a.buffer);
}

function postImage() {
	
	var comment = document.getElementById("comment").value;
	var fileImage = document.getElementById("image").files[0];
	postCanvasToFacebook(comment, fileImage.name);
}

function postImageToFacebook( authToken, filename, mimeType, imageData, message ) {
    // this is the multipart/form-data boundary we'll use
    var boundary = '----ThisIsTheBoundary1234567890';
    // let's encode our image file, which is contained in the var
    var formData = '--' + boundary + '\r\n'
    formData += 'Content-Disposition: form-data; name="source"; filename="' + filename + '"\r\n';
    formData += 'Content-Type: ' + mimeType + '\r\n\r\n';
    for ( var i = 0; i < imageData.length; ++i )
    {
        formData += String.fromCharCode( imageData[ i ] & 0xff );
    }
    formData += '\r\n';
    formData += '--' + boundary + '\r\n';
    formData += 'Content-Disposition: form-data; name="message"\r\n\r\n';
    formData += message + '\r\n'
    formData += '--' + boundary + '--\r\n';

    var xhr = new XMLHttpRequest();
    xhr.open( 'POST', 'https://graph.facebook.com/me/photos?access_token=' + authToken, true );
    xhr.onload = xhr.onerror = function() {
        console.log(xhr.responseText);
    };
    xhr.setRequestHeader( "Content-Type", "multipart/form-data; boundary=" + boundary );
    xhr.sendAsBinary(formData);
};

var context;
var centerX;
var img;
var authToken;

function postCanvasToFacebook(message, filename) {
	toDataURL(filename, function(data) {
		var encodedPng = data.substring(data.indexOf(',') + 1, data.length);
		var decodedPng = Base64Binary.decode(encodedPng);
		FB.getLoginStatus(function(response) {
		  if (response.status === "connected") {
			postImageToFacebook(response.authResponse.accessToken, filename, "image/png", decodedPng, message);
		  } else if (response.status === "not_authorized") {
			 FB.login(function(response) {
				postImageToFacebook(response.authResponse.accessToken, filename, "image/png", decodedPng, message);
			 }, {scope: "publish_actions"});
		  } else {
			 FB.login(function(response)  {
				postImageToFacebook(response.authResponse.accessToken, filename, "image/png", decodedPng, message);
			 }, {scope: "publish_actions"});
		  }
		 });
	});
};

function toDataURL(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    var reader = new FileReader();
    reader.onloadend = function() {
      callback(reader.result);
    }
    reader.readAsDataURL(xhr.response);
  };
  xhr.open('GET', url);
  xhr.responseType = 'blob';
  xhr.send();
}