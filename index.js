import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "worlds",
  password: "traslan2003trA",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function checkVisited() {
  const result = await db.query("SELECT plaka FROM visited_city");
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.plaka);
  });
  console.log(result.rows);
  return countries;
}

app.get("/", async (req, res) => {
  const countries = await checkVisited();
  res.render("index.ejs", { countries: JSON.stringify(countries), total: countries.length });

});

app.post("/add", async (req, res) => {
  const input = req.body["city"];

  try {
    const result = await db.query("SELECT plaka FROM city WHERE il_adi=$1", [input]);

    if (result.rows.length !== 0) {
      const data = result.rows[0];
      const plaka_no = data.plaka;

      const visitedCheck = await db.query("SELECT * FROM visited_city WHERE plaka=$1", [plaka_no]);
      if (visitedCheck.rows.length === 0) {
        await db.query("INSERT INTO visited_city (plaka) VALUES ($1)", [plaka_no]);
        res.redirect("/");
      } else {
        
       console.log("şehir önceden eklendi");
        res.redirect("/");
      }
    } else {
      throw new Error("Şehir bulunamadı!");
    }
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
