const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};
const convertPlayerNameObjectcamelCase = (each) => {
  return {
    playerId: each.player_id,
    playerName: each.player_name,
    jerseyNumber: each.jersey_number,
    role: each.role,
  };
};

initializeDBAndServer();
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
// GET Players API
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT 
      * 
    FROM 
     cricket_team;`;
  const playerArray = await db.all(getPlayersQuery);
  response.send(
    playerArray.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

//Add Player API
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { player_name, jersey_number, role } = playerDetails;
  const addPlayerQuery = `
  INSERT INTO
    cricket_team (player_name,jersey_number,role)
  VALUES
    (
        '${player_name}',
        '${jersey_number}',
        '${role}'
    );`;
  const dbResponse = await db.run(addPlayerQuery);
  const movie_id = dbResponse.lastID;
  response.send("Player Added to Team");
});

//GET Player API
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT 
      * 
    FROM 
     cricket_team
    WHERE 
     player_id = ${playerId};`;

  const player = await db.get(getPlayerQuery);

  const playerValue = convertPlayerNameObjectcamelCase(player);
  console.log(playerValue);
  response.send(playerValue);
});
//Update Player API
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  //console.log({ directorId });
  const playerDetails = request.body;
  const { player_name, jersey_number, role } = playerDetails;
  const updateMovieQuery = `
    UPDATE
     cricket_team
    SET
     player_name = '${player_name}',
     jersey_number = '${jersey_number}',
     role = '${role}'
    WHERE
     player_id = ${playerId};`;
  await db.run(updateMovieQuery);
  response.send("Player Details Updated");
});

//Remove Player API
app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM 
    cricket_team
    WHERE 
    player_id =${playerId}`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
