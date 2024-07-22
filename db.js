const mongoose = require("mongoose");
const MusicPlayer = require("./models/SongCard");

main()
  .then((res) => {
    console.log("Connection Successful");
  })
  .catch((err) => {
    console.log(err);
  });
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/MusicPlayer");
}

const MusicCards = [
  {
    id: 1,
    title: "Badnaam Song",
    artist: "Mankirat Aulalkh",
    year: 2017,
  },
  {
    id: 2,
    title: "Lily Girl",
    artist: "Alan Walker",
    year: 2006,
  },
  {
    id: 3,
    title: "On My Way",
    artist: "Alan Walker",
    year: 2016,
  },
  {
    id: 4,
    title: "Fly Away",
    artist: "The FatRat",
    year: 2012,
  },  
];

MusicPlayer.insertMany(MusicCards);