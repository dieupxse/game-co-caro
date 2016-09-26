var myAppRoot = new Firebase("https://jacob-demo-chat-app.firebaseio.com/");
var myAppChat = myAppRoot.child('chat');
var myAppRoom = myAppRoot.child('room');
var myAppGuest = myAppRoot.child('guest');
var myAppCountOnline = myAppRoot.child('online');
var yourId;
var yourRoomId;
$(function() {
	countOnline();
	getUser();
	$('#result').niceScroll({
		cursorwidth: 7,
		cursoropacitymax: 0.7
	});
	$("#result").animate({ scrollTop: $('#result').prop("scrollHeight")}, 1000);
});
//get userinfo mation and insert to database when new user visited
function getUser() {
	//call ajax to get user information from freegeoip
	$.getJSON('//freegeoip.net/json/?callback=?', function(data) {
	  	var user = {
	  			ip: data.ip,
	  			isChating : false,
	  			roomId: "",
	  			data: data
	  		};
	  	//push user data to firebase
  		var myAppGuestRef = myAppGuest.push(user,function() {
  			//register event onDisconnect to remove user when user left our site
  			myAppGuest.child(yourId).onDisconnect().remove(function() {
		  		initUserToChat(yourId);
		  		$('#yourId').text(yourId);
		  		findTheStranger(yourId);
  			});
  		});
  		yourId = myAppGuestRef.key();
	});
}

//init user data - register even listener 'value' to firebase
function initUserToChat(yourId) {
	saySomething('Click New button to start chat!','info');
	//remove previous even listener to prevent duplicate call
	myAppGuest.child(yourId).off('value');

	//register event listener to when data change to firebase
	myAppGuest.child(yourId).on('value',function(snap) {
		console.log('data user change fire, id = '+yourId);
		var yourData = snap.val();
		$('#yourId').text(yourId);
		if(yourData && yourData!=='null') {
			if(yourData.isChating && yourData.roomId!=='') {
				$('#roomId').text(yourData.roomId);
			}
		}
	});
}

//init room chat data - register even lister 'value' to firebase
function initRoomToChat(yourRoomId) {
	//remove previous even listener to prevent duplicate call
	myAppRoom.child(yourRoomId).off("value");
	//register event listener to when data change to firebase
	myAppRoom.child(yourRoomId).on('value',function(r) {
		console.log('data room change fire, roomId = '+yourRoomId);
		var room = r.val();
		if(room&& room!=='null') {
			//if this room not availble - mean this room have two people join
			if(!room.isAvailable) {
				//say hello to chat
				sayHello(yourRoomId);
				if(room.you!=='') {
					//update user information
					myAppGuest.child(room.you).update({isChating:true, roomId: yourRoomId});
					//check if you are host or not
					if(yourId==room.you) {
						$('#guestId').text(room.guest);
					}
				}
				if(room.guest!=='') {
					//update user information
					myAppGuest.child(room.guest).update({isChating: true, roomId: yourRoomId});
					//check if you are guest or not
					if(yourId==room.guest) {
						$('#guestId').text(room.you);
					}
				}
			} 
		}
	});

	myAppRoom.off("child_removed");
	//register event listener when data was removed from firebase
	myAppRoom.on('child_removed',function(snap) {
		var room  = snap.val();
		//remove previous event listener on this child
		myAppChat.child(snap.key()).off('child_added');
		//register event listener to delele chat when user left our site
		myAppChat.child(snap.key()).onDisconnect().remove();
		//update user information
		if(room && room!=='null') {
			if(room.you!=='') {
				//myAppGuest.child(room.you).update({isChating: true, roomId: ''});
			}
			if(room.guest!=='') {
				//myAppGuest.child(room.guest).update({isChating: true, roomId: ''});
			}
			if(yourId===room.you || yourId===room.guest) {
				$('#guestId').text('');
				$('#roomId').text('');
				saySomething('Guest has left the conversation!',"danger");
				disableForm();
			}
		}
	});
}

//count visitor online in realtime
function countOnline() {
	//count online people
	var countOnline = myAppCountOnline.child('count');
	myAppGuest.on('value',function(sna) {
		countOnline.transaction(function(curentData) {
			return sna.numChildren();
		});
	});
	countOnline.on('value',function(online) {
		$('#totalOnline').text(online.val());	
	});
}

