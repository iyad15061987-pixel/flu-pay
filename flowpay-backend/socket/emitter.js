const emit = (
  event,
  payload
) => {

  if (!global.io) {
    return;
  }

  global.io.emit(
    event,
    payload
  );

};

module.exports = emit;