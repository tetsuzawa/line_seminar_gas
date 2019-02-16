function trashTemporaryFile() {
    var folderName = "共有設定後"; //時限削除したいフォルダの名前
    var days = 16; //バッファを見て16日

    var folders = DriveApp.getFoldersByName(folderName);
    while (folders.hasNext()) {
        var folder = folders.next();
        var files = folder.getFiles();
        while (files.hasNext()) {
            var file = files.next();
            if (new Date() - file.getLastUpdated() > days * 24 * 60 * 60 * 1000) {
                //ファイルを空に（履歴は30日間残る）
                file.setContent("");
                //ゴミ箱に（ファイル完全削除ではない）
                file.setTrashed(true);
            }
        }
    }
}