//init function find the stranger to chat
function findTheStranger(yourId) {
	$('#findStranger').on('click',function(e) {
		e.preventDefault();
		//get your information form firebase
		myAppGuest.child(yourId).once('value',function(s) {
			var item = s.val();
			//check if you already join some room then leave this room and find an other
			if(item.roomId!=='') {
				myAppRoom.child(item.roomId).remove(function() {
					console.log('remove existed room');
					item.roomId = "";
					item.isChating = false;
					myAppGuest.child(yourId).update({roomId: '', isChating: false},function() {
						myAppRoom.orderByChild("isAvailable").equalTo(true).limitToLast(1).once('value',function(snap) {
							//if there are rooms available then join to its - you are guest now
							if(snap.numChildren()>0) {
								snap.forEach(function(roomItem) {
									var room = roomItem.val();
									var roomId = roomItem.key();
									if(room&& room!=='null') {
										if(room.you!==yourId) {
											joinToRoom(yourId,roomId);;	
										} 
									} 
									
								});
							} else {
								//create new room - you are host now
								createRoom(yourId);
							}
						});
					});
				});
			} else {
				//if you did not join any room then find or create the new one.
				myAppRoom.orderByChild("isAvailable").equalTo(true).limitToLast(1).once('value',function(snap) {
					//if there are rooms availble then join to its - you are guest now
					if(snap.numChildren()>0) {
						snap.forEach(function(roomItem) {
							var room = roomItem.val();
							var roomId = roomItem.key();
							if(room&& room!=='null') {
								if(room.you!==yourId) {
									joinToRoom(yourId,roomId);;	
								} 
							} 
						});	
					} else {
						//if no room available then create it - you are host now
						createRoom(yourId);
					}
					
				});
			}
			
		});
	});
	
}

//join to existed room - you are guest
function joinToRoom(yourId,roomId) {
	yourRoomId = roomId;
	$('#roomId').text(roomId);roomId
	myAppRoom.child(roomId).once('value',function(snap) {
		var room = snap.val();
		var roomId = snap.key();
		if(room && room!=='null') {
			myAppRoom.child(roomId).update({isAvailable: false, guest: yourId},function() {
				myAppGuest.child(yourId).update({isChating:true, roomId: roomId});
				myAppRoom.child(roomId).onDisconnect().remove(function() {
					initRoomToChat(roomId);
				});
				if(room.you!=='') {
					myAppGuest.child(room.you).update({isChating:true, roomId: roomId});
				}
			});
		}
	});
}

//create new room - you are host
function createRoom(yourId) {
	var room = {
		isAvailable : true,
		you: yourId,
		guest: ''
	};
	var myAppRoomRef = myAppRoom.push(room, function() {
		myAppGuest.child(yourId).update({isChating: false, roomId: yourRoomId}, function() {
			myAppRoom.child(yourRoomId).onDisconnect().remove(function() {
				initRoomToChat(yourRoomId);
			});
		});
		
	});
	yourRoomId = myAppRoomRef.key();
	$('#roomId').text(yourRoomId);
	$('#result').html('');
	saySomething('Waiting for someone to join to conversation <i class="fa fa-refresh fa-spin"></i>','warning');
}

//init chat form for special room
function chat(yourRoomId) {
	var chatForm = $('#chatform');
	var result = $('#result');
	chatForm.find('button').removeAttr('disabled');
	chatForm.find('input[type=text]').removeAttr('disabled');
	
	//submit chatform
	chatForm.on('submit',function(e) {
		e.preventDefault();
		if($('#yourId').text()=='' || $('#guestId').text()=='' || $('#roomId').text()=='') {
			alert('Please find someone to chat with or waiting someone to join!');
			$('#text').focus();
			return false;
		}
		var node = {
				yourId: $('#yourId').text(),
				guestId: $('#guestId').text(),
				message: {
					msg: $('#text').val(),
					time: Firebase.ServerValue.TIMESTAMP
				}
			};
		myAppChat.child(yourRoomId).push().set(node,function() {
			$('#text').val('');
		});
	});
	initChatResult(yourRoomId);
}

