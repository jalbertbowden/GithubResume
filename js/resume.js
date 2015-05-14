var api = 'https://api.github.com/users/';
var github_url = 'https://github.com/' + name;
	  
function sprintf() {
  var fmt = [].slice.apply(arguments, [0, 1])[0];
  var args = [].slice.apply(arguments, [1]);
  return fmt.replace(/{(\d+)}/g, function(match, idx) {
    return typeof args[idx] != 'undefined'? args[idx] : match;

  });

}

function render(context) {
	for(var key in context){
		$("[data-key='"+key+"']").html(context[key]);
	}
}

function loadBaseInfo(name){
	$.getJSON(api + name + '?callback=?', function(res) {
    	var user = res.data;
      	var context = {
			title: sprintf("{0}'s Github Resume",user.name),
			realname: user.name,
			githubname: name,
			email: user.email,
			location:  user.location,
			company: user.company,
			avatar: sprintf('<img src={0} width="50%">',user.avatar_url),
			blog: user.blog,
			summary: sprintf('On GitHub since {0}, {1} is a developer with {2} public repositories and {3} followers.',
							user.created_at.substr(0,4),
							user.name,
							user.public_repos,
							user.followers)
			
		};
		render(context);
    });
}

function loadRepoInfo(name) {
	$.getJSON(api + name + "/repos" + '?callback=?', function(res) {
    	var repos = res.data;
		repos = repos.sort(function sortByStar(a,b) {
			if(a.stargazers_count>b.stargazers_count){
				return -1;
			}else{
				return 1;
			}
		});
		
		var reporender = "";
		var lang_render = "";
		var langs = {};
		
		var T = "\
      	<div class='position'>\
  				<h3><a href='{0}'>{1}</a> <small class='citystate'>{2}</small></h3>\
  				<strong>{3}<span class='octicon octicon-star'></span>   {4}<span class='octicon octicon-repo-forked'></span><span class='dates pull-right'>{5}</span></strong>\
				  <h3>{6}</h3>\
  			</div>";
		var langT = "<th></th><td>{0} {1}%</td>";
		for(var i in repos){
			reporender += sprintf(T,
				repos[i].html_url,
				repos[i].name,
				repos[i].language,
				repos[i].stargazers_count,
				repos[i].forks_count,
				repos[i].created_at.substr(0,7),
				repos[i].description
				);
			if(!(repos[i].language in langs)){
				if(repos[i].language)
					langs[repos[i].language] = 1;
			}else{
				langs[repos[i].language]++;
			}
		}
		
		var lang_stats = [];
      	for (var langName in langs) {
        	lang_stats.push([langName, langs[langName]]);
      	}
      	lang_stats.sort(function(a, b) {
        	return b[1] - a[1];
      	});
		lang_stats = lang_stats.slice(0,6);
		for(var i in lang_stats){
			lang_render+=sprintf(langT,
				lang_stats[i][0],
				parseInt(lang_stats[i][1]/repos.length*100)
			);
		}
		lang_render += '<th></th><td>';
		var context = {
			"repolist":reporender,
			"skill_list":lang_render
		};
		render(context);
    });
}

$(function (){
	
	var name = location.search.substr(1).replace(/^\/|\/$/g, '')
  	// Default username
  	if (name.length === 0)
    	name = 'codefalling';

	var context = { 
		githubname: name,
		
	};
	render(context);
	loadBaseInfo(name);
	loadRepoInfo(name);
	//render(context);
})

