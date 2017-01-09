var person = "";
var friend = "";
var socket = null;
var timer = null;
function box(name){
    $("#"+friend+"message").hide();
    friend = name;
$("#"+friend+"message").show();
document.getElementById("imageFor"+friend).addEventListener("change", readFile, false);
}
$(function (){
  person = prompt("Enter your name");
  socket = io('/chatbox');
    $("#greetings").text("Hello "+person);
    socket.emit("person1", {"person": person});
    socket.on("members", function(data) {
      var list_members = "";
      var messageDivs = "";
      for (var i = 0; i < data.members.length; i++) {
        if(data.members[i].username != person){

        list_members = list_members + "<li  id='"+data.members[i].username+"'><a href='javascript:box(\""+data.members[i].username+"\")'>"+data.members[i].username+"</a></li>";

        messageDivs = messageDivs + "<div class='meme' id='"+data.members[i].username+"message'><h2 id='friend'>"+data.members[i].username+"</h2><p id='typingTo"+data.members[i].username+"' class='green'>Typing.....</p><!--   <p id='status' class='red'>Not active</p> --><div maxlength='900' id='typeMessageFor"+data.members[i].username+"' class='blablabla' contenteditable='true' oninput='typing(\""+data.members[i].username+"\")'></div><button id='sendTo"+data.members[i].username+"' onclick='sendMessage(\""+data.members[i].username+"\")'>Send</button>&nbsp;&nbsp;&nbsp;<img src='/emoji/1f62f.svg' id='emoji' onclick='addEmoji(\"1f62f.svg\")'>&nbsp;&nbsp;&nbsp;<img src='/emoji/1f604.svg' id='emoji' onclick='addEmoji(\"1f604.svg\")'>&nbsp;&nbsp;&nbsp;<img src='/emoji/1f605.svg' id='emoji' onclick='addEmoji(\"1f605.svg\")'>&nbsp;&nbsp;&nbsp;<img src='/emoji/1f606.svg' id='emoji' onclick='addEmoji(\"1f606.svg\")'>&nbsp;&nbsp;&nbsp;<img src='/emoji/1f615.svg' id='emoji' onclick='addEmoji(\"1f615.svg\")'><br>Send Image  <input type='file' id='imageFor"+data.members[i].username+"' onchange='pic(\""+data.members[i].username+"\")'><ul id='"+data.members[i].username+"messages'></ul></div>";
      }}
      $("#members").append(list_members);
      $("#messageDiv").append(messageDivs);
      $(".meme").hide();
      $(".green").hide();

    });
    socket.emit("messageOwner", {"theowner": person});
        socket.on("chatroom", function(data) {
      var roomname = data.roomname;
      var roommate = data.roommate;
      console.log();
      $("#"+roommate+"message").data("room", roomname);
      console.log($("#"+roommate+"message").data("room"));
    });
    socket.on("oldmessage", function(data) {
    var message = "";
      for (var i = 0; i < data.message.length; i++) {
        if (data.message[i].sender!=person) {
            if (data.message[i].type=="image") {
              $("#"+data.message[i].sender+"messages").prepend("<li  class='old' id="+data.message[i].id+"><p style='color: blue'>"+data.message[i].sender+"</p> : <img src="+data.message[i].message+" width='100' height='100'/></li>");
            }else{
              $("#"+data.message[i].sender+"messages").prepend("<li class='old' id="+data.message[i].id+" style='color: blue'>"+data.message[i].sender+" : "+data.message[i].message+"</li>");
        }}else{
           if (data.message[i].type=="image") {
              $("#"+data.message[i].reciever+"messages").prepend("<li  class='old' id="+data.message[i].id+"><p style='color: red'>"+data.message[i].sender+"</p> : <img src="+data.message[i].message+" width='100' height='100'/></li>");            }else{
              $("#"+data.message[i].reciever+"messages").prepend("<li class='old' id="+data.message[i].id+" style='color: red'>"+data.message[i].sender+" : "+data.message[i].message+"</li>");
        }
        }
      }
  });




socket.on("message", function(data) {
var message = "";
      for (var i = 0; i < data.message.length; i++) {
       if (data.message[i].type=="image") {
              $("#"+data.message[i].sender+"messages").prepend("<li  id="+data.message[i].id+"><p style='color: blue'>"+data.message[i].sender+"</p> : <img src="+data.message[i].message+" width='100' height='100'/></li>");
            }else{
          $("#"+data.message[i].sender+"messages").prepend("<li  id="+data.message[i].id+" style='color: blue'>"+data.message[i].sender+" : "+data.message[i].message+"</li>");
        }
      }
});

socket.on('typing', function (data) {
  clearTimeout(timer);
   timer = setTimeout(function () {
    console.log("stop type");
    $("#typingTo"+data.from).hide();
  },  1000);
 console.log("start type");
  $("#typingTo"+data.from).show();
});

});


   function sendMessage(to) {
    var wM = $("#typeMessageFor"+friend).html();
    var wM2 = wM.replace(/&nbsp;/g, ' ');
    var message = wM2.trim();
  if (message.length == 0) { alert("No message"); $("#typeMessageFor"+friend).text("");}
    else{
    var messageContent = {"reciever": to, "message": message, "type":"text"}; 
  socket.emit("sendMessage", messageContent, function () {
    alert("sent");
  });
  $("#"+friend+"messages").prepend("<li style='color: red'>"+person+" : "+message+"</li>");
  $("#typeMessageFor"+friend).text("");

}
}

function pic() {
 if (this.files && this.files[0]) {
    var FR= new FileReader();
    FR.onload = function(e) {
      var messageContent = {"reciever": friend, "message": e.target.result};
      socket.emit("sendMessage", messageContent);
      alert(friend);
      $("#"+friend+"messages").prepend("<li><p style='color: red'>"+person+"</p> : <img src="+e.target.result+" width='100' height='100'/></li>");

    };       
    FR.readAsDataURL( this.files[0] );
  }
}


function typing(to) {
var roomTo = $("#"+friend+"message").data("room");
socket.emit("typing", {"room":roomTo});
}
function addEmoji(e) {
  $("#typeMessageFor"+friend).append("<img src='/emoji/"+e+"' id='emojiClicked'>");
}


function readFile() {
  if (this.files && this.files[0]) {
    var FR= new FileReader();
    FR.onload = function(e) {
      var messageContent = {"reciever": friend, "message": e.target.result, "type":"image"};
      socket.emit("sendMessage", messageContent);
      $("#"+friend+"messages").prepend("<li><p style='color: red'>"+person+"</p> : <img src="+e.target.result+" width='100' height='100'/></li>");

    };       
    FR.readAsDataURL( this.files[0] );
  }
}
