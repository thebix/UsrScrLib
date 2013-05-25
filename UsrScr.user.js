// ==UserScript==
// @name       Page actions
// @namespace  Page actions
// @version    0.01
// @description  User actions with jQuery
// @include        *
// @copyleft  2013+, thebix
// ==/UserScript== 


window.addEventListener ("load", function(){
	//INFO: OPTIONS HERE
	UsrScr.Helper.Init({
		UseJquery: true, 					//opt(def=false)
		ScriptStartConfirmation: true,		//opt(def=false), ask user to run script
		OnlyOneScrInstanceTimeLimit: 75,	//opt(def=0), don't run other instances of this script for time in sec  
	});

	//INFO: CUSTOM LOGIC HERE
	// UsrScr.Helper.AddTask("google.com", function(){
	// 	 console.log("It works.");
	// });

	//reddit.com
	UsrScr.Helper.AddTask("reddit.com", function(){
		//console.log($("div.thing.odd.link").find("a.title.loggedin"));
		$("div.thing.link").find("a.title.loggedin").each(function(i,a){
	        var url = $(a).attr("href");
	        //console.log(url);
	        //if(i < 15){
		    	window.open(url, "_blank"); 
		    //}    	
		});
		//console.log($("div.thing.odd.link").find("a.title.loggedin").length);
	});

	UsrScr.Helper.Execute();
}, false);



var UsrScr = UsrScr || {};
UsrScr.Helper = UsrScr.Helper || (function (){
	var InitParams = {};
	var Tasks = {};
	var COOKIE_KEY_TASKS_IN_PROGRESS = "UsrScrTasksInProgressState";

	/******** Public ********/
	var init = function(params){
		if(params)
			InitParams = params;

		if(!InitParams.OnlyOneScrInstanceTimeLimit) {
			InitParams.OnlyOneScrInstanceTimeLimit = 0;
		}
	}

	addTask = function(url, task){
		Tasks[url] = task;
	}

	
	var execute = function(jQueryAdded){
		if(getCookie(COOKIE_KEY_TASKS_IN_PROGRESS)){
			return;
		}

		setCookie(COOKIE_KEY_TASKS_IN_PROGRESS, true, InitParams.OnlyOneScrInstanceTimeLimit);
		if(!jQueryAdded && InitParams.UseJquery == true){
			addJquery();
		} else {
			executeTasks();
		}
	}

	/******** Private ********/
	var executeTasks = function(){
		for (var key in Tasks) {
        	if (Tasks.hasOwnProperty(key) && typeof Tasks[key] == 'function' && isTaskEnabledOnSite(key)) {
                Tasks[key]();
            }
        }
	}

	var addJquery = function(){
		if (typeof jQuery == "undefined") {
			var script = document.createElement("script");
			  script.setAttribute("src", "http://ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js");
			  script.addEventListener('load', function() {
			    var script = document.createElement("script");
			    script.textContent = "(function (){ ";
			    tasksUrls = getTasksUrls();
			    for(var i=0; i < tasksUrls.length; i++){
			    	var key = tasksUrls[i];
			    	if(isTaskEnabledOnSite(key))
			    		script.textContent = script.textContent + " (" + Tasks[key] + ")();"; 
			    }
			    script.textContent = script.textContent + " })();";
			    document.body.appendChild(script);
			  }, false);
			  document.body.appendChild(script);
		}
	}

	var showTasks = function(){
		console.log("FUNC showTasks");
		var key;
        for (key in Tasks) {
            if (Tasks.hasOwnProperty(key)) console.log("-" + key);
        }
	}

	var getTasksUrls = function(){
		var key;
        var res = [];
        for (key in Tasks) {
            if (Tasks.hasOwnProperty(key)) res.push(key);
        }
        return res;
	}

	var isTaskEnabledOnSite = function(taskUrl){
		if(taskUrl.indexOf(document.domain) > -1 
				|| document.domain.indexOf(taskUrl) > -1){
			if(InitParams.ScriptStartConfirmation)
				return confirm('Run UserScript for ' + taskUrl +'?');
			return true;
		}
		return false;
	}
	/******** Misc ********/
	function setCookie(c_name,value,exsecs)
	{
		var exdate=new Date();
		//exdate.setDate(exdate.getDate() + exdays);
		exdate.setSeconds(exdate.getSeconds() + exsecs);
		var c_value=escape(value) + ((exsecs==null) ? "" : "; expires="+exdate.toUTCString());
		document.cookie=c_name + "=" + c_value;
	}
	function getCookie(c_name)
	{
		var c_value = document.cookie;
		var c_start = c_value.indexOf(" " + c_name + "=");
		if (c_start == -1){
			c_start = c_value.indexOf(c_name + "=");
		}
		if (c_start == -1){
		  	c_value = null;
		}else{
		  	c_start = c_value.indexOf("=", c_start) + 1;
		  	var c_end = c_value.indexOf(";", c_start);
		  	if (c_end == -1){
				c_end = c_value.length;
			}
			c_value = unescape(c_value.substring(c_start,c_end));
		}
		return c_value;
	}
	/******** Public ********/
	return {
		//Tasks : Tasks,

		Init : init,
		AddTask : addTask,
		Execute: execute,

		//ExecuteTasks:executeTasks,
		//ShowTasks: showTasks
	} 
})();




