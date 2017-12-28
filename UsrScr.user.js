// ==UserScript==
// @name       Page actions
// @namespace  Page actions
// @version    0.02
// @description  User actions
// @include        *
// @match        https://*/*
// @copyleft  2013+, thebix
// ==/UserScript==

var DEBUG = false
var GET_ALL_REDDIT_ELEMENTS = true
function consoleLog(text) {
	DEBUG && console.log("UsrScr: " + text);
}

window.addEventListener("load", function () {
	consoleLog("Page Load");
	// INFO: OPTIONS HERE
	UsrScr.Helper.Init({
		UseJquery: false, 					//opt(def=false). added: it doesn't work, should be removed
		ScriptStartConfirmation: false,		//opt(def=false), ask user to run script
		OnlyOneScrInstanceTimeLimit: 3,	//opt(def=0), don't run other instances of this script for time in sec
	});

	//INFO: CUSTOM LOGIC HERE
	// UsrScr.Helper.AddTask("google.com", function(){
	// 	 console.log("It works.");
	// });

	//reddit.com
	UsrScr.Helper.AddTask("reddit.com", function () {
		consoleLog("Starting task 'reddit.com'");

		$('#header').find('span.user').prepend('<a id="open-all" href="javascript:void(0);">open all</a> | ')

		$('#open-all').click(function () {
			consoleLog("open all click");
			$("#siteTable").find("div.thing.link").find("a.title.loggedin").each(function (i, a) {
				var url = $(a).attr("href");
				consoleLog("url = " + url);
				if (GET_ALL_REDDIT_ELEMENTS || i < 4) {
					window.open(url, "_blank");
				}
			});
		})
	});

	UsrScr.Helper.Execute();
}, false);

var UsrScr = UsrScr || {};
UsrScr.Helper = UsrScr.Helper || (function () {
	var InitParams = {};
	var Tasks = {};
	var COOKIE_KEY_TASKS_IN_PROGRESS = "UsrScrTasksInProgressState";

	/******** Public ********/
	var init = function (params) {
		consoleLog("UsrScr.Helper.Init()");
		if (params)
			InitParams = params;

		if (!InitParams.OnlyOneScrInstanceTimeLimit) {
			InitParams.OnlyOneScrInstanceTimeLimit = 0;
		}
	};

	addTask = function (url, task) {
		Tasks[url] = task;
	};

	var execute = function (jQueryAdded) {
		consoleLog("UsrScr.Helper.Execute(jQueryAdded=" + jQueryAdded + ")");
		consoleLog(getCookie(COOKIE_KEY_TASKS_IN_PROGRESS));
		if (getCookie(COOKIE_KEY_TASKS_IN_PROGRESS)) {
			consoleLog("The cookie key 'TASKS_IN_PROGRESS' was set to true, returning");
			return;
		}

		setCookie(COOKIE_KEY_TASKS_IN_PROGRESS, true, InitParams.OnlyOneScrInstanceTimeLimit);
		if (!jQueryAdded && InitParams.UseJquery === true) {
			addJquery();
		} else {
			executeTasks();
			setCookie(COOKIE_KEY_TASKS_IN_PROGRESS, null, InitParams.OnlyOneScrInstanceTimeLimit);
		}
	};

	/******** Private ********/
	var executeTasks = function () {
		for (var key in Tasks) {
			if (Tasks.hasOwnProperty(key) && typeof Tasks[key] == 'function' && isTaskEnabledOnSite(key)) {
				Tasks[key]();
			}
		}
	};

	var addJquery = function () {
		if (typeof jQuery == "undefined") {
			var script = document.createElement("script");
			script.setAttribute("src", "https://ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js");
			script.addEventListener('load', function () {
				var script = document.createElement("script");
				script.textContent = "(function (){ ";
				tasksUrls = getTasksUrls();
				for (var i = 0; i < tasksUrls.length; i++) {
					var key = tasksUrls[i];
					if (isTaskEnabledOnSite(key))
						script.textContent = script.textContent + " (" + Tasks[key] + ")();";
				}
				script.textContent = script.textContent + " })();";
				document.body.appendChild(script);
			}, false);
			document.body.appendChild(script);
		}
	};

	var showTasks = function () {
		consoleLog("FUNC showTasks");
		var key;
		for (key in Tasks) {
			if (Tasks.hasOwnProperty(key)) consoleLog("-" + key);
		}
	};

	var getTasksUrls = function () {
		var key;
		var res = [];
		for (key in Tasks) {
			if (Tasks.hasOwnProperty(key)) res.push(key);
		}
		return res;
	};

	var isTaskEnabledOnSite = function (taskUrl) {
		if (taskUrl.indexOf(document.domain) > -1 || document.domain.indexOf(taskUrl) > -1) {
			if (InitParams.ScriptStartConfirmation)
				return confirm('Run UserScript for ' + taskUrl + '?');
			return true;
		}
		return false;
	};
	/******** Misc ********/
	function setCookie(c_name, value, exsecs) {
		var exdate = new Date();
		//exdate.setDate(exdate.getDate() + exdays);
		exdate.setSeconds(exdate.getSeconds() + exsecs);
		var c_value = escape(value) + ((exsecs === null) ? "" : "; expires=" + exdate.toUTCString());
		document.cookie = c_name + "=" + c_value;
	}
	function getCookie(c_name) {
		var c_value = document.cookie;
		var c_start = c_value.indexOf(" " + c_name + "=");
		if (c_start == -1) {
			c_start = c_value.indexOf(c_name + "=");
		}
		if (c_start == -1) {
			c_value = null;
		} else {
			c_start = c_value.indexOf("=", c_start) + 1;
			var c_end = c_value.indexOf(";", c_start);
			if (c_end == -1) {
				c_end = c_value.length;
			}
			c_value = unescape(c_value.substring(c_start, c_end));
		}
		return c_value;
	}
	/******** Public ********/
	return {
		//Tasks : Tasks,

		Init: init,
		AddTask: addTask,
		Execute: execute,

		//ExecuteTasks:executeTasks,
		//ShowTasks: showTasks
	};
})();
