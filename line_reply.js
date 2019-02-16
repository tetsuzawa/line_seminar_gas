// LINEの認証を突破するために必要なお作法
// アクセストークン
var CHANNEL_ACCESS_TOKEN = "WRITE YOUR LINE CHANNEL ACCESS TOKEN"
var SECRET = "Bearer " + CHANNEL_ACCESS_TOKEN;
var SS_ID = "WRITE YOUR TEMP_HUMI_PRESS_DATA SPREADSHEET ID";
var GOOGLE_CLOUD_VISION_API_KEY = "WRITE YOUR GOOGLE_CLOUD_VISION_API_KEY";
var FOLDER_ID = "WRITE YOUR GOOGLE DRIVE IMAGE FOLDER";

function doPost(e) {
    // LINEから送信されたデータを取得（テキストメッセージそのものではない。）
    var json_o = e.postData.getDataAsString();
    var json = JSON.parse(json_o);

    // LINEから送信されてきたデータの種類を取得
    var type = json.events[0].type;
    // LINEから送信されてきたデータから、リプライトークン（返信するために必要）を取得
    var token = json.events[0].replyToken;

    var object = SpreadsheetApp.openById("WRITE YOUR ID_COUNTER SPREADSHEET ID");

    var USER_ID = json.events[0].source.userId;




    if (type === "message") {
        try {
            if (json.events[0].message.type === "text") {

                // 送信されてきたテキストを取り出し
                var text = json.events[0].message.text;

                if (text.search(/^help/i) !== -1) {
                    message = [{
                        "type": "text",
                        "text": "現在helpに対応してません\n不明な点は瀧澤に問い合わせてください"
                    }]
                }

                else if (text.search(/^what\s*/i) !== -1) {
                    var date_range = specify_datetime();
                    message = [{
                        "type": "text",
                        "text": "何をしたいですか?",
                        "quickReply": {
                            "items": [
                                {
                                    "type": "action",
                                    "action": {
                                        "type": "datetimepicker",
                                        "label": "気温を取得",
                                        "data": "storeId=12345",
                                        "mode": "datetime",
                                        "max": date_range[0],
                                        "min": date_range[1]
                                    }
                                },
                                {
                                    "type": "action",
                                    "action": {
                                        "type": "camera",
                                        "label": "カメラからOCR"
                                    }
                                },
                                {
                                    "type": "action",
                                    "action": {
                                        "type": "cameraRoll",
                                        "label": "アルバムからOCR"
                                    }
                                }
                            ]
                        }
                    }]
                }

                else {
                    //push_steal(text)
                    message = [{
                        "type": "text",
                        "text": ""
                    }]
                }
            }

            else if (json.events[0].message.type === "image") {
                try {
                    var counter_user = count_id(object, USER_ID, "USER_ID");
                } catch (e) {
                    ;
                }

                try {
                    var GROUP_ID = json.events[0].source.groupId;
                    count_id(object, GROUP_ID, "GROUP_ID");
                } catch (e) {
                    ;
                }

                try {
                    var ROOM_ID = json.events[0].source.roomId;
                    count_id(object, ROOM_ID, "ROOM_ID");
                } catch (e) {
                    ;
                }

                if (counter_user <= 20) {
                    try {
                        if (GROUP_ID) {
                            push_wait_sentence(GROUP_ID);
                        }
                        else if (ROOM_ID) {
                            push_wait_sentence(ROOM_ID);
                        }
                        else {
                            push_wait_sentence(USER_ID);
                        }
                        var messageId = json.events[0].message.id;
                        // LINEから画像を取得する
                        var blob = get_line_content(messageId);

                        // 文字起こし結果
                        var result = imageAnnotate(blob);
                        message = [{
                            "type": "text",
                            "text": result
                        }]

                    } catch (e) {
                        message = [{
                            "type": "text",
                            "text": e.message
                        }]
                    }
                }
                else {
                    message = [{
                        "type": "text",
                        "text": "利用制限がかかっています。再度利用可能になるまでしばらくお待ち下さい."
                    }]
                }
            }


            else {
                message = [{
                    "type": "text",
                    //"text" : text
                    "text": "現在サポートされていない形式です."
                }]
            }


        } catch (e) {
            message = [{
                "type": "text",
                "text": e.message
            }]
        }
    }

    else if (type === "postback") {
        try {
            var GROUP_ID = json.events[0].source.groupId;
        } catch (e) {
            ;
        }
        try {
            var ROOM_ID = json.events[0].source.roomId;
        } catch (e) {
            ;
        }

        try {
            if (GROUP_ID) {
                push_wait_sentence(GROUP_ID);
            }
            else {
                push_wait_sentence(USER_ID);
            }
            var reply_date = json.events[0].postback.params.datetime;
            var result_reply_date = reply_date.match(/[0-9]+/g);
            var call_mm = result_reply_date[1];
            var call_dd = result_reply_date[2];
            var call_HH = result_reply_date[3];
            var call_mm_dd_HH = call_mm + "/" + call_dd + "/" + call_HH;

            var return_data = get_data_from_ss_reply(call_mm, call_dd, call_HH, call_mm_dd_HH);

            try {
                var img_urls = img_reply(call_mm_dd_HH);
                message = [
                    {
                        "type": "text",
                        "text": return_data
                    },
                    {
                        "type": "image",
                        "originalContentUrl": img_urls[0],
                        "previewImageUrl": img_urls[1]
                    }
                ]

            } catch (e) {
                return_data = return_data + "\n画像の送信に失敗しました"
                message = [
                    {
                        "type": "text",
                        "text": return_data
                    }
                ]
            }




        } catch (e) {
            message = [{
                "type": "text",
                "text": e.message
            }]
        }
    }

    else if (type === "follow") {
        message = [{
            "type": "text",
            "text": "こんにちは\nwhatを送信することで各種機能を呼び出せます\n不明な点がある場合は瀧澤に問い合わせてください"
        }]

    }

    else if (type === "memberLeft") {
        message = [{
            "type": "text",
            "text": "ばいばい"
        }]
    }



    else {
        message = [{
            "type": "text",
            "text": "こんにちは\nwhatを送信することで各種機能を呼び出せます\n不明な点がある場合は瀧澤に問い合わせてください"
        }]
    }



    // リプライを返すAPIのURI
    var url = "https://api.line.me/v2/bot/message/reply";

    // お作法①　HTTPヘッダーの設定
    var headers = {
        "Content-Type": "application/json; charset=UTF-8",
        "Authorization": SECRET
    };

    // お作法②　下記の構造でリクエストボディにデータを持つ
    var data = {
        "replyToken": token,
        "messages": message
    };

    var options = {
        "method": "POST",
        "headers": headers,
        "payload": JSON.stringify(data)
    };

    // 返信！
    return UrlFetchApp.fetch(url, options);
}


