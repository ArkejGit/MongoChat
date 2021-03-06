(function() {
	var element = function(id) {
		return document.getElementById(id);
	}

	//get elements
	var status = element('status');
	var messages = element('messages');
	var textarea = element('textarea');
	var username = element('username');
	var clearBtn = element('clearBtn');

	//set default status
	var statusDefault = status.textContent;

	var setStatus = function(s){
		//Set status
		status.textContent = s;
		if (!status.classList.contains('alert','alert-info')) status.classList.add('alert','alert-info');

		if(s != statusDefault) {
			var delay = setTimeout(function() {
				setStatus(statusDefault);
				console.log('test');
				status.classList.remove('alert','alert-info');
			}, 4000);
		}
	}

	// Connect to socket.io
	var socket = io.connect('http://127.0.0.1:4000');

	//Check for connection
	if (socket !== undefined) {
		console.log('Connected to socket')

		//Handle output
		socket.on('output', function(data){
			//console.log(data);
			if(data.length) {
				for (var i=0; i < data.length; i++) {
					//build out message div
					var message = document.createElement('div');
					message.setAttribute('class', 'chat-message');
					message.innerHTML = `<b>${data[i].name}:</b> <p>${data[i].message}</p>`;
					messages.appendChild(message);
					messages.insertBefore(message, messages.firstChild);
				}
			}
		});

		//Get status from server
		socket.on('status', function(data){
			//get message status
			setStatus((typeof data === 'object') ? data.message : data);

			//If status is clear, clear text
			if (data.clear) {
				textarea.value = '';
			}
		});

		//Handle input
		textarea.addEventListener('keydown', function(event){
			if (event.which === 13 && event.shiftKey == false) {
				//Emit to server input
				socket.emit('input', {
					name:username.value,
					message:textarea.value
				});

				event.preventDefault();
			}
		}) 

		//Handle Chat Clear
		clearBtn.addEventListener('click', function() {
			socket.emit('clear');
		});

		//Clear message
		socket.on('cleared', function(){
			messages.textContent = '';
		})
	}

})();