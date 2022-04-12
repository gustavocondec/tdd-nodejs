import {server} from "../src/config";
import request from 'supertest'

let serverLocal = request(server)

describe('Test Get / mascota', ()=>{
  test('Returns Array of Mascotas in field data', async ()=>{
    let response = await serverLocal.get('/mascotas').send()

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty(['data'])
    expect(Array.isArray(response.body.data)).toBe(true)
  })
  test('Array Returned has elements with fields IMascota',async ()=>{
    let fieldsMascota = ['id', 'name', 'species', 'age', 'owner']

    let response = await serverLocal.get('/mascotas')
    if(response.body.data.length>=1){
      let mascota = response.body.data[0]
      let fields = Object.getOwnPropertyNames(mascota)
      expect(fieldsMascota.reduce((acc, curr)=>{
        if(fields.indexOf(curr)==-1) acc = false
        return acc
      }, true)).toBe(true)
    }
  })
  test('Obtain mascota by Id existing, returns in data field', async ()=>{
    let idSearch = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'

    let response = await serverLocal.get(`/mascotas/${idSearch}`)

    expect(response.status).toBe(200)

    let mascota = response.body.data

    expect(mascota.name).toBe('Juan')

  })

  test('Obtain error 404 search mascota by id not existing', async ()=>{
    let idSearch = 'dsadsadsaa'

    let response = await serverLocal.get(`/mascotas/${idSearch}`)

    expect(response.status).toBe(404)
  })
})


describe('Test Post /mascota', ()=>{
  let newMascota = {
    name: 'Boby',
    species: 'Perro',
    age: 5,
    owner: 'Pedro'
  }
  let sizeOld = 0
  beforeEach(async ()=>{
    sizeOld = (await serverLocal.get('/mascotas')).body.data.length
  })

  test('Send fields of IMascota to create and return Mascota created with id in field data', async ()=>{


    let response = await serverLocal.post('/mascotas').send(newMascota)
    let mascotaResponse = response.body.data

    expect(mascotaResponse.name).toBe(newMascota.name)
    expect(mascotaResponse.species).toBe(newMascota.species)
    expect(mascotaResponse.age).toBe(newMascota.age)
    expect(mascotaResponse.owner).toBe(newMascota.owner)
    expect(mascotaResponse.id).toEqual(expect.any(String))
  })

  test('When crated new Mascota, change size +1 of returned in Get /Mascotas', async ()=>{

     await serverLocal.post('/mascotas').send(newMascota)

    let newResponse = await serverLocal.get('/mascotas')

    expect(newResponse.body.data.length).toEqual(sizeOld+1)

  })

  test('When created, add id unique to mascota', async()=>{
    await serverLocal.post('/mascotas').send(newMascota)

    let newResponse = await serverLocal.get('/mascotas')

    let ids = newResponse.body.data.map((m: { id: number; })=>m.id)
    let lengthIds = ids.length

    let idsUniques = new Set(ids) // eliminar ids duplicados

    expect(lengthIds).toBe(idsUniques.size)

  })
})

describe('PUT /mascotas', ()=>{
  let original = {
    id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    name: 'Juan',
    species: 'Gato',
    age: 8,
    owner: 'Pepe'
  }
  let newDatos = {
    name: 'Juan 2',
    species: 'Gato 2'
  }
  beforeEach(async ()=>{

  })
  test('Edit element by id, send fields modified and return element edited in field data, ' +
    'preserve fields not modified', async ()=>{
    let {body} = await serverLocal.put(`/mascotas/${original.id}`).send(newDatos)


    expect(body.data.name).toBe(newDatos.name)
    expect(body.data.species).toBe(newDatos.species)

    expect(body.data.id).toBe(original.id)
    expect(body.data.age).toBe(original.age)
    expect(body.data.owner).toBe(original.owner)

  })
  test('Return status 404 if id not exist', async ()=>{
    let {status} = await serverLocal.put(`/mascotas/id_no_existe`).send(newDatos)
    expect(status).toBe(404)
  })
  test ('Corroborate modification with call Get/Mascotas', async ()=>{
    await serverLocal.put(`/mascotas/${original.id}`).send(newDatos)

    let {body : {data}} =  await serverLocal.get('/mascotas')

    let mascotaModified = data.find((m: { id: string; })=>m.id==original.id)

    expect(mascotaModified.name).toBe(newDatos.name)
    expect(mascotaModified.species).toBe(newDatos.species)

    expect(mascotaModified.id).toBe(original.id)
    expect(mascotaModified.age).toBe(original.age)
    expect(mascotaModified.owner).toBe(original.owner)

  })
})


describe('Test DELETE /mascotas', ()=>{
  let id= '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
  let lengthOld=0
  beforeEach(async ()=>{
    lengthOld = (await serverLocal.get(`/mascotas`)).body.data.length
  })
  test('Delete by Id, change size  array from get mascotas',async ()=>{
    await serverLocal.delete(`/mascotas/${id}`)

    let lengthNew = (await serverLocal.get('/mascotas')).body.data.length

    expect(lengthNew).toBe(lengthOld-1)
  })
  test('If id to delete not exist return status 404', async ()=>{
    let id_not_exist = 'dafaaerfar'
    let {status } = await serverLocal.delete(`/mascotas/${id_not_exist}`)
    expect(status).toBe(404)
  })
})
