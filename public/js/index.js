let usersRef = firebase.database().ref('users');

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
  let newUser = {
    username: username,
    email: email
  };
  usersRef.push().set(newUser);
  sessionStorage.setItem('USERNAME', username);
  sessionStorage.setItem('USEREMAIL', email);
}

// UPDATE UI(DIALOG) AFTER USER LOGIN/SIGNUP
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // USER IS SIGNED IN
    $(".login-cover").hide();
    let loginDialog = document.querySelector('#login-dialog');
    if (!loginDialog.showModal) {
      dialogPolyfill.registerDialog(loginDialog);
    }
    loginDialog.close();
    updateUIAfterLogin(user.email);
  } else {
    // NO USER IS SIGNED IN
    $(".login-cover").show();
    let loginDialog = document.querySelector('#login-dialog');
    if (!loginDialog.showModal) {
      dialogPolyfill.registerDialog(loginDialog);
    }
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
  getAndUpdateUsernameFromFirebaseDB(email);
  $("#email-area").text(sessionStorage.getItem('USEREMAIL'));
  getAndUpdateUsersFromFirebaseDB(email);
}

// GET AND UPDATE USERLIST FROM FIREBASE DB 'users'
function getAndUpdateUsersFromFirebaseDB(email) {
  let output = '',
    user = '';
  usersRef.on('child_added', function(snapshot) {
    user = snapshot.val();
    if (user.email != email)
      output += '<button onclick="chatWindow(this)" id="' + user.username + '" class="mdl-navigation__link"><i class="material-icons">account_circle</i> &nbsp;' + user.username + '</button>';
    $('#active-users').html(output);
  });
}

// GET AND UPDATE USERNAME FROM FIREBASE DB 'users'
function getAndUpdateUsernameFromFirebaseDB(pEmail) {
  usersRef.on('child_added', function(snapshot) {
    user = snapshot.val();
    if (user.email == pEmail) {
      sessionStorage.setItem('USERNAME', user.username);
      $("#username-area").text(sessionStorage.getItem('USERNAME'));
    }
  });
}

// ON LOGOUT BUTTON CLICK
$("#btn-logout").click(
  function() {
    firebase.auth().signOut().catch(function(error) {
      alert(error.message);
    });
    $("#text-name").val('');
    $("#text-email").val('');
    $("#text-password").val('');
    clearSession();
    location.reload();
  }
);

// POPULATE CHAT WINDOW
function chatWindow(username) {
  $("#chat-window").show();
  $("#chat-uname").text(username.id);

  sessionStorage.removeItem('USER2');
  sessionStorage.removeItem('TABLENAME');
  sessionStorage.setItem('USER2', username.id);
  updateTableName(username.id);
  document.getElementById('chat-frame').contentWindow.location.reload();
}

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
  let chatRef = firebase.database().ref('chat/' + tableName);
  gChatRef = chatRef;
  //sessionStorage.setItem('TABLENAME', tableName);
}

// SEND NEW MESSAGE
$('#msg-form').submit(function(e) {
  e.preventDefault();
  let msg = $('#chat-input').val();
  let newMsg = {
    username: sessionStorage.getItem('USERNAME'),
    msg: msg
  };
  if (msg)
    gChatRef.push().set(newMsg);
  $('#chat-input').val('');
});

// CLOSE CHAT WINDOW
$("#btn-close").click(
  function() {
    $("#chat-window").hide();
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
