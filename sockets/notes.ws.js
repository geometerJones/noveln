var notesDB = require('./notes.db');

module.exports = function(io) {
  var notes = io.of('/notes');

  notes.on('connection', (socket) => {
    socket.on('getAllNotes', () => {
      dispatchAll(socket);
    });
    socket.on('saveNote', (note) => {
      notesDB.saveNote(note, (err, data) => {
        if (err) throw err;
        dispatchAll(socket);
      });
    });
    socket.on('updateNote', (data) => {
      notesDB.updateNote(data, (err, data) => {
        if (err) throw err;
        dispatchAll(socket);
      });
    });
    socket.on('deleteNote', (data) => {
      notesDB.deleteNote(data.id, (err, data) => {
        if (err) throw err;
        dispatchAll(socket);
      });
    });

    dispatchAll(socket);
  });

  function dispatchAll(socket) {
    notesDB.getAllNotes((err, data) => {
      if (err) throw err;
      io.of('/notes').emit('allNotes', data);
    });
  }

  return notes;
}

