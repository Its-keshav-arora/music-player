const mongoose = require("mongoose");

const MusicSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
  title: {
    type: String,
    required: true,
  },
  artist: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  urlSong: {
    type: String,
    required: true,
  },
  urlCoverPic : {
    type:String,
    required : true,
  }
});

const MusicModel = mongoose.model("Music", MusicSchema);

module.exports = MusicModel;