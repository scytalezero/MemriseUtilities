// ==UserScript==
// @name          MemriseUtilities
// @namespace     http://ligature.me
// @version       0.9
// @description   Various helper functions for Memrise.
// @homepageURL   https://github.com/scytalezero/MemriseUtilities
// @updateURL     https://github.com/scytalezero/MemriseUtilities/raw/master/MemriseUtilities.user.js
// @downloadURL   https://github.com/scytalezero/MemriseUtilities/raw/master/MemriseUtilities.user.js
// @match         http://*.memrise.com/course/*
// @copyright     2012+, ScytaleZero
// ==/UserScript==

if ($("li.active > a.tab").length === 0) {
  //This isn't a course levels page
  return;
}

var Wordlist = {};
var Promises = [];
var CourseTag = SanitizeTag($("h1.course-name").text().trim())

//Insert the terms extractor button
$("ul.nav-pills").append("<li><a id='WordListButton'>Word list</a></li>");
$("#WordListButton").click(SpiderLevels);

//Iterate through the levels and kick off the retrieves.
function SpiderLevels() {
  //Add our UI
  $("div.container-main").prepend("<div id='WordListContainer'><h2>Working</h2></div>");
  $("a.level").each(function(Index) {
    var URL = "http://www.memrise.com" + $(this).attr("href");
    console.log("Dispatching URL: " + URL);
    //if (Index > 0) return; //Debug
    Promises.push($.ajax({
      dataType: "html",
      url: URL
    }).done(ExtractTerms));
  });
  
  $.when.apply($, Promises).done(SpiderDone);
}

//All levels have been parsed and the wordlist is done.
function SpiderDone() {
  var WordlistText = "", LCV;
  
  console.log(Wordlist);
  //Add the wordlist text area.
  $("#WordListContainer").empty().append("<div><h2>Course Wordlist as TSV</h2><textarea id='Wordlist' style='width:800px; height:400px;'></textarea><p>&nbsp;</p></div>");
  for (var Level in Wordlist) {
    for (LCV=0; LCV<Wordlist[Level].length; LCV++) {
      WordlistText += Wordlist[Level][LCV].Word + "\t" + Wordlist[Level][LCV].Translation + "\t" + 
        CourseTag + "," + SanitizeTag(Level) + "\n";
    }
  }
  $("#Wordlist").val(WordlistText.trimRight());
}

//Pull words and definitions from a level page.
function ExtractTerms(Data) {
  var LevelName = $(Data).find("strong.level-number").text().trim();
  console.log("Level: " + LevelName);
  Wordlist[LevelName] = [];
  $(Data).find("div.text-text").each(function() {
    Wordlist[LevelName].push({
      "Word": $(this).find("div.col_a").text(),
      "Translation": $(this).find("div.col_b").text()
    });
  });
  $("#WordListContainer h2").append(".");
}

//Format text appropriately for LWT tags.
function SanitizeTag(Buffer) {
  var Tag = Buffer.replace(/[^\w]/g, "");
  if (Tag.length > 20) Tag = Tag.substring(0, 20);
  return Tag;
}
