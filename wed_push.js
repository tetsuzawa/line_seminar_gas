//LINEとスプレッドシートの設定
var CHANNEL_ACCESS_TOKEN = 'WRITE YOUR LINE CHANNEL ACCESS TOKEN';
var USER_ID = 'WRITE A LINE ID TO SEND';
var SS_ID = "WRITE YOUR TEMP_HUMI_PRESS_DATA SPREADSHEET ID";
var FOLDER_ID = "WRITE YOUR GOOGLE DRIVE IMAGE FOLDER";

function Wed_push() {

    //データの呼び出し
    var push_text = get_data_from_ss();
    //データが正常に呼び出せているか判定
    if (push_text === null) {
        //エラー時に送信するテキスト
        push_text = 'データの送信に失敗しました';
    }

    //LINEにデータを送信
    var postData = {
        "to": USER_ID,
        "messages": [{
            "type": "text",
            "text": push_text,
        }]
    };

    var url = "https://api.line.me/v2/bot/message/push";
    var headers = {
        "Content-Type": "application/json",
        'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
    };

    var options = {
        "method": "post",
        "headers": headers,
        "payload": JSON.stringify(postData)
    };
    var response = UrlFetchApp.fetch(url, options);
}




//スプレッドシートからデータを取得する関数
function get_data_from_ss() {
    //今日の日付と時間を取得 (MM/dd/HH)
    var today = Utilities.formatDate(new Date(), "JST", "MM/dd/HH");
    Logger.log(today);

    //スプレッドシートの呼び出し
    var File = SpreadsheetApp.openById(SS_ID);
    //データが記載されているシートを取得
    var Sheet = File.getSheetByName('data');
    //スプレッドシートの行数を取得
    var lastRow = Sheet.getLastRow();
    //データが記載されている領域をシートから取得
    var object = Sheet.getRange(2, 1, lastRow, 4);
    //領域内の全データを取得
    var data = object.getValues()
    //検索する日付の変数の初期化
    var search_date = '';

    //日付の検索
    for (var k = 0; k < lastRow; k++) {
        search_date = data[k][0];

        //該当する日付が見つかった場合，それぞれのデータを取得
        if (search_date === today) {
            //気温
            var temparature = data[k][1];
            //湿度
            var humidity = data[k][2];
            //気圧
            var pressure = data[k][3];
            //LINEに送信するテキストの作成
            var send_today = Utilities.formatDate(new Date(), "JST", "MM/dd");
            var text = send_today + ' 13時のデータです\n' + '気温:' + temparature + '℃, 湿度:' + humidity + '％, 気圧:' + pressure + 'hPa';

            return text;
        }
    }
    //エラーの場合nullを返す
    return null;
}



function img_push5() {

    var originalBase = 'https://drive.google.com/uc?export=view&id=';
    var previewBase = 'https://drive.google.com/thumbnail?sz=w240-h240&id=';


    // 画像を取得してGoogleドライブに保存

    var file = DriveApp.getFolderById(FOLDER_ID).getFilesByName("mmddhh.jpg").next();

    // 保存した画像に共有権を設定する (リンクを知っている全員が閲覧可)
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // 画像のファイルIDを取得する
    var fileId = file.getId();

    // Googleドライブ上の画像をLINEへプッシュ
    UrlFetchApp.fetch(line_endpoint, {
        'headers': {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN
        },
        'method': 'POST',
        'payload': JSON.stringify({
            'to': userId,
            'messages': [{
                'type': 'image',
                'originalContentUrl': originalBase + fileId,
                'previewImageUrl': previewBase + fileId
            }]
        })
    });
}