//display chat result for specific room
function initChatResult(yourRoomId) {
	myAppChat.off('child_added');
	
	myAppChat.child(yourRoomId).on('child_added',function(snap,prevkey) {
		var chatItem = snap.val();
		console.log('chat post call '+prevkey);
		appendChat(chatItem);
	});
	myAppChat.child(yourRoomId).onDisconnect().remove();
} 

//append chat to display area
function appendChat(chatItem) {
	console.log('append chat call ');
	var html="";
	var who = "";
	var icon = "";
	if(yourId==chatItem.yourId) {
		who = "you";
		icon = "<i class='fa fa-user'></i> ";
	} else {
		who = "guest";
		icon = "<i class='fa fa-user-secret'></i> ";
	}
	var msg = chatItem.message.msg;
	var date = new Date(chatItem.message.time);
	html+='<div class="chat-item '+who+'">';
	html+='<div class="chat-meta"><span class="name">'+icon+who+'</span> <time><i class="fa fa-clock-o"></i> '+date.customFormat( "#DD#/#MM#/#YYYY# #hh#:#mm#:#ss#" )+'</time></div>';
	html+='<div class="chat-content">'+htmlEntities(msg)+'</div>';
	html+='</div><div class="clearfix"></div>';
	$('#result').append(html);
	$("#result").animate({ scrollTop: $('#result').prop("scrollHeight")}, 1000);
}
//say hello
function sayHello(yourRoomId) {
	$('#result').html('');
	var html="";
	html+='<div class="botItem info"><span class="name">Bot</span>: Type "Hello" to start chating</div>';
	$('#result').append(html);
	$("#result").animate({ scrollTop: $('#result').prop("scrollHeight")}, 1000);
	chat(yourRoomId);
}
//saysome thing in chatbox
function saySomething(text,css="") {
	var html="";
	html+='<div class="botItem you '+css+'"><span class="name">Bot</span>: '+text+'</div>';
	$('#result').append(html);
	$("#result").animate({ scrollTop: $('#result').prop("scrollHeight")}, 1000);
}
//disable form element if you do not join any room or the room do not have enough people to chat
function disableForm() {
	$('#chatform').find('button[type=submit]').attr('disabled','disabled');
	$('#chatform').find('input[type=text]').attr('disabled','disabled');
}
//escape html string
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

//custom format time
Date.prototype.customFormat = function(formatString){
  var YYYY,YY,MMMM,MMM,MM,M,DDDD,DDD,DD,D,hhhh,hhh,hh,h,mm,m,ss,s,ampm,AMPM,dMod,th;
  YY = ((YYYY=this.getFullYear())+"").slice(-2);
  MM = (M=this.getMonth()+1)<10?('0'+M):M;
  MMM = (MMMM=["January","February","March","April","May","June","July","August","September","October","November","December"][M-1]).substring(0,3);
  DD = (D=this.getDate())<10?('0'+D):D;
  DDD = (DDDD=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][this.getDay()]).substring(0,3);
  th=(D>=10&&D<=20)?'th':((dMod=D%10)==1)?'st':(dMod==2)?'nd':(dMod==3)?'rd':'th';
  formatString = formatString.replace("#YYYY#",YYYY).replace("#YY#",YY).replace("#MMMM#",MMMM).replace("#MMM#",MMM).replace("#MM#",MM).replace("#M#",M).replace("#DDDD#",DDDD).replace("#DDD#",DDD).replace("#DD#",DD).replace("#D#",D).replace("#th#",th);
  h=(hhh=this.getHours());
  if (h==0) h=24;
  if (h>12) h-=12;
  hh = h<10?('0'+h):h;
  hhhh = hhh<10?('0'+hhh):hhh;
  AMPM=(ampm=hhh<12?'am':'pm').toUpperCase();
  mm=(m=this.getMinutes())<10?('0'+m):m;
  ss=(s=this.getSeconds())<10?('0'+s):s;
  return formatString.replace("#hhhh#",hhhh).replace("#hhh#",hhh).replace("#hh#",hh).replace("#h#",h).replace("#mm#",mm).replace("#m#",m).replace("#ss#",ss).replace("#s#",s).replace("#ampm#",ampm).replace("#AMPM#",AMPM);
};
