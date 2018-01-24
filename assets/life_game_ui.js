$(function(){
	socket = io.connect();

	socket.on('next_day_output',function( data, day, p1_point, player1_cell, p2_point, player2_cell ){
		for( var row = 0; row < data.length; row++ ) {
			for( var col = 0; col < 160; col++ ) {
				if( data[ row ][ col ] == 0 ) {
					$("#r" + row + "c" + col ).css("background","#fff");
					//$("#r" + row + "c" + col ).append( data[ row ][ col ] );
				} else if( data[ row ][ col ] == 1 ){
					$("#r" + row + "c" + col ).css("background","#f00");
					//
				} else if( data[ row ][ col ] == 2 ) {
					$("#r" + row + "c" + col ).css("background","#00f");
				} else {
					console.log("エラー：1");
				}
			}
		}


		$("#day_num").text( day );

		if ( user_number == 1 ) {
			$("#point").text( p1_point );
			$("#cell_num").text( player1_cell );
		} else if( user_number == 2 ) {
			$("#point").text( p2_point );
			$("#cell_num").text( player2_cell );
		}


		field = data;
		player1_point = p1_point;
		player2_point = p2_point;
	});

	socket.on('end_game', function( sum_cell_1, sum_cell_2 ) {
		end_game( sum_cell_1, sum_cell_2 );
	});
});

var object_list = function() {
	
	//ブリンカー
	this.blinker_arrangement = new Array();
	this.blinker_arrangement.push( [ -1, 0 ], [ 0, 0 ], [ 1, 0 ] );
	

	//グライダー
	this.glider_arrangement_1 = new Array();
	this.glider_arrangement_1.push( [ -1, 0 ], [ 0, 1 ], [ 1, -1 ], [ 1, 0 ], [ 1, 1 ] );
	this.glider_arrangement_2 = new Array();
	this.glider_arrangement_2.push( [ -1, 0 ], [ 0, -1 ], [ 1, -1 ], [ 1, 0 ], [ 1, 1 ] );

	//上方向グライダー
	this.up_glider_arrangement_1 = new Array();
	this.up_glider_arrangement_1.push( [ -1, -1 ], [ -1, 0 ], [ -1, 1 ], [ 0, 1 ], [ 1, 0 ] );
	this.up_glider_arrangement_2 = new Array();
	this.up_glider_arrangement_2.push( [ -1, 1 ], [ -1, 0 ], [ -1, -1 ], [ 0, -1 ], [ 1, 0 ] );

	//イーター
	this.eater_arrangement_1 = new Array();
	this.eater_arrangement_1.push( [ -2, 1 ], [ -2,  2 ], [ -1, 1 ], [ 0, -1 ], [ 0, 1 ], [ 1, -1 ], [ 1, 0 ] );
	this.eater_arrangement_2 = new Array();
	this.eater_arrangement_2.push( [ -2, -1 ], [ -2, -2 ], [ -1, -1 ], [ 0, 1 ], [ 0, -1 ], [ 1, 1 ], [ 1, 0 ] );

	//軽量スペースシップ
	this.lightweight_spaceship_arrangement_1 = new Array();
	this.lightweight_spaceship_arrangement_1.push( [ -2, -2 ], [ -2, 1 ], [ -1, 2 ], [ 0, -2 ], [ 0, 2 ], [ 1, -1 ], [ 1, 0 ], [ 1, 1 ], [ 1, 2 ] );
	this.lightweight_spaceship_arrangement_2 = new Array();
	this.lightweight_spaceship_arrangement_2.push( [ -2, 2 ], [ -2, -1 ], [ -1, -2 ], [ 0, 2 ] , [ 0, -2 ], [ 1, 1 ], [ 1, 0 ], [ 1, -1 ], [ 1, -2 ] );


	/**
	 * オブジェクトの配置を返す
	 * @var string object_name
	 */
	this.object_arrangement = function( object_name, user_number ) {
		switch ( object_name ) {
			case "blinker":
				return [ this.blinker_arrangement, 1250 ];
				break;
			case "glider":
				if ( user_number == 1 ) {
					return [ this.glider_arrangement_1, 5000 ];					
				} else if ( user_number == 2 ) {
					return [ this.glider_arrangement_2, 5000 ];
				}
				break;
			case "up_glider":
				if ( user_number == 1 ) {
					return [ this.up_glider_arrangement_1, 5000 ];
				} else if ( user_number == 2 ) {
					return [ this.up_glider_arrangement_2, 5000 ];
				}
				break;
			case "eater":
				if( user_number == 1 ) {
					return [ this.eater_arrangement_1, 3000 ];					
				} else if ( user_number == 2 ) {
					return [ this.eater_arrangement_2, 3000 ];
				}
				break;
			case "lightweight_spaceship":
				if( user_number == 1 ) {
					return [ this.lightweight_spaceship_arrangement_1, 10000 ];					
				} else if ( user_number == 2 ) {
					return [ this.lightweight_spaceship_arrangement_2, 10000 ];
				}
				break;
			default:
				console.log("エラー");
		}
	}
}
	
