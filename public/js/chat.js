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
  let output = msgs = divID = '';
  firebaseDatabaseReference.on('child_added', function(snapshot) {
    msgs = snapshot.val();
    if (msgs.username == sender) {
      divID = "sender-text";
    } else {
      divID = "receiver-text";
    }
    output += '<div id='+ divID +' class="chat-text ' + msgs.username + '">' + msgs.msg + '</div>';
    $('#chatbox').html(output);
    $("html, body").scrollTop($(document).height() - $(window).height());
  });
}
