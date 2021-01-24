var overlay = {
  ewrap: null, // wrapper elemet
  
  init: function () {
    overlay.ewrap = document.createElement("div");   
    overlay.ewrap.id = "owrap";
    overlay.ewrap.style = "display:none; position:fixed; width:100%; height:100%; top:0; left:0; right:0; bottom:0; background-color:rgba(0, 0, 0, 0.8);    z-index:999999999; cursor:po";
    overlay.ewrap.addEventListener("click", overlay.hide);
    document.body.appendChild(overlay.ewrap);
  },

  show: function () {
    overlay.ewrap.style.display = "block"
  },
  
  hide: function () {
    overlay.ewrap.style.display = "none"
  }
};
overlay.init();
overlay.show();

