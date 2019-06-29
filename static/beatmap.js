(function() {
  var mapset = {};
  setData.ChildrenBeatmaps.forEach(function(diff) {
    mapset[diff.BeatmapID] = diff;
  });
  console.log(mapset);
  function loadLeaderboard(b, m) {
    var wl = window.location;
    window.history.replaceState('', document.title,
      "/b/" + b + "?mode=" + m + wl.hash);
    api("scores", {
      mode : m,
      b : b,
      p : 1,
      l : 50,
    },
    function(data) {
      console.log(data);
      var tb = $(".ui.table tbody");
      tb.find("tr").remove();
      if (data.scores == null) {
        data.scores = [];
      }
      var i = 0;
      data.scores.forEach(function(score) {
        var user = score.user;
        tb.append($("<tr />").append(
          $("<td />").text("#" + ((page - 1) * 50 + (++i))),
          $("<td />").html("<a href='/u/" + user.id +
                                 "' title='View profile'><i class='" +
                                 user.country.toLowerCase() + " flag'></i>" +
                                 escapeHTML(user.username) + "</a>"),
          $("<td />").html(addCommas(score.score)),
          $("<td />").html(modbits.string(score.mods)),
          $("<td />").text(score.accuracy.toFixed(2) + "%"),
          $("<td />").text(addCommas(score.max_combo)),
          $("<td />").html(score.pp.toFixed(2))));
      });
    });
  }
  function changeDifficulty(bid) {
    // load info
    var diff = mapset[bid];

    // column 2
    $("#cs").html(diff.CS);
    $("#hp").html(diff.HP);
    $("#od").html(diff.OD);
    $("#passcount").html(addCommas(diff.Passcount));
    $("#playcount").html(addCommas(diff.Playcount));

    // column 3
    $("#ar").html(diff.AR);
    $("#stars").html(diff.DifficultyRating.toFixed(2));
    $("#length").html(timeFormat(diff.TotalLength));
    $("#drainLength").html(timeFormat(diff.HitLength));
    $("#bpm").html(diff.BPM);

    loadLeaderboard(bid, currentMode);
  }
  window.loadLeaderboard = loadLeaderboard;
  window.changeDifficulty = changeDifficulty;
  changeDifficulty(beatmapID);
  // loadLeaderboard(beatmapID, currentMode);
  $("#diff-menu .item")
    .click(function(e) {
      e.preventDefault();
      $(this).addClass("active");
      beatmapID = $(this).data("bid");
      changeDifficulty(beatmapID);
    });
  $("#mode-menu .item")
    .click(function(e) {
      e.preventDefault();
      $("#mode-menu .active.item").removeClass("active");
      $(this).addClass("active");
      currentMode = $(this).data("mode");
      loadLeaderboard(beatmapID, currentMode);
    });
})();
var modbits = {
  nomod : 0,
  nf : 1 << 0,
  ez : 1 << 1,
  ts : 1 << 2,
  hd : 1 << 3,
  hr : 1 << 4,
  dt : 1 << 6,
  ht : 1 << 8,
  nc : 1 << 9,
  fl : 1 << 10,
  so : 1 << 12,
};
modbits.from_string = function(str) {
  var mask = 0;
  str = str.toLowerCase();
  for (var property in modbits) {
    if (property.length != 2) {
      continue;
    }
    if (!modbits.hasOwnProperty(property)) {
      continue;
    }
    if (str.indexOf(property) >= 0) {
      mask |= modbits[property];
    }
  }
  return mask;
};
modbits.string = function(mods) {
  var res = Array();
  for (var property in modbits) {
    if (property.length != 2) {
      continue;
    }
    if (!modbits.hasOwnProperty(property)) {
      continue;
    }
    if (mods & modbits[property]) {
      res.push(property.toUpperCase());
    }
  }
  return res.join(",");
};
// time format (seconds -> hh:mm:ss notation)
function timeFormat(t) {
  var h = Math.floor(t / 3600);
  t %= 3600;
  var m = Math.floor(t / 60);
  var s = t % 60;
  var c = "";
  if (h > 0) {
    c += h + ":";
    if (m < 10) {
      c += "0";
    }
    c += m + ":";
  } else {
    c += m + ":";
  }
  if (s < 10) {
    c += "0";
  }
  c += s;
  return c;
}