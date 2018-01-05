let sender = sessionStorage.getItem('USERNAME');
let receiver = sessionStorage.getItem('USER2');
let tableName = 'CHAT_';
if (sender < receiver) {
  tableName += (sender + receiver).toUpperCase();
} else {
  tableName += (receiver + sender).toUpperCase();
}

function getMessagsFromFirebase() {
  let firebaseDatabaseReference = firebase.database().ref('chat/' + tableName);
  let output = '',
  msgs = '';
  firebaseDatabaseReference.on('child_added', function(snapshot) {
    msgs = snapshot.val();
    if (msgs.username == sender) {
      output += '<div id="sender-text" class="chat-text ' + msgs.username + '">' + msgs.msg + '</div>';
    } else {
      output += '<div id="receiver-text" class="chat-text ' + msgs.username + '">' + msgs.msg + '</div>';
    }
    document.getElementById("chatbox").innerHTML = output;
  });
}
