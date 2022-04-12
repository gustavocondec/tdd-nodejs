import express from 'express'
import { v4 as uuidv4 } from 'uuid';

const server = express()

export interface IMascota{
  id:string,
  name: string,
  species: string,
  age: number,
  owner: string
}


let mascotas:IMascota[] = [{
  id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
  name: 'Juan',
  species: 'Gato',
  age: 8,
  owner: 'Pepe'
}]


server.use(express.json())

server.get('/mascotas', (req,res)=>{
  res.status(200).json({
    data: mascotas
  })
})

server.get('/mascotas/:id', (req,res)=>{
  let {id} = req.params

  let mascotaIndex = mascotas.findIndex((m)=>m.id==id)
  if(mascotaIndex>=0) {
    res.status(200).json({data:mascotas[mascotaIndex]})
  }
  else {
    res.status(404).send()
  }
})


server.post('/mascotas', (req,res)=>{
  let {name, species, age,owner} = req.body

  let newMascota = {
    id: uuidv4(),
    name,
    species,
    age,
    owner
  }
  mascotas.push(newMascota)
  res.status(200).send({
    data: newMascota
  })
})


server.put('/mascotas/:id',(req,res)=>{
  let {id} = req.params
  let { name, species, age,owner} = req.body

  let mascotaIndex= mascotas.findIndex((m)=>m.id==id)
  if(mascotaIndex==-1) res.status(404).send()
  else {
    let mascota = Object.assign({},mascotas[mascotaIndex])
    if(name) mascota.name = name
    if(species) mascota.species = species
    if(age) mascota.age = age
    if(owner) mascota.owner =owner

    mascotas[mascotaIndex] = mascota
    res.status(200).json({
      data: mascota
    })
  }
})

server.delete('/mascotas/:id',(req,res)=>{
  let {id} = req.params
  let mascotaIndex= mascotas.findIndex((m)=>m.id==id)
  if(mascotaIndex==-1) return res.status(404).send()
  mascotas.splice(mascotaIndex,1)
  res.status(200).send()
})

export {
  server
}
