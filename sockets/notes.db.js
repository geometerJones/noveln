var mongojs = require('mongojs');
var db = mongojs('mongodb://admin:admin123@ds015713.mlab.com:15713/novel_n', ['notes']);

var notes = {
  getAllNotes: (callback) => {
    db.notes.find(callback);
  },
  saveNotes: (note, callback) => {
    db.notes.insert(note, callback);
  },
  updateNote: (note, callback) => {
    db.notes.update({
      id: note.id
    }, note, {}, callback);
  },
  deleteNote: (id, callback) => {
    db.notes.remove({
      id: id
    }, '', callback);
  }
}

module.exports = notes;
