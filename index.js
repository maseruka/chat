var express = require('express');
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var mysql = require('mysql');
var pool = mysql.createPool({
	connectionLimit: 1000000000,
	host: 'localhost',
	user: 'root',
  password: 'root',
	database: 'im',
});
pool.getConnection(function(err){
if(err) {
    console.log("Error in DB connection : "+err);    
} else {
    console.log("connect database ... nn");    
}
});
app.use(express.static(__dirname+ '/public'));
app.get("/", function (req, res) {
	res.sendFile(__dirname + "/index.html");
});


var chatbox = io.of('/chatbox');
chatbox.on('connection', function(socket){

var MEMBER = "";
var memberNo = 0;
var newMem = null;
var a = '';
var rooms = [];

socket.on("person1", function(data) {
  MEMBER = data.person;
   pool.query("SELECT * FROM members WHERE username = '"+MEMBER+"'", function (err, rows) {
   	if (err) { console.log("Failed"+err); return; 	}
       if (rows.length <= 0) {
       	 var member= {'username':MEMBER};
       	 pool.query("INSERT INTO members SET ?", member, function(err, rows){
            if (err) { console.log("failed to register member"+err); return;}
            console.log("registered member succefully "+MEMBER);
       	 });
       }else{
       	 console.log("User "+MEMBER+" is already a member");
       }
       // newMem = setInterval(function () {
         pool.query("SELECT * FROM members WHERE username != '"+MEMBER+"' AND id > '"+ memberNo +"' ", function (err, rows) {
         if (err) {
        console.log("Failed to get members"+err);
        return;
       }
       if (rows.length>0) {
        for (var i = 0; i < rows.length; i++) {
           memberNo = rows[i].id; 
        }
        socket.emit("members", {"members": rows});
      pool.query("SELECT * FROM messages WHERE (reciever = '"+MEMBER+"' AND  recieved = 'yes') OR (sender = '"+MEMBER+"' AND  recieved = 'yes') ORDER BY id DESC", function (err, rows) {
      console.log("going low man");
       if (err) {
        console.log("Failed to get messages"+err);
        return;
       }
       if (rows.length>0) {
       socket.emit("oldmessage", {"message": rows});
       }
          onConnect(MEMBER);
});
       }
        });
          // }, 100);

   });         
});









function onConnect(name){
console.log("Mem is"+name);
pool.query("SELECT * FROM chatrooms WHERE (user1 = '"+name+"') OR (user2 = '"+name+"')", function (err, rows) {
    if (err) { console.log("Failed"); return;   }
       if (rows.length <= 0) {
         // var room = {'user1':MEMBER, 'user2':friend, 'roomname':roomname};
         // pool.query("INSERT INTO chatrooms SET ?", room, function(err, rows){
         //    if (err) { console.log("failed to register chatroom "+err); return;}
         //    console.log("registered chatroom succefully "+roomname);
         // });
         console.log("no friends");
       }else{
         // console.log("chatroom "+rows[0].roomname+" already exists");
         for (var i = 0; i <rows.length; i++) {
          if(rows[i].user1==name){
            socket.join(rows[i].roomname);
            var roomsuck = {"roomname":rows[i].roomname, "roommate":rows[i].user2};
            socket.emit("chatroom", roomsuck);
          }else{
            socket.join(rows[i].roomname);
            var roomsuck = {"roomname":rows[i].roomname, "roommate":rows[i].user1};
            socket.emit("chatroom", roomsuck);
          }
         }
         
       } 
});
}











socket.on('typing', function (data) {
  socket.broadcast.to(data.room).emit("typing", {"from": MEMBER});
});

socket.on("sendMessage",function (data) {
  var message = {"sender":MEMBER,"reciever":data.reciever, "message":data.message, "sent": "yes", "type":data.type};
  pool.query("INSERT INTO messages SET ?", message, function(err, rows){
            if (err) { console.log("failed to send message"+err); return;}
            socket.emit("send_success");
         });

});
socket.on('messageOwner', function(data) {
var newMessage = setInterval(function() {
  var me = data.theowner;
    pool.query("SELECT * FROM messages WHERE (reciever = '"+MEMBER+"' AND recieved = 'no')", function (err, rows) {
       if (err) {
        console.log("Failed to get messages"+err);
        return;
       }
       if (rows.length>0) {
        if (socket.emit("message", {"message": rows})) {
           pool.query("UPDATE messages SET recieved = 'yes' WHERE (reciever = '"+MEMBER+"') AND recieved = 'no'", function (err, rows) {
          });
        }
       }
});
}, 100);
});

socket.on('oldMesages', function (data) {
  var owner=data.theowner;
      pool.query("SELECT * FROM messages WHERE (reciever = '"+MEMBER+"' AND sender = '"+owner+"' AND  recieved = 'yes') OR (reciever = '"+owner+"' AND sender = '"+MEMBER+"' AND  recieved = 'yes') ORDER BY id DESC", function (err, rows) {
       if (err) {
        console.log("Failed to get messages"+err);
        return;
       }
       if (rows.length>0) {
       socket.emit("oldmessage", {"message": rows})
       }
});
});

socket.on('disconnect', function () {
    socket.broadcast.emit("IsNotActive", {'person':MEMBER});
    clearInterval(newMem);
    clearInterval(a);
    console.log("user discconected");
  });

});

http.listen(1234, function() {
	console.log("listening on *:1234")
});






       //  pool.query("SELECT * FROM members WHERE id > '"+ memberNo +"' AND username != '"+MEMBER+"'" , function (err, rows) {
       //   if (err) {
       //  console.log("Failed to get new members"+err);
       //  return;
       // }
       // if (rows.length>0) {
       //  for (var i = 0; i < rows.length; i++) {
       //     memberNo = rows[i].id; 
       //  } 
       //  socket.emit("members", {"members": rows});
       // }

       //  });
      // setInterval(function() {
      //         var roomlength = io.nsps["/chatbox"].adapter.rooms[rows[0].roomname];
      //         if (roomlength==undefined) {
      //           return;
      //         }
      //         else if (roomlength.length==1){
      //          socket.emit("isNotActive");
      //         }
      //         else{
      //          socket.emit("isActive");
      //         }
      //        }, 1000);
