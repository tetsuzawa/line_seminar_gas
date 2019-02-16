// for LINE Messaging API
var line_endpoint = 'https://api.line.me/v2/bot/message/push';
var CHANNEL_ACCESS_TOKEN = 'WRITE YOUR LINE CHANNEL ACCESS TOKEN';
var USER_ID = 'WRITE A LINE ID TO SEND';
var FOLDER_ID = "WRITE YOUR GOOGLE DRIVE IMAGE FOLDER";

function img_push2() {

    var originalBase = 'https://drive.google.com/uc?export=view&id=';
    var previewBase = 'https://drive.google.com/thumbnail?sz=w240-h240&id=';


    // 画像を取得してGoogleドライブに保存
    var file = DriveApp.getFolderById(FOLDER_ID).getFilesByName("01/30/07.jpg").next();

    // 保存した画像に共有権を設定する (リンクを知っている全員が閲覧可)
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // 画像のファイルIDを取得する
    var fileId = file.getId();


    Logger.log('do')


    // Googleドライブ上の画像をLINEへプッシュ
    UrlFetchApp.fetch(line_endpoint, {
        'headers': {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN
        },
        'method': 'POST',
        'payload': JSON.stringify({
            'to': USER_ID,
            'messages': [{
                'type': 'image',
                'originalContentUrl': originalBase + fileId,
                'previewImageUrl': previewBase + fileId
            }]
        })
    });
}