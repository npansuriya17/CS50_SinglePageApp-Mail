
document.addEventListener('DOMContentLoaded', function() {

		load_mailbox('inbox');

function compose_email() {
	// Show compose view and hide other views
	document.querySelector('#emails-view').style.display = 'none';
	document.querySelector('#compose-view').style.display = 'block';
	document.querySelector('#email-view').style.display = 'none';

	// Clear out composition fields
	document.querySelector('#compose-recipients').value = '';
	document.querySelector('#compose-subject').value = '';
	document.querySelector('#compose-body').value = '';
}

function send_mail() {
	var recipients = document.querySelector('#compose-recipients').value;
	var subject = document.querySelector('#compose-subject').value;
	var body = document.querySelector('#compose-body').value;
	
	if (recipients != '') {
		fetch(`/emails`, {
			method: 'POST',
			body: JSON.stringify({
				recipients: recipients,
				subject: subject,
				body: body
			})
		})
		.then(response => response.json())
		.then(result => {
			console.log(result);
			var mes = document.querySelector('#message');
			//in case for any reason the email was not delivered
			if (result['error']){
				mes.innerHTML = `User with ${recs[mail]} does NOT exist`;
				mes.style.color = 'red';
			}
			else{
				mes.innerHTML = '';
				load_mailbox('sent');
			}
		});
		
	}
	else {
		var mes = document.querySelector("#message");
		mes.innerHTML = "Please enter one or more email addresses.";
		mes.style.color = "red";
    }
}

function load_mailbox(mailbox) {
	// Show the mailbox and hide other views
	document.querySelector('#emails-view').style.display = 'block';
	document.querySelector('#compose-view').style.display = 'none';
	document.querySelector('#email-view').style.display = 'none';
	
	// Show the mailbox name
	var email_view = document.querySelector('#emails-view')
	email_view.innerHTML = '';
	email_view.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
	
	fetch(`/emails/${mailbox}`)
	.then(response => response.json())
	.then(emails => {
		if (emails.length == 0) {
			email_view.innerHTML = '<p style = "font-size: large; font-weight: bold;">Nothing to see here :(</p>';
		}
		else {
			for (email in emails) {
				var mail = document.createElement("div");
				var sender = document.createElement('h5');
				var sub = document.createElement('p');
				var time = document.createElement('p');
				var id = document.createElement('p');

				id.innerHTML = emails[email]['id'];
				id.style.display = 'none';
				
				sender.innerHTML = emails[email]['sender'];
				if (emails[email]['subject'] == '') {
					sub.innerHTML = 'No Subject';
					sub.style.color = 'red';
				}
				else {
					sub.innerHTML = emails[email]['subject'];
				}
				time.innerHTML = emails[email]['timestamp'];

				mail.style.borderStyle = 'solid';
				mail.style.borderColor = 'black';
				mail.style.borderWidth = '0.1rem';
				mail.style.marginBottom = '0.2rem';
				
				if (emails[email]['read'] == true) {
					mail.style.backgroundColor = 'lightgray';
				}
				else {
					mail.style.backgroundColor = 'white';
				}
				
				mail.classList.add('container');
				mail.classList.add('mail');

				sender.style.display = 'inline-block';
				sender.style.margin = '1rem';

				sub.style.display = 'inline-block';
				sub.style.margin = '1rem';

				time.style.display = 'inline-block';
				time.style.margin = '1rem';
				time.style.float = 'right';
				time.style.color = 'gray';

				email_view.appendChild(mail);
				mail.appendChild(sender);
				mail.appendChild(sub);
				mail.appendChild(time);
				mail.appendChild(id);

				//when a user clicks on an email in the mailbox
				mail.addEventListener('click', () => load_email());
				sub.addEventListener('click', () => load_email());
				time.addEventListener('click', () => load_email());
				sender.addEventListener('click', () => load_email());
			}
		}
	});
}

//shows the email you clicked on from mailbox
function load_email() {
	event.stopImmediatePropagation();
	//keeping only the email-view and hiding the rest
	document.querySelector('#emails-view').style.display = 'none';
	document.querySelector('#compose-view').style.display = 'none';
	mail_view = document.querySelector('#email-view');
	mail_view.style.display = 'block';
	mail_view.innerHTML = '';
	
	var tar = event.target;
	
	//if the element clicked on is not div, we choose its parent (which is the div)
	if (!(tar.tagName == 'DIV')) {
		tar = tar.parentElement;
	}
	var c = tar.children;
	var id = c[3].innerHTML;
	
	mail_view.innerHTML = '';
	fetch(`/emails/${id}`)
	.then(response => response.json())
	.then(email => {
		var div = document.createElement('div');
		div.classList.add('container');
		div.classList.add('jumbotron');
		
		var sub = document.createElement('h3');
		sub.innerText = email['subject'];
		var sender = document.createElement('h5');
		sender.innerText = `From: ${email['sender']}`;
		var body = document.createElement('p');
		body.innerText = email['body'];
		var time = document.createElement('p');
		time.innerText = email['timestamp'];
		
		time.style.color = 'gray';
		body.style.padding = '2rem';
		body.style.backgroundColor = 'lightgray';
		
		//adding the elements to the div
		div.appendChild(sub);
		div.appendChild(sender);
		div.appendChild(time);

		mail_view.appendChild(div);
		mail_view.appendChild(body);

		//set the read attribute true, if false
		if (email['read'] == false) {
			fetch(`/emails/${id}`, {
				method: 'PUT',
				body: JSON.stringify({
				read: true
				})
			})
		}

		//Adding buttons
		var archive = email['archived'];
		var btn = document.createElement('button');
		var reply = document.createElement('button');

		//if the email is already archived
		if (archive) {
			btn.innerText = 'Unarchive';
		}
		else {
			btn.innerText = 'Archive';
		}
		reply.innerText = 'Reply';

		//bootstrap sheet
		btn.classList.add('btn-primary');
		btn.classList.add('btn');
		reply.classList.add('btn-primary');
		reply.classList.add('btn');
		
		//adding the buttons to HTML Page
		mail_view.appendChild(btn);
		mail_view.appendChild(reply);
		
		//archive button function
		btn.addEventListener('click', () => {
			fetch(`/emails/${id}`, {
				method: 'PUT',
				body: JSON.stringify({
					archived: !archive
				})
			});
			load_mailbox('archive');
		});

		//reply button function
		reply.addEventListener('click', () => {
			compose_email();
			document.querySelector('#compose-recipients').value = email['sender'];
			document.querySelector('#compose-body').value = `On ${email['timestamp']}, ${email['sender']} wrote: ${email['body']}`;
			if (email['subject'].search('Re:')) {
				document.querySelector('#compose-subject').value = email['subject'];
			}
			else {
				document.querySelector('#compose-subject').value = `Re: ${email['subject']}`;
			}
		});
		
	});
}