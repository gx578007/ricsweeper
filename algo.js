/* get object */
var startObj = document.getElementById("start");
var dimObj = document.getElementById("dim");
var gameRegion = document.getElementById("gameRegion");

/* compute the proper dimension to put buttons */
var w = document.width;
var h = document.height*0.85;
var length = h;
if ( h > w ) /* ex: portrait orientation for mobile devices */
   length = w;
gameRegion.style.width = gameRegion.style.height = length;
var regionLength = function (size){
   return length/size;
}

startObj.addEventListener('click',function() { if (!isNaN(dimObj.value)) createGame(dimObj.value); });
dimObj.addEventListener('keypress',function(e) { if(e.keyCode==13 && !isNaN(dimObj.value)) createGame(dimObj.value); } );

/* global variables for readability */
var size, wideSize;
var count, clickedCount; // for incremental check of game results
var bombstatus = new Array(), clickedStatus = new Array(), tipStatus = new Array();
var markStatus = new Array();
var shift; // for traversing the nearby 3-by-3 grids
// color the tips of bomb number
var textColor = new Array("gray","blue","green","red","yellow","dark-green","brown","black","white");

var createGame = function(size_weak_type){
   size = Number(size_weak_type);
   wideSize = 2+size;
   shift = new Array(-1,1,wideSize,-wideSize,1+wideSize,1-wideSize,wideSize-1,-wideSize-1);
   clickedCount = count = 0;
   /* clear the buttons in the previous game */
   while (gameRegion.firstChild)
      gameRegion.removeChild(gameRegion.firstChild);
   reset(size);
}

/* reset bomb status, compute tips and create buttons*/
var reset = function(size){
   for ( var i = 0 ; i < wideSize ; ++i ){
      for ( var j = 0 ; j < wideSize ; ++j ){
         clickedStatus[i*wideSize+j] = false;
         if ( i==0 || j==0 || i==(1+size) || j==(1+size) ) bombstatus[i*wideSize+j] = false;
         else bombstatus[i*wideSize+j] = (Math.random()<0.2);
         if ( bombstatus[i*wideSize+j] )
            count++;
         tipStatus[i*wideSize+j] = 0;
         markStatus[i*wideSize+j] = 0;
      }
   }
   for ( var i = 1 ; i < 1+size ; ++i ){
      for ( var j = 1 ; j < 1+size ; ++j ){
         for ( var k = 0 ; k < shift.length ; ++k ){
            tipStatus[i*wideSize+j] += bombstatus[i*wideSize+j+Number(shift[k])];
         }
      }
   }
   var l = regionLength(size);
   for ( var i = 1 ; i < 1+size ; ++i ){
      for ( var j = 1 ; j < 1+size ; ++j ){
         var btn=document.createElement("button");
         btn.setAttribute('id',i*wideSize+j);
         btn.setAttribute('class', 'grid');
         btn.style.width = l;
         btn.style.height = l;
         gameRegion.appendChild(btn);
      }
      var br = document.createElement("br");
      gameRegion.appendChild(br);
   }
   for ( var i = 1 ; i < 1+size ; ++i ){
      for ( var j = 1 ; j < 1+size ; ++j ){
         document.getElementById(i*wideSize+j).addEventListener('click',function(){ compute(this);} ); // press event
         document.getElementById(i*wideSize+j).addEventListener('contextmenu',function(e){ e.preventDefault(); toggleMark(this); }, true); // mark event
      }
   }
}

/* compute the result of the event after pressing one button */
var compute = function(btn){
   var id = Number(btn.id);
   if ( bombstatus[id] == true){ // a bomb is pressed
      /* losing effect */
      for ( var i = 1 ; i < wideSize-1 ; ++i ){
         for ( var j = 1 ; j < wideSize-1 ; ++j ){
            if ( bombstatus[i*wideSize+j] ){
               var tmpId = i*wideSize+j;
               //$("#"+tmpId).hide("explode", {pieces:4}, 1000);
               document.getElementById(tmpId).innerHTML = "<img src='ricBig.jpg' height='125%'></img>";
               //$("#"+tmpId).show("explode", {pieces:4}, 1000);
            }
         }
      }
      $("#losingMsg").popup("open");
      lock();
   }else{ // do the press thing
      pressIt(btn);
      expand(btn);
   }
   if ( winCondition() ){ // uncover all the safe region
      // winning effect
      $("#winningMsg").popup("open");
      lock();
   }
}

var toggleMark = function(btn){
   var id = Number(btn.id);
   if ( !markStatus[id] )
      btn.innerHTML = "<img src='stop.png' height='70%'></img>";
   else
      btn.innerHTML = "";
   markStatus[id] = !markStatus[id];
}

/* let the pressed button presented as pressed */
var pressIt = function(btn){
   if ( btn == null )
      return;
   clickedStatus[Number(btn.id)] = true;
   btn.disabled = "disabled";
   clickedCount++;
   btn.innerHTML = tipStatus[Number(btn.id)];
   btn.style.color=textColor[btn.innerHTML];
   var widthStr = btn.style.width;
   var widthNumber = Number(widthStr.substring(0,widthStr.length-2));
   btn.style.fontSize = widthNumber/2 + "px";
}

/* if winning, show the position of all bombs */
var winCondition = function(){
   if ( clickedCount + count != size*size )
      return false;
   for ( var i = 1 ; i < wideSize-1 ; ++i ){
      for ( var j = 1 ; j < wideSize-1 ; ++j ){
         if ( bombstatus[i*wideSize+j] ){
            document.getElementById(i*wideSize+j).innerHTML = "<img src='ricBig.jpg' height='125%'></img>";
         }
      }
   }
   return true;
}

/* recursively expand the nearby region without bombs */
var expand = function(btn){
   if ( btn == null )
      return;
   var pos = Number(btn.id);
   for ( var k = 0 ; k < shift.length ; ++k ){ 
      var target = pos + Number(shift[k]);
      if ( markStatus[target] )
         return;
      if ( (tipStatus[target]==0) && !clickedStatus[target] && !bombstatus[target]){
         pressIt(document.getElementById(target));
         expand(document.getElementById(target));
      }else if ( (tipStatus[target]>0) && !clickedStatus[target] && !bombstatus[target] ){
         pressIt(document.getElementById(target));
      }
   }
}

/* if completing the game, make gameRegion invisualized. */
var lock = function(){
   for ( var i = 0 ; i < gameRegion.childNodes.length ; ++i ){
      gameRegion.childNodes[i].disabled = "disabled";
   }
}
