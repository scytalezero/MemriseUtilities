# MemriseUtilities
User script with useful additions to the Memrise language learning site.

# Installation
First, you will need the appropriate user script addon for your browser:
- Chrome: Tampermonkey
- Firefox: Greasemonkey
 
Next, [just click here](https://github.com/scytalezero/MemriseUtilities/raw/master/MemriseUtilities.user.js) and you should be prompted to install the script. That's it!

# Features
Currently, MemriesUtilities only adds the ability to export the list of words and definitions from a Memrise course. Once the script is installed, navigating to the main page of a course will show a new "Word list" button next to "Most difficult words". Clicking "Word list" will display a loading animation underneath while the levels are indexed. Once that is complete, a textarea will appear with a tab-separated list of words, definitions, and tags from all the levels of that course.

The tags are auto-generated and formatted for use in Learning With Texts (20 characters max, no spaces). They will include the name of the course and the level containing the word.

Simply select all of the text in the textarea, copy it, and paste it into another app such as LWT.
