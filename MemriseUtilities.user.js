// ==UserScript==
// @name          MemriseUtilities
// @namespace     http://ligature.me
// @version       1.1.0
// @grant         none
// @description   Various helper functions for Memrise and some other EO sites.
// @icon          http://cdn.altrn.tv/icons/memrise_10088.png?width=50&height=50&mode=crop&anchor=middlecenter
// @homepageURL   https://github.com/scytalezero/MemriseUtilities
// @updateURL     https://github.com/scytalezero/MemriseUtilities/raw/master/MemriseUtilities.user.js
// @downloadURL   https://github.com/scytalezero/MemriseUtilities/raw/master/MemriseUtilities.user.js
// @match         https://*.memrise.com/course/*
// @match         http://akademio-de-esperanto.org/akademia_vortaro/*
// @copyright     2012+, ScytaleZero
// ==/UserScript==

var Wordlist, Promises, CourseTag;

function Main() {
  switch (document.domain) {
    case "akademio-de-esperanto.org":
      Out("Processing for akademio de esperanto");
      $("<input type='button' value='List Words' />")
        .click(AkademioList)
        .prependTo("h3.trafonombro");
      
      function AkademioList() {
        $("h3.trafonombro").append("<div><textarea id='Wordlist' style='width:800px; height:400px;'></textarea></div>");
        $("#serchorezultotabelo tr").each(function(Index) {
          if (Index === 0) return;
          $("#Wordlist").append( $($(this).find("td")[1]).text() + "\t" + $($(this).find("td")[4]).text() + "\n" );
        });
      }
      break;
    case "www.memrise.com":
      Out("Processing for Memrise");
      if ( ($("li.active > a.tab").length === 0) || ($(".container > h2").length > 0) || location.href.match(/\/edit\//) ) {
        //This isn't a course levels page
        Out("Not a course levels page.");
        return;
      }

      Wordlist = {};
      Promises = [];
      CourseTag = SanitizeTag($("h1.course-name").text().trim());

      //Insert the terms extractor button
      $("ul.nav-pills").append("<li><select id='WordFilter' style='width: 150px'>" +
        "<option value='all' selected>All</option>" +
        "<option value='no-ignored'>Exclude ignored</option>" +
        "<option value='ignored-only'>Ignored only</option>" +
        "<option value='seeds-only'>Seeds only</option><option value='learned-only'>Learned only</option></select></li>");
      $("ul.nav-pills").append("<li><a id='WordListButton'>Word list</a></li>");
      $("#WordListButton").click(SpiderLevels);
      break;
    default:
      Out("Page not recognized.");
  }
}

/* Memrise Functions */
//Iterate through the levels and kick off the retrieves.
function SpiderLevels() {
  //Add our UI
  $('#WordListContainer').remove();
  $("div.container-main").prepend("<div id='WordListContainer'><h2>Working</h2></div>");
  var urls = [];
  if ($("a.level").length > 0) {  
    $("a.level").each(function(Index) {
        urls.push("https://www.memrise.com" + $(this).attr("href"));
    });
  } else {
      urls.push(window.location.href);
  }
  Out(urls);
  urls.forEach(function(URL) {
    Out("Dispatching URL: " + URL);
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
  var WordlistText = "", BareWordlistText = "", LCV;
  
  Out("Wordlist parsed.");
  //Add the wordlist text area.
  $("#WordListContainer").empty().append("<div><h2>Course Wordlist as TSV</h2><textarea id='Wordlist' style='width:800px; height:400px;'></textarea><p>&nbsp;</p><h2>Bare Wordlist as TSV</h2><textarea id='BareWordlist' style='width:800px; height:400px;'></textarea></div>");
  for (var Level in Wordlist) {
    for (LCV=0; LCV<Wordlist[Level].length; LCV++) {
      WordlistText += Wordlist[Level][LCV].Word + "\t" + Wordlist[Level][LCV].Translation + "\t" + 
        CourseTag + "," + Level + "\n";
      BareWordlistText = BareWordlistText += Wordlist[Level][LCV].Word + "\t" + Wordlist[Level][LCV].Translation + "\n";
    }
  }
  $("#Wordlist").val(WordlistText.trimRight());
  $("#BareWordlist").val(BareWordlistText.trimRight());
}

//Pull words and definitions from a level page.
function ExtractTerms(Data) {
  var LevelName = $(Data).find('.progress-box-title').text().trim();
  var WordFilter = $('#WordFilter option:selected').val();
  Out("Level: " + LevelName);
  Wordlist[LevelName] = [];
  $(Data).find("div.text-text").each(function() {
    var ignored;
    if ($(this).find("div.status").length && $(this).find("div.status").text() === "Ignored") {
      ignored = true;
    }
    else {
      ignored = false;
    }
    if ((WordFilter === "no-ignored" && ignored === false) ||
        (WordFilter === "ignored-only" && ignored === true) ||
        (WordFilter === "seeds-only" && $(this).find("i.ico-seed").length) ||
        (WordFilter === "learned-only" && $(this).find("i.ico-water").length) ||
        WordFilter === "all") {
          Wordlist[LevelName].push({
            "Word": $(this).find("div.col_a").text(),
            "Translation": $(this).find("div.col_b").text()
        });
    }
  });
  $("#WordListContainer h2").append(".");
}

//Format text appropriately for LWT tags.
function SanitizeTag(Buffer) {
  var Tag = Buffer.replace(/[^\w]/g, "");
  if (Tag.length > 20) Tag = Tag.substring(0, 20);
  return Tag;
}

/* Utility Functions */
function Out(Buffer) {
  if (console.log)
    console.log("[MUtils] " + Buffer);
}

Main();