function make_table(){

	selected_object = "";

	for( var row = 0; row < 100; row++ ){
		$("#field").append("<tr id=l" + row + "></tr>");
		for( var col = 0; col < 160; col++ ){
			$("#l" + row ).append("<td id=r" + row + "c" + col + "></td>");
		}
	}
	//陣地作成
	for( var row = 0; row < 100; row ++ ) {
		$("#r" + row + "c70").css("border-right","solid 1px");
		$("#r" + row + "c90").css("border-left","solid 1px")
	}

	//操作パネル追加
	if ( user_number == 1 ) {
		$("#panel").append(
			'<ul id="object">' +
			'<li id="blinker">ブリンカー<img src="/assets/blinker_red.GIF">1250p</li>' +
			'<li id="glider">グライダー<img src="/assets/glider_red.GIF">5000p</li>' +
			'<li id="up_glider">グライダー<img src="/assets/up_glider_red.GIF">5000p</li>' +
			'<li id="eater">イーター<img src="/assets/eater_red.GIF">3000p</li>' +
			'<li id="lightweight_spaceship" class="small_font">軽量スペースシップ<img src="/assets/space_red.GIF">10000p</li>' +
			'</ul>'
		);
	} else if ( user_number == 2 ) {
		$("#panel").append(
			'<ul id="object">' +
			'<li id="blinker">ブリンカー<img src="/assets/blinker_blue.GIF">1250p</li>' +
			'<li id="glider">グライダー<img src="/assets/glider_blue.GIF">5000p</li>' +
			'<li id="up_glider">グライダー<img src="/assets/up_glider_blue.GIF">5000p</li>' +
			'<li id="eater">イーター<img src="/assets/eater_blue.GIF">3000p</li>' +
			'<li id="lightweight_spaceship" class="small_font">軽量スペースシップ<img src="/assets/space_blue.GIF">10000p</li>' +
			'</ul>'
		);
	}

	$("#panel").append(
		'<div id="day"><span id="day_num">1</span>/1500日目</div>' +
		'<div id="cell"><span id="cell_num">0</span>個</div>' +
		'<div id="player">Player Point:<span id="point">0</span></div>' +
		'<div id="comment"></div>'
	);

	$("#start").remove();

	operation_set();

	if( user_number == 1 ) {
		user_color = "#f00";
	} else if( user_number == 2 ) {
		user_color = "#00f";
	}
}