function specify_datetime() {
    //今日の日付データを変数now_datetimeに格納
    var now_datetime = new Date();
    var two_weeks_ago_date = new Date();

    //年・月・日・曜日を取得する
    var year = now_datetime.getFullYear();
    var month = now_datetime.getMonth() + 1;
    month = if_figure_is_under_ten(month);
    var day = now_datetime.getDate();
    day = if_figure_is_under_ten(day);
    var hour = now_datetime.getHours();
    hour = if_figure_is_under_ten(hour);
    var minute = now_datetime.getMinutes();
    minute = if_figure_is_under_ten(minute);


    two_weeks_ago_date.setDate(day - 14);
    var year_min = two_weeks_ago_date.getFullYear();
    var month_min = two_weeks_ago_date.getMonth() + 1;
    month_min = if_figure_is_under_ten(month_min);
    var day_min = two_weeks_ago_date.getDate();
    day_min = if_figure_is_under_ten(day_min);
    var hour_min = two_weeks_ago_date.getHours();
    hour_min = if_figure_is_under_ten(hour_min);
    var minute_min = two_weeks_ago_date.getMinutes();
    minute_min = if_figure_is_under_ten(minute_min);


    var now = year + "-" + month + "-" + day + "T" + hour + ":" + minute;
    var two_weeks_ago = year_min + "-" + month_min + "-" + day_min + "T" + hour_min + ":" + minute_min;

    return [now, two_weeks_ago];
}



function if_figure_is_under_ten(figure) {
    if (figure < 10) {
        figure = "0" + figure;
        return figure;
    }
    return figure;
}



//スプレッドシートからデータを取得する関数
function get_data_from_ss_reply(call_mm, call_dd, call_HH, call_mm_dd_HH) {

    //スプレッドシートの呼び出し
    var File = SpreadsheetApp.openById(SS_ID);
    //データが記載されているシートを取得
    var Sheet = File.getSheetByName("data");
    //スプレッドシートの行数を取得
    var lastRow = Sheet.getLastRow();
    //データが記載されている領域をシートから取得
    var object = Sheet.getRange(2, 1, lastRow, 4);
    //領域内の全データを取得
    var data = object.getValues()
    //検索する日付の変数の初期化
    var search_date = "";

    //日付の検索
    for (var k = 0; k < lastRow; k++) {
        search_date = data[k][0];

        //該当する日付が見つかった場合，それぞれのデータを取得
        if (search_date === call_mm_dd_HH) {
            //気温
            var temparature = data[k][1];
            //湿度
            var humidity = data[k][2];
            //気圧
            var pressure = data[k][3];
            //LINEに送信するテキストの作成
            var text = call_mm + "月" + call_dd + "日" + call_HH + "時のデータです\n"
                + "気温:" + temparature + "℃\n湿度:" + humidity + "％\n気圧:" + pressure + "hPa";

            return text;
        }

    }
    return "該当するデータがありませんでした"
    //エラーの場合nullを返す
    return null;
}



