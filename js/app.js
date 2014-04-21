/**
 * Created by aideremir on 05.04.14.
 */

var lang = {
	_enterWord : {qt: 'Lütfen söznı yazıñız...', ru: 'Слово для перевода'},
	_nothingFound : {qt: 'Bır şey tapmadı', ru: 'Ничего не найдено'},
	_search : {qt: 'Qıdırmaq', ru: 'Искать'}
};

var currentLang = 'qt';

function json2html(json) {
	var html = '';
	$.each(json , function(i, val) {

		val['article'] = val['article'].replace(/^(.[^)].+? )-( .+?)$/mg,'<span class="example">$1─$2</span>');
		val['article'] = val['article'].replace(/\/(.+)\//g,'<i class="spec">$1</i>');
		val['article'] = val['article'].replace(/^(ср|см)\. (.+)$/mg,
			function(str, p1, p2, offset, s) {
				var words = p2.split(/\s*,\s*/);
				var links = '';
				$.each(words, function(i, val) {
					links += '<a href="#" class="ui-btn-inline jumpTo" >'+val+'</a>, ';
				});
				return '<i class="link">'+p1+'.</i> '+links.slice(0, -2);
			});
		val['article'] = val['article'].replace(/\n/g,"<br>");
		val['article'] = val['article'].replace(/(лингв|перен|физ|хим|бот|биол|зоо|грам|геогр|астр|шк|мат|анат|ирон|этн|стр|рел|посл)\./g,'<i class="spec">$&</i>');
		html += '<dl><dt class="word">'+val['word']+ (currentLang == 'qt' ? ('<span class="cyr"> (' + transliterate(val['word'], lat2cyr)  +')') : '') + '</span></dt><dd class="article">'+val['article']+'</dd></dl>';
	});
	return html;
};

function searchArticle(word)
{
	var $ul = $( "#autocomplete" );
	var $input = $('form.ui-filterable input');

	$input.val(word);
	$.mobile.loading( "show" );
	$ul.html( "" );
	$ul.listview( "refresh" );

	if(currentLang == 'qt')
	{
		word = transliterate(word, cyr2lat);
	}

	$.ajax({
		url: "http://lugat.emirit.ru/json.php",
		dataType: "jsonp",
		crossDomain: true,
		data: {
			word: word
		}
	}).then( function ( response )
		{
			if(response.status == 200)
			{
				var article  = json2html(response.words);

			}
			else
			{
				var article  = lang._nothingFound[currentLang];
			}

			$( "#article").html(article);
			$.mobile.loading( "hide" );
			$ul.trigger( "updatelayout");

		});
}

function transliterate(str, regexp_file) {

	//---------------
	str = " " + str + " ";
	for ( i in regexp_file ) {
		str = str.replace( regexp_file[i][0], regexp_file[i][1] );
	}
	str = str.substring(1,str.length -1);


	return str;
}





$( document ).on( "pagecreate", "#mainPage", function() {

	var $ul = $( "#autocomplete" );

	$ul.on( "filterablebeforefilter", function ( e, data ) {
		var	$input = $( data.input ),
			value = $input.val(),
			html = "";

		$ul.html( "" );

		
		if ( value && value.length > 3 ) {
			$.mobile.loading( "show" );
			$( "#article").html('');

			if(currentLang == 'qt')
			{
				value = transliterate(value, cyr2lat);
			}

			$.ajax({
				url: "http://lugat.emirit.ru/json.php",
				dataType: "jsonp",
				crossDomain: true,
				data: {
					token: value
				}
			}).then( function ( response ) {
					$.each( response, function ( i, val ) {
						html += '<li><a href="#">' + val + '</a></li>';

					});
					$ul.html( html );
					$.mobile.loading( "hide" );
					$ul.listview( "refresh" );
					$ul.trigger( "updatelayout");

					$ul.find('a').on("click", function(e)
					{
						e.preventDefault();
						$wordItem = $(this);

						var article = searchArticle($wordItem.text());

						return false;
					})

				});
		}
	});

	$('form.ui-filterable').on('submit', function(e)
	{
		e.preventDefault();

		var word = $(this).find('input').val();

		searchArticle(word);
	})
});

$(document).on('click', '#article .jumpTo', function(e)
{
	searchArticle($(this).text());
})

$(document).on('click', '.ui-input-clear', function(e)
{
	$('#article').html('');
})

$(document).on('click', '.langSelector', function(e)
{
	currentLang = $(this).data('lang');
	$('#autocomplete').filterable({ filterPlaceholder: lang._enterWord[currentLang] });
	$('#searchButton').html(lang._search[currentLang]);
})


$(document).on('click', '#searchButton', function(e)
{
	$('form.ui-filterable').trigger('submit');
})
