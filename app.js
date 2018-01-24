/*
	サーバー起動
*/
var http = require('http');
var socketio = require('socket.io');
var fs = require('fs');
var path = require('path');
var express = require('express');
var app = express();
app.use(express.static(__dirname));

var server = app.listen( 1337 );
var io = socketio.listen( server );

var player_name = new Array();

/*
	ゲームスタート
*/
io.sockets.on('connection', function( socket ) {

	socket.on('start_from_client', function( data ){

		if( player_name.length == 0 ) {
			player_name.push( socket.id );
			socket.emit('user_number', 1 );
		} else {
			player_name.push( socket.id );
			socket.emit('user_number', 2 );

//----------------------------プレイヤー２人以上いないと始められないよ！--------------------------------

			lg = new life_game( 160, 100 );
			io.sockets.emit('start_from_server',"1");
	
			//プレイヤー作成
			player1 = new player();
			player2 = new player();
	
			//テーブル作成
			lg.make_table();
			
			//次の日
			var interval = setInterval(function(){
				if( lg.day >= 1500 ) {
					clearInterval( interval );
					lg.end_game();

					//-----------------結果を送る---------------------
					io.sockets.emit('end_game', lg.sum_cell_1, lg.sum_cell_2 );

					return;
				}
				lg.next_day();
				io.sockets.emit('next_day_output', lg.field, lg.day, player1.point, player1.cell, player2.point, player2.cell );
			}, 300 );

		}


	});

	socket.on('arrangement', function( data, user_number, use_point ) {
		lg.arrangement( data, user_number );
		if ( user_number == 1 ) {
			player1.use_point( use_point );
		} else if( user_number == 2 ) {
			player2.use_point( use_point );
		} else {
			console.log("エラー：4")
		}
	});

});


birth_list_1 = new Array();
death_list_1 = new Array();
birth_list_2 = new Array();
death_list_2 = new Array();

/**
 * ライフゲームオブジェクト
 * @param {x座標数} x 
 * @param {y座標数} y 
 */
