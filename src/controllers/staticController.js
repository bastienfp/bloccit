module.exports = {
  index(req, res, next){
    res.send("static/index", {title: "Welcome to Bloccit"});
  }
}
