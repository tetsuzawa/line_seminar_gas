var SS_ID = "WRITE YOUR TEMP_HUMI_PRESS_DATA SPREADSHEET ID";

function set_counter_to_zero_main() {
    set_counter_to_zero("USER_ID");
    set_counter_to_zero("GROUP_ID");
    set_counter_to_zero("ROOM_ID");
}

function set_counter_to_zero(where_ID) {
    var object = SpreadsheetApp.openById(SS_ID);

    try {
        var sheet = object.getSheetByName(where_ID);
        var lastRow = sheet.getLastRow()
        var range = sheet.getRange(1, 2, lastRow, 2).getValues();

        for (var i = 0; i <= lastRow - 1; i++) {
            range[i][0] = 0;
        }
        sheet.getRange(1, 2, lastRow, 2).setValues(range);

    } catch (e) {
        Logger.log(e.message)
    }
}