var life_game = function( x, y ) {
	this.square_num_x = x;
	this.square_num_y = y;
	this.day = 1;

	//テーブル配列作成
	this.make_table = function(){
		this.field = new Array( this.square_num_y );
		for( var row = 0; row < this.square_num_y; row++ ) {
			this.field[ row ] = new Array( this.square_num_x );
			for( var col = 0; col < this.square_num_x; col++ ) {
				this.field[ row ][ col ] = 0;
			}
		}
	}


	this.arrangement = function( data, user_number ) {
		for( var i = 0; i < data.length; i++ ) {
			this.field[ data[ i ][ 0 ] ][ data[ i ][ 1 ] ] = user_number;
		}
	}

	this.next_day = function() {

		birth_list_1 = [];
		death_list_1 = [];
		birth_list_2 = [];
		death_list_2 = [];

		player1_cell = 0;
		player2_cell = 0;

		for( var row = 0; row < this.square_num_y; row++ ) {
			for( var col = 0; col < this.square_num_x; col++ ) {
				
				var life_cell_num_1 = 0;
				var life_cell_num_2 = 0;
				
				for( var i = row - 1; i <= row + 1; i++ ) {
					for( var j = col - 1; j <= col + 1; j++ ) {
						if( i >= 0 && j >= 0 && i < this.square_num_y && j < this.square_num_x && this.field[ i ][ j ] != 0 ) {
							if( i == row && j == col ) {
							} else if( this.field[ i ][ j ] == 1 ) {
								life_cell_num_1++;
							} else if( this.field[ i ][ j ] == 2 ) {
								life_cell_num_2++;
							}
						}
					}
				}

				//誕生するには、自分のセルが３つ以上必要、生存は自分のセルじゃなくてもOK
				var around_sum_cell = life_cell_num_1 + life_cell_num_2;

				life_death = this.field[ row ][ col ];
				if( life_death == 1 && around_sum_cell <= 1 ) {
					death_list_1.push( [ row, col ] );
				} else if( life_death == 1 && around_sum_cell >= 4 ) {
					death_list_1.push( [ row, col ] );
				} else if( life_death == 0 && life_cell_num_1 == 3 ) {
					birth_list_1.push( [ row, col ] );

					if ( col <= 70 ) {
						player1.add_point();						
					} else if ( col >= 90 ) {
						player2.remove_point();
					}


				}

				if( life_death == 2 && around_sum_cell <= 1 ) {
					death_list_2.push( [ row, col ] );
				} else if( life_death == 2 && around_sum_cell >= 4 ) {
					death_list_2.push( [ row, col ] );
				} else if( life_death == 0 && life_cell_num_2 == 3 ) {
					birth_list_2.push( [ row, col ] );
					if ( col >= 90 ) {
						player2.add_point();
					} else if ( col <= 70 ) {
						player2.remove_point();
					}
				}

				//カウント
				if( life_death == 1 ) {
					player1_cell++;
				} else if( life_death == 2 ) {
					player2_cell++;
				}

			}
		}

		//カウント
		player1.cell = player1_cell + birth_list_1.length - death_list_1.length;
		player2.cell = player2_cell + birth_list_2.length - death_list_2.length;

		//同じ場所に誕生セル
		var i = 0;
		var j = 0;
		while ( i < birth_list_1.length && j < birth_list_2.length ) {
			if ( birth_list_1[ i ][ 0 ] == birth_list_2[ j ][ 0 ] ) {
				if( birth_list_1[ i ][ 1 ] == birth_list_2[ j ][ 1 ] ) {
					var random = Math.random();
					if ( random < 0.5 ) {
						birth = birth_list_1.splice( i, 1 );
						this.field[ birth[ 0 ] ][ birth[ 1 ] ] = 1;
						birth_list_2.splice( j, 1 );
					} else if( random >= 0.5 ) {
						birth = birth_list_2.splice( j, 1 );
						this.field[ birth[ 0 ] ][ birth[ 1 ] ] = 2;
						birth_list_1.splice( i, 1 );
					}
				} else if ( birth_list_1[ i ][ 1 ] > birth_list_2[ j ][ 1 ] ) {
					i++;
				} else if ( birth_list_1[ i ][ 1 ] < birth_list_2[ j ][ 1 ] ) {
					j++;
				}
			} else if( birth_list_1[ i ][ 0 ] > birth_list_2[ j ][ 0 ] ) {
				i++;
			} else if( birth_list_1[ i ][ 0 ] < birth_list_2[ j ][ 0 ] ) {
				j++;
			}
		}

		
		//誕生セル入れ替え
		while ( birth_list_1.length > 0 ) {
			birth = birth_list_1.pop();
			this.field[ birth[ 0 ] ][ birth[ 1 ] ] = 1;
		}
		while ( birth_list_2.length > 0 ) {
			birth = birth_list_2.pop();
			this.field[ birth[ 0 ] ][ birth[ 1 ] ] = 2;
		}
		//死亡セル入れ替え
		while ( death_list_1.length > 0 ) {
			death = death_list_1.pop();
			this.field[ death[ 0 ] ][ death[ 1 ] ] = 0;
		}
		while ( death_list_2.length > 0 ) {
			death = death_list_2.pop();
			this.field[ death[ 0 ] ][ death[ 1 ] ] = 0;
		}



		this.day++;

	}

	this.end_game = function() {
		this.sum_cell_1 = 0;
		this.sum_cell_2 = 0;
		for( var row = 0; row < this.square_num_y; row++ ) {
			for( var col = 0; col < this.square_num_x; col++ ) {
				if( this.field[ row ][ col ] == 1 ) {
					this.sum_cell_1++;
				} else if ( this.field[ row ][ col ] == 2 ) {
					this.sum_cell_2++;
				}
			}
		}
	}
}

/*
	プレイヤー情報
*/
var player = function() {
	this.point = 2500;
	this.cell = 0;
	this.add_point = function() {
		this.point += 10;
	}
	this.remove_point = function() {
		if ( this.point - 10 >= 0 ) {
			this.point -= 10;
		}
	}
	this.use_point = function( point ) {
		this.point -= point;
	}

}