function img_reply(call_mm_dd_HH) {

    var originalBase = "https://drive.google.com/uc?export=view&id=";
    var previewBase = "https://drive.google.com/thumbnail?sz=w240-h240&id=";

    var call_mm_dd_HH_jpg = call_mm_dd_HH + ".jpg"
    // 画像を取得してGoogleドライブに保存
    var file = DriveApp.getFolderById(FOLDER_ID).getFilesByName(call_mm_dd_HH_jpg).next();

    // 保存した画像に共有権を設定する (リンクを知っている全員が閲覧可)
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // 画像のファイルIDを取得する
    var fileId = file.getId();

    //var img_urls = new Object();
    var originalContentUrl = originalBase + fileId;
    var previewImageUrl = previewBase + fileId;

    return [originalContentUrl, previewImageUrl];
}



// LINEから画像を取得する
function get_line_content(messageId) {
    try {
        var url = "https://api.line.me/v2/bot/message/" + messageId + "/content";

        //blobに画像を格納
        var blob = UrlFetchApp.fetch(url, {
            "headers": {
                "Content-Type": "application/json; charset=UTF-8",
                "Authorization": SECRET
            },
            "method": "get"
        });
        return blob;
    } catch (e) {
        return e.message;
    }
}


// Google Cloud Visionで文字起こしを行う
function imageAnnotate(file) {
    try {
        var payload = JSON.stringify({
            "requests": [
                {
                    "image": {
                        "content": Utilities.base64Encode(file.getBlob().getBytes())
                    },
                    "features": [
                        {
                            "type": "TEXT_DETECTION"
                        }
                    ]
                }
            ]
        });

        var url = "https://vision.googleapis.com/v1/images:annotate?key=" + GOOGLE_CLOUD_VISION_API_KEY;
        var options = {
            method: "post",
            contentType: "application/json",
            payload: payload
        };

        //Vison APIに投げて,結果をresに格納
        var res = UrlFetchApp.fetch(url, options);
        var obj = JSON.parse(res.getContentText());

        //結果のJSONから文字起こし結果だけ抽出する
        if ("textAnnotations" in obj.responses[0]) {
            return obj.responses[0].textAnnotations[0].description;
        }
        return "文字を読み取れませんでした";
    }
    catch (e) {
        return e.message;
    }
}

function count_id(object, ID, where_ID) {
    try {
        var sheet = object.getSheetByName(where_ID);
        var lastRow = sheet.getLastRow()
        var range = sheet.getRange(1, 1, lastRow, 2).getValues();

        for (var i = 0; i <= lastRow - 1; i++) {
            var written_id = range[i][0];
            var counter = range[i][1];

            if (written_id === ID) {
                counter = counter + 1;
                sheet.getRange(i + 1, 2).setValue(counter);
                break;
            }
            else if (!written_id) {
                counter = 1;
                sheet.getRange(i + 1, 1).setValue(ID);
                sheet.getRange(i + 1, 2).setValue(counter);
                break;
            }
        }
        return counter;
    } catch (e) {
        return NaN;
    }
}


function push_wait_sentence(ID) {

    //LINEにデータを送信
    var postData = {
        "to": ID,
        "messages": [{
            "type": "text",
            "text": "少々お待ちください",
        }]
    };

    var url = "https://api.line.me/v2/bot/message/push";
    var headers = {
        "Content-Type": "application/json",
        'Authorization': SECRET,
    };

    var options = {
        "method": "post",
        "headers": headers,
        "payload": JSON.stringify(postData)
    };
    var response = UrlFetchApp.fetch(url, options);
}

/*
function push_steal(text_steal) {

  //LINEにデータを送信
  var postData = {
    "to": "YOUR LINE ID",
    "messages": [{
      "type": "text",
      "text": text_steal,
    }]
  };

  var url = "https://api.line.me/v2/bot/message/push";
  var headers = {
    "Content-Type": "application/json",
    'Authorization': SECRET,
  };

  var options = {
    "method": "post",
    "headers": headers,
    "payload": JSON.stringify(postData)
  };
  var response = UrlFetchApp.fetch(url, options);
}
*/