//操作設定
function operation_set() {
	object_list = new object_list();

	$("#object li").on('mousedown',function(){
		selected_object = $( this ).attr("id");
		[ arrangement, arrangement_point ] = object_list.object_arrangement( selected_object, user_number );	
		$( this ).css("border-color","#f00");
	});

	//テーブルエンター
	$("td").on({
		'mouseenter': function(){
			if( selected_object != "" ) {
				[ row, col ] = cut_out_coordinates_id( $( this ).attr("id") );
				if ( user_number == 1 && col <= 70 || user_number == 2 && col >= 90 ) {
					for( var i = 0; i < arrangement.length; i++ ) {
						$("#r" + ( row + arrangement[ i ][ 0 ] ) + "c" + ( col + arrangement[ i ][ 1 ] ) ).css("background", user_color );
					}
				}
			}
		},
		'mouseout': function(){
			if( selected_object != "" ) {
				[ row, col ] = cut_out_coordinates_id( $( this ).attr("id") );				
				for( var i = 0; i < arrangement.length; i++ ) {
					if( field[ row + arrangement[ i ][ 0 ] ][ col + arrangement[ i ][ 1 ] ] == 0 ) {
						$("#r" + ( row + arrangement[ i ][ 0 ] ) + "c" + ( col + arrangement[ i ][ 1 ] ) ).css("background","#fff");
					}
				}
			}
		},
		'click': function(){
			if( selected_object != "" ) {
				/*
				色を付ける
				arrangement オブジェクトの配置場所 array
				*/

				if ( user_number == 1 && player1_point - arrangement_point >= 0 || user_number == 2 && player2_point - arrangement_point >= 0 ) {
					place = new Array();
	
					[ row, col ] = cut_out_coordinates_id( $( this ).attr("id") );
					
					if ( user_number == 1 && col <= 70 || user_number == 2 && col >= 90 ) {
						for ( var i = 0; i < arrangement.length; i++ ) {
							var set_row = row + arrangement[ i ][ 0 ];
							var set_col = col + arrangement[ i ][ 1 ];

							$("#r" + set_row + "c" + set_col ).css("background", user_color );
							if ( set_row >= 0 && set_row < 100 && set_col >= 0 && set_col < 160 ) {
								place.push( [ set_row , set_col ] );								
							}
						}
					}
	
	
					//データ化
					socket.emit('arrangement', place, user_number, arrangement_point );
	
					$("#" + selected_object ).css("border-color","#000");

					selected_object = "";
				} else {
					console.log("ポイントが足りません");
					$("#" + selected_object ).css("border-color","#000");				
					toastr.success('ポイントが足りません');
					selected_object = "";
				}
			}
		}
	});


}


/**
 * セルのIDを取り出す
 * @var string coordinates
 */
function cut_out_coordinates_id( coordinates ){
	//rowの取り出し
	if ( coordinates.substr( 2, 1 ) == "r" ){
		var row = coordinates.substr( 1, 1 );
	} else {
		var row = coordinates.substr( 1, 2 );
	}
	//colの取り出し
	if ( coordinates.substr( -2, 1 ) == "c" ) {
		var col = coordinates.substr( -1, 1 );
	} else if( coordinates.substr( -3, 1 ) == "c" ) {
		var col = coordinates.substr( -2, 2 );
	} else {
		var col = coordinates.substr( -3 , 3 );
	}
	return [ parseInt( row ), parseInt( col ) ];
}

function end_game( sum_cell_1, sum_cell_2 ){
	$("body").empty();
	if( user_number == 1 ) {
		$("body").append(
			'<p>終了</p>' +
			'<p>あなたのポイント：' + sum_cell_1 + '</p>' +
			'<p>相手のポイント：' + sum_cell_2 + '</p>'
		);
		if( sum_cell_1 > sum_cell_2 ) {
			$("body").append("<p>You're the winner!.</p>");
		}else if( sum_cell_1 < sum_cell_2 ) {
			$("body").append("<p>You're the loser.</p>");
		} else {
			$("body").append("<p>Draw</p>")
		}

	} else if( user_number == 2 ) {
		$("body").append(
			'<p>終了</p>' +
			'<p>あなたのポイント：' + sum_cell_2 + '</p>' +
			'<p>相手のポイント：' + sum_cell_1 + '</p>'
		);
		if( sum_cell_1 < sum_cell_2 ) {
			$("body").append("<p>You're the winner!.</p>");
		}else if( sum_cell_1 > sum_cell_2 ) {
			$("body").append("<p>You're the loser.</p>");
		} else {
			$("body").append("<p>Draw</p>")
		}
	}
}
