const app = require('./server')
const PORT = process.env.PORT || 3333

app.listen(PORT, err=>{
  if(err) throw new Error('The server connection failed...')
  console.log(`Server is running on port ${PORT}!`);
})