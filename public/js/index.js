let chatTableArray = [], windowStatus = false;

// RETURN REFERENCE TO 'users' COLLECTION
function usersRef(){
  return firebase.database().ref('users');
}

// ON SIGNUP BUTTON CLICK
$("#btn-signup-two").click(
  function() {
    let username = $("#text-name").val();
    let email = $("#text-email").val();
    let password = $("#text-password").val();

    if (email != "" && password != "" && username != "") {
      firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
        $("#login-error").show().text(error.message);
      });
      let user = firebase.auth().currentUser;
      if (user) {
        user.updateProfile({
          displayName: username
        })
      }
      updateNewUserInFirebaseDB(username, email);
      updateUIAfterLogin(email);
    }
  }
);

// UPDATE NEW USERS IN 'users' COLLECTION
function updateNewUserInFirebaseDB(username, email) {
  usersRef().push().set({
    username: username,
    email: email,
    isActive: true
  });
  sessionStorage.setItem('USERNAME', username);
  sessionStorage.setItem('USEREMAIL', email);
}

// UPDATE UI(DIALOG) AFTER USER LOGIN/SIGNUP
firebase.auth().onAuthStateChanged(function(user) {
  let loginDialog = document.querySelector('#login-dialog');
  if (!loginDialog.showModal) {
    dialogPolyfill.registerDialog(loginDialog);
  }
  if (user) {
    // USER IS SIGNED IN
    $(".login-cover").hide();
    loginDialog.close();
    updateUIAfterLogin(user.email);
  } else {
    // NO USER IS SIGNED IN
    $(".login-cover").show();
    loginDialog.showModal();
  }
});

// ON LOGIN BUTTON CLICK
$("#btn-login-one").click(
  function() {
    let email = $("#text-email").val();
    let password = $("#text-password").val();

    if (email != "" && password != "") {
      firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
        $("#login-error").show().text(error.message);
      });
    }
  }
);

// UPDATE UI AFTER USER SIGNIN
function updateUIAfterLogin(email) {
  sessionStorage.setItem('USEREMAIL', email);
  setUserStatus(true);
  getAndUpdateUsernameFromFirebaseDB(email);
  $("#email-area").text(email);
  getAndUpdateUsersFromFirebaseDB(email);
}

// GET AND UPDATE USERLIST FROM FIREBASE DB 'users'
function getAndUpdateUsersFromFirebaseDB(email) {
  let output = user = '';
  usersRef().on('child_added', function(snapshot) {
    user = snapshot.val();
    if (user.email != email){
      output += '<button onclick="chatWindow(this.id, '+ user.isActive +')" id="' + user.username + '" class="mdl-navigation__link"><i id="circle-' + user.username + '" class="material-icons status-'+ user.isActive +'">account_circle</i> &nbsp;' + user.username + ' <i id="status-' + user.username + '" </button>';
    }
    $('#active-users').html(output);
  });
}

// GET AND UPDATE USERNAME FROM FIREBASE DB 'users'
function getAndUpdateUsernameFromFirebaseDB(pEmail) {
  usersRef().on('child_added', function(snapshot) {
    user = snapshot.val();
    if (user.email == pEmail) {
      sessionStorage.setItem('USERNAME', user.username);
      $("#username-area").text(sessionStorage.getItem('USERNAME'));
    }
  });
}

// USER ONLINE STATUS
function setUserStatus(status){
  let email = sessionStorage.getItem('USEREMAIL');
  if(email){
    usersRef().on('child_added', function(snapshot) {
      let parentKey = snapshot.key;
      let user = snapshot.val();
      if (user.email == email) {
        firebase.database().ref("/users/" + parentKey).update({ isActive: status });
        console.log(user.email + ' isActive set to ' + user.isActive);
      }
    });
  }
}

// LOGOUT HELPER FN
function logoutUser(){
  setUserStatus(false);
  firebase.auth().signOut().catch(function(error) {
    alert(error.message);
  });
  clearSession();
}

// ON LOGOUT BUTTON CLICK
$("#btn-logout").click(
  function() {
    logoutUser();
    location.reload();
  }
);

// ON WINDOW CLOSED
$(window).on('unload', function(){
  if(sessionStorage.getItem('USERNAME'))
    logoutUser();
});


// POPULATE CHAT WINDOW
function chatWindow(receiver, status) {
    $("#chat-window").show();
    $("#chat-uname").text(receiver);
    if(status){
      $("#chat-header").css({"background-color": "#55c50b"});
    }else{
      $("#chat-header").css({"background-color": "#000"});
    }
  
    let lastReciever = sessionStorage.getItem('USER2');
    if(receiver != lastReciever){
      sessionStorage.setItem('USER2', receiver);
      updateTableName(receiver);  
    }
    if(!windowStatus || (receiver != lastReciever && windowStatus)){
      windowStatus = true;
      document.getElementById('chat-frame').contentWindow.location.reload();
    }
        
}

// NOTIFY ON MESSAGE RECIEVE
firebase.database().ref('chat').on('value', function(snapshot) {
  let username = sessionStorage.getItem('USERNAME');
  let tn = snapshot.val();
  for(let key in tn) {
    let count = 0;
    firebase.database().ref('chat/' + key).on('child_added', function(snapshot) {
      let msgR = snapshot.val(); count++;
      let receiver = sessionStorage.getItem('USER2');
      if(msgR.username != username 
        && key.indexOf(username.toUpperCase()) != -1 
        && chatTableArray[key]
        && count > chatTableArray[key]){
        chatWindow(msgR.username, true);
      }
    });
    chatTableArray[key] = count;
  }
});  

// HELPER FUNCTION TO UPDATE TABLE NAME FOR CHAT
let gChatRef;
function updateTableName(receiver) {
  let sender = sessionStorage.getItem('USERNAME');
  let tableName = 'CHAT_';
  if (sender < receiver) {
    tableName += (sender + receiver).toUpperCase();
  } else {
    tableName += (receiver + sender).toUpperCase();
  }
  gChatRef = firebase.database().ref('chat/' + tableName);
}

// SEND NEW MESSAGE
$('#msg-form').submit(function(e) {
  e.preventDefault();
  gChatRef.push().set({
    username: sessionStorage.getItem('USERNAME'),
    msg: $('#chat-input').val()
  });
  $('#chat-input').val('');
});

// CLOSE CHAT WINDOW
$("#btn-close").click(
  function() {
    $("#chat-window").hide();
    windowStatus = false;
  }
);

// CLEAR/DELETE SESSION
function clearSession() {
  sessionStorage.clear();
}

$("#btn-signup-one").click(
  function() {
    $("#name-space").show();
    $("#signup-btn-two").show();
    $("#login-btn-two").show();
    $("#login-btn-one").hide();
    $("#signup-btn-one").hide();
  }
)


$("#btn-login-two").click(
  function() {
    $("#name-space").hide();
    $("#signup-btn-two").hide();
    $("#login-btn-two").hide();
    $("#login-btn-one").show();
    $("#signup-btn-one").show();
  }
)
