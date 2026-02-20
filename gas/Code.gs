// ============================================================
// Pearson Key Dates Calendar — Google Apps Script Backend
// ============================================================
//
// SHEET STRUCTURE:
//   A: date (YYYY-MM-DD or any parseable format)
//   B: title
//   C: type (qualification type string)
//   D: series
//   E: description
//   F: url
//   G: id (UUID — added by backfillIds(), hidden column)
//
// DEPLOYMENT:
//   Deploy as "Web App", execute as "Me", access "Anyone".
//   Set ADMIN_SECRET in Project Settings > Script Properties.
// ============================================================

var SHEET_NAME = 'Key Dates';
var DATA_START_ROW = 2; // Row 1 is headers
var ID_COLUMN = 7;      // Column G

// ─────────────────────────────────────────────────────────────
// READ — doGet() (existing, preserved)
// ─────────────────────────────────────────────────────────────

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var data = getFormattedData(sheet);
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getFormattedData(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow < DATA_START_ROW) return [];

  var range = sheet.getRange(DATA_START_ROW, 1, lastRow - DATA_START_ROW + 1, ID_COLUMN);
  var values = range.getValues();

  return values
    .filter(function(row) { return row[0] || row[1]; }) // skip fully empty rows
    .map(function(row) {
      var rawDate = row[0];
      var dateStr = '';
      if (rawDate instanceof Date) {
        dateStr = Utilities.formatDate(rawDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      } else if (rawDate) {
        dateStr = String(rawDate);
      }
      return {
        date:        dateStr,
        title:       row[1] ? String(row[1]) : '',
        type:        row[2] ? String(row[2]) : '',
        series:      row[3] ? String(row[3]) : '',
        description: row[4] ? String(row[4]) : '',
        url:         row[5] ? String(row[5]) : '',
        id:          row[6] ? String(row[6]) : '',
      };
    });
}

// ─────────────────────────────────────────────────────────────
// WRITE — doPost() (new)
// ─────────────────────────────────────────────────────────────

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);

    // Validate secret
    var secret = PropertiesService.getScriptProperties().getProperty('ADMIN_SECRET');
    if (!secret || payload.secret !== secret) {
      return jsonResponse({ error: 'Unauthorized' });
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    switch (payload.action) {
      case 'bulkReplace':
        handleBulkReplace(sheet, payload.rows);
        return jsonResponse({ ok: true, count: payload.rows.length });

      case 'bulkAppend':
        handleBulkAppend(sheet, payload.rows);
        return jsonResponse({ ok: true, count: payload.rows.length });

      case 'upsertRow':
        var result = handleUpsertRow(sheet, payload.row);
        return jsonResponse({ ok: true, id: result.id });

      case 'deleteRow':
        handleDeleteRow(sheet, payload.rowId);
        return jsonResponse({ ok: true });

      default:
        return jsonResponse({ error: 'Unknown action: ' + payload.action });
    }
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─────────────────────────────────────────────────────────────
// WRITE HANDLERS
// ─────────────────────────────────────────────────────────────

function handleBulkReplace(sheet, rows) {
  var lastRow = sheet.getLastRow();
  if (lastRow >= DATA_START_ROW) {
    sheet.deleteRows(DATA_START_ROW, lastRow - DATA_START_ROW + 1);
  }
  appendRows(sheet, rows);
}

function handleBulkAppend(sheet, rows) {
  appendRows(sheet, rows);
}

function handleUpsertRow(sheet, row) {
  // Try to find existing row by id
  if (row.id) {
    var rowIndex = findRowById(sheet, row.id);
    if (rowIndex !== -1) {
      writeRowValues(sheet, rowIndex, row);
      return { id: row.id };
    }
  }
  // Not found — append as new
  var newId = generateUUID();
  appendRows(sheet, [Object.assign({}, row, { id: newId })]);
  return { id: newId };
}

function handleDeleteRow(sheet, rowId) {
  var rowIndex = findRowById(sheet, rowId);
  if (rowIndex === -1) throw new Error('Row not found: ' + rowId);
  sheet.deleteRow(rowIndex);
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function appendRows(sheet, rows) {
  rows.forEach(function(row) {
    var id = row.id || generateUUID();
    sheet.appendRow([
      row.date || '',
      row.title || '',
      row.type || '',
      row.series || '',
      row.description || '',
      row.url || '',
      id,
    ]);
  });
}

function writeRowValues(sheet, rowIndex, row) {
  sheet.getRange(rowIndex, 1, 1, ID_COLUMN).setValues([[
    row.date || '',
    row.title || '',
    row.type || '',
    row.series || '',
    row.description || '',
    row.url || '',
    row.id || '',
  ]]);
}

function findRowById(sheet, id) {
  var lastRow = sheet.getLastRow();
  if (lastRow < DATA_START_ROW) return -1;
  var ids = sheet.getRange(DATA_START_ROW, ID_COLUMN, lastRow - DATA_START_ROW + 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) return DATA_START_ROW + i;
  }
  return -1;
}

function generateUUID() {
  return Utilities.getUuid();
}

// ─────────────────────────────────────────────────────────────
// ONE-TIME SETUP — Run manually in GAS editor after deploy
// ─────────────────────────────────────────────────────────────

/**
 * backfillIds — run once to add UUIDs to all rows that have no id in column G.
 * Safe to run multiple times — only fills empty cells.
 */
function backfillIds() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var lastRow = sheet.getLastRow();
  if (lastRow < DATA_START_ROW) {
    Logger.log('No data rows found.');
    return;
  }

  var idCol = sheet.getRange(DATA_START_ROW, ID_COLUMN, lastRow - DATA_START_ROW + 1, 1);
  var values = idCol.getValues();
  var filled = 0;

  values.forEach(function(row, i) {
    if (!row[0]) {
      values[i][0] = generateUUID();
      filled++;
    }
  });

  idCol.setValues(values);
  Logger.log('backfillIds: filled ' + filled + ' empty IDs out of ' + values.length + ' rows.');
}

// ─────────────────────────────────────────────────────────────
// LEGACY — Google Calendar sync functions (preserved, untouched)
// Add your existing syncCalendarByType() and related functions below.
// ─────────────────────────────────────────────────